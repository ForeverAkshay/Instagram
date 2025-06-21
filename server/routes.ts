
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertBrandSchema, insertReviewSchema, contactMessages } from "@shared/schema";
import { z } from "zod";

const contactMessageSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Categories
  app.get("/api/categories", async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // Brands
  app.get("/api/brands", async (req, res) => {
    const categoryId = req.query.categoryId
      ? parseInt(req.query.categoryId as string)
      : undefined;
    const query = req.query.q as string | undefined;

    let brands;
    if (categoryId) {
      brands = await storage.getBrandsByCategory(categoryId);
    } else if (query) {
      brands = await storage.searchBrands(query);
    } else {
      brands = await storage.getBrands();
    }

    res.json(brands);
  });

  app.get("/api/brands/:id", async (req, res) => {
    const brand = await storage.getBrand(parseInt(req.params.id));
    if (!brand) return res.sendStatus(404);
    res.json(brand);
  });

  app.post("/api/brands", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const parseResult = insertBrandSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }

    const existingBrand = await storage.getBrandByInstagramHandle(
      parseResult.data.instagramHandle,
    );
    if (existingBrand) {
      return res.status(400).send("Brand with this Instagram handle already exists");
    }

    const brand = await storage.createBrand(parseResult.data);
    res.status(201).json(brand);
  });

  // Reviews
  app.get("/api/brands/:brandId/reviews", async (req, res) => {
    const reviews = await storage.getReviewsByBrand(parseInt(req.params.brandId));
    res.json(reviews);
  });

  app.post("/api/brands/:brandId/reviews", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const parseResult = insertReviewSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }

    const existingReview = await storage.getUserReviewForBrand(
      req.user!.id,
      parseInt(req.params.brandId),
    );
    if (existingReview) {
      return res.status(400).send("You have already reviewed this brand");
    }

    const review = await storage.createReview({
      ...parseResult.data,
      userId: req.user!.id,
      brandId: parseInt(req.params.brandId),
    });
    res.status(201).json(review);
  });

  // Contact Messages
  app.post("/api/contact", async (req, res) => {
    const parseResult = contactMessageSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }
    
    // Use the db import directly instead of trying to access it through storage
    const message = await storage.createContactMessage(parseResult.data);
    res.status(201).json(message);
  });

  // Admin route to view contact messages (only for admin users)
  app.get("/api/admin/contact-messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Check if user is admin
    const user = await storage.getUser(req.user!.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const messages = await storage.getContactMessages();
    res.json(messages);
  });



  const httpServer = createServer(app);
  return httpServer;
}
