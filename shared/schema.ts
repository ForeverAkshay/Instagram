import { pgTable, text, serial, integer, timestamp, real, uniqueIndex, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  instagramHandle: text("instagram_handle").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
}));

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  brands: many(brands),
}));

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  instagramHandle: text("instagram_handle").notNull().unique(),
  description: text("description"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brandsRelations = relations(brands, ({ one, many }) => ({
  category: one(categories, {
    fields: [brands.categoryId],
    references: [categories.id],
  }),
  reviews: many(reviews),
}));

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  brandId: integer("brand_id").notNull().references(() => brands.id),
  rating: real("rating").notNull(),
  reviewText: text("review_text").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    userBrandIdx: uniqueIndex("user_brand_idx").on(table.userId, table.brandId),
  };
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  brand: one(brands, {
    fields: [reviews.brandId],
    references: [brands.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  instagramHandle: true,
});

export const insertBrandSchema = createInsertSchema(brands).pick({
  name: true,
  instagramHandle: true,
  description: true,
  logoUrl: true,
  websiteUrl: true,
  categoryId: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  brandId: true,
  rating: true,
  reviewText: true,
  imageUrl: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

// Contact Messages
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  message: true,
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export type User = typeof users.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Category = typeof categories.$inferSelect;

// Extended review type that includes user Instagram handle
export type ReviewWithUser = Review & {
  userInstagramHandle: string;
};
