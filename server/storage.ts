import { InsertUser, InsertBrand, InsertReview, InsertCategory, User, Brand, Review, Category } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private brands: Map<number, Brand>;
  private reviews: Map<number, Review>;
  private categories: Map<number, Category>;
  private currentIds: { [key: string]: number };
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.brands = new Map();
    this.reviews = new Map();
    this.categories = new Map();
    this.currentIds = { users: 1, brands: 1, reviews: 1, categories: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Initialize with some categories
    const defaultCategories = [
      "Gymwear",
      "Home Appliances",
      "Accessories",
      "Beauty Products",
      "Fashion",
      "Food & Beverages",
      "Tech Gadgets",
      "Art & Crafts",
    ];

    defaultCategories.forEach((name) => {
      this.createCategory({ name });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBrand(id: number): Promise<Brand | undefined> {
    return this.brands.get(id);
  }

  async getBrandByInstagramHandle(handle: string): Promise<Brand | undefined> {
    return Array.from(this.brands.values()).find(
      (brand) => brand.instagramHandle === handle,
    );
  }

  async getBrands(): Promise<Brand[]> {
    return Array.from(this.brands.values());
  }

  async getBrandsByCategory(categoryId: number): Promise<Brand[]> {
    return Array.from(this.brands.values()).filter(
      (brand) => brand.categoryId === categoryId,
    );
  }

  async searchBrands(query: string): Promise<Brand[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.brands.values()).filter(
      (brand) =>
        brand.name.toLowerCase().includes(lowercaseQuery) ||
        brand.instagramHandle.toLowerCase().includes(lowercaseQuery),
    );
  }

  async createBrand(insertBrand: InsertBrand): Promise<Brand> {
    const id = this.currentIds.brands++;
    const now = new Date();
    const brand = { ...insertBrand, id, createdAt: now };
    this.brands.set(id, brand);
    return brand;
  }

  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByBrand(brandId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.brandId === brandId,
    );
  }

  async getUserReviewForBrand(
    userId: number,
    brandId: number,
  ): Promise<Review | undefined> {
    return Array.from(this.reviews.values()).find(
      (review) => review.userId === userId && review.brandId === brandId,
    );
  }

  async createReview(
    review: InsertReview & { userId: number },
  ): Promise<Review> {
    const id = this.currentIds.reviews++;
    const now = new Date();
    const newReview = { ...review, id, createdAt: now };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentIds.categories++;
    const category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
}

export const storage = new MemStorage();
