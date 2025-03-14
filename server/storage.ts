import { InsertUser, InsertBrand, InsertReview, InsertCategory, User, Brand, Review, Category } from "@shared/schema";
import { users, brands, reviews, categories } from "@shared/schema";
import { db } from "./db";
import { eq, like, or, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Brand operations
  getBrand(id: number): Promise<Brand | undefined>;
  getBrandByInstagramHandle(handle: string): Promise<Brand | undefined>;
  getBrands(): Promise<Brand[]>;
  getBrandsByCategory(categoryId: number): Promise<Brand[]>;
  searchBrands(query: string): Promise<Brand[]>;
  createBrand(brand: InsertBrand): Promise<Brand>;

  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByBrand(brandId: number): Promise<Review[]>;
  getUserReviewForBrand(userId: number, brandId: number): Promise<Review | undefined>;
  createReview(review: InsertReview & { userId: number }): Promise<Review>;

  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getBrand(id: number): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand;
  }

  async getBrandByInstagramHandle(handle: string): Promise<Brand | undefined> {
    const [brand] = await db
      .select()
      .from(brands)
      .where(eq(brands.instagramHandle, handle));
    return brand;
  }

  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands);
  }

  async getBrandsByCategory(categoryId: number): Promise<Brand[]> {
    return await db
      .select()
      .from(brands)
      .where(eq(brands.categoryId, categoryId));
  }

  async searchBrands(query: string): Promise<Brand[]> {
    const searchQuery = `%${query.toLowerCase()}%`;
    return await db
      .select()
      .from(brands)
      .where(
        or(
          like(brands.name, searchQuery),
          like(brands.instagramHandle, searchQuery)
        )
      );
  }

  async createBrand(insertBrand: InsertBrand): Promise<Brand> {
    const [brand] = await db.insert(brands).values(insertBrand).returning();
    return brand;
  }

  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }

  async getReviewsByBrand(brandId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.brandId, brandId));
  }

  async getUserReviewForBrand(
    userId: number,
    brandId: number
  ): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(
        and(eq(reviews.userId, userId), eq(reviews.brandId, brandId))
      );
    return review;
  }

  async createReview(
    review: InsertReview & { userId: number }
  ): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return category;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }
}

export const storage = new DatabaseStorage();