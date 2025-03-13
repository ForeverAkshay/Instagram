import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  instagramHandle: text("instagram_handle").notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  instagramHandle: text("instagram_handle").notNull().unique(),
  categoryId: integer("category_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  brandId: integer("brand_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  instagramHandle: true,
});

export const insertBrandSchema = createInsertSchema(brands).pick({
  name: true,
  instagramHandle: true,
  categoryId: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  brandId: true,
  rating: true,
  comment: true,
  photoUrl: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type User = typeof users.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Category = typeof categories.$inferSelect;
