import { pgTable, text, varchar, decimal, jsonb, boolean, timestamp, pgEnum, integer, serial } from "drizzle-orm/pg-core";

// Enums
export const genderEnum = pgEnum("gender", ["Men", "Women", "Unisex"]);
export const productVisibilityEnum = pgEnum("product_visibility", ["public", "seo_only"]);

// Products/Perfumes Table
export const products = pgTable("products", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  inspiration: varchar("inspiration", { length: 255 }).notNull(),
  inspirationBrand: varchar("inspiration_brand", { length: 255 }).notNull(),
  woreBy: varchar("wore_by", { length: 255 }),
  woreByImageUrl: varchar("wore_by_image_url", { length: 2048 })
    .notNull()
    .default("https://placehold.co/600x600?text=Celeb"),
  category: varchar("category", { length: 100 }).notNull(),
  categoryId: varchar("category_id", { length: 100 }).notNull(),
  gender: genderEnum("gender").notNull(),
  images: jsonb("images").$type<string[]>().notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceCurrency: varchar("price_currency", { length: 3 }).notNull().default("INR"),
  description: text("description").notNull(),
  seoDescription: text("seo_description").notNull(),
  seoKeywords: jsonb("seo_keywords").$type<string[]>().notNull(),
  badges: jsonb("badges")
    .$type<{
      bestSeller?: boolean;
      humeSpecial?: boolean;
      limitedStock?: boolean;
    }>()
    .notNull()
    .default({}),
  notes: jsonb("notes").$type<{
    top: string[];
    heart: string[];
    base: string[];
  }>().notNull(),
  longevity: jsonb("longevity").$type<{
    duration: string;
    sillage: string;
    season: string[];
    occasion: string[];
  }>().notNull(),
  size: varchar("size", { length: 50 }).notNull(),
  primaryBlogSlug: varchar("primary_blog_slug", { length: 255 }),
  visibility: productVisibilityEnum("visibility").notNull().default("public"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reviews Table
export const reviews = pgTable("reviews", {
  id: varchar("id", { length: 255 }).primaryKey(),
  productId: varchar("product_id", { length: 255 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  author: varchar("author", { length: 255 }).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  date: varchar("date", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Blog Posts Table
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  seoTitle: varchar("seo_title", { length: 500 }).notNull(),
  seoDescription: text("seo_description").notNull(),
  seoKeywords: jsonb("seo_keywords").$type<string[]>().notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  date: varchar("date", { length: 50 }).notNull(),
  readTime: varchar("read_time", { length: 50 }).notNull(),
  featured: boolean("featured").default(false).notNull(),
  imageUrl: varchar("image_url", { length: 2048 }),
  relatedProductId: varchar("related_product_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bottles Table
export const bottles = pgTable("bottles", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  imageUrl: varchar("image_url", { length: 2048 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceCurrency: varchar("price_currency", { length: 3 }).notNull().default("INR"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Accessories Table
export const accessories = pgTable("accessories", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  images: jsonb("images").$type<string[]>().notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceCurrency: varchar("price_currency", { length: 3 }).notNull().default("INR"),
  isComplementary: boolean("is_complementary").notNull().default(false),
  giftTier: integer("gift_tier"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Images Library Table
export const images = pgTable("images", {
  id: varchar("id", { length: 255 }).primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  url: varchar("url", { length: 2048 }).notNull(),
  link: varchar("link", { length: 2048 }),
  usage: varchar("usage", { length: 100 }).notNull().default("general"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Coupons Table
export const coupons = pgTable("coupons", {
  id: varchar("id", { length: 255 }).primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  minSubtotal: decimal("min_subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  active: boolean("active").notNull().default(true),
  displayInCart: boolean("display_in_cart").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Product multi-category mapping
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  productId: varchar("product_id", { length: 255 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id", { length: 100 }).notNull(),
  categoryLabel: varchar("category_label", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Consent Capture Events
export const consentEvents = pgTable("consent_events", {
  id: varchar("id", { length: 255 }).primaryKey(),
  decision: varchar("decision", { length: 20 }).notNull(), // allow | deny
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  path: varchar("path", { length: 2048 }),
  referrer: varchar("referrer", { length: 2048 }),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: text("user_agent"),
  language: varchar("language", { length: 50 }),
  timezone: varchar("timezone", { length: 100 }),
  platform: varchar("platform", { length: 100 }),
  screenWidth: integer("screen_width"),
  screenHeight: integer("screen_height"),
  cookieEnabled: boolean("cookie_enabled"),
  data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cart analytics events (no consent-gating, anonymous session based)
export const cartEvents = pgTable("cart_events", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  eventType: varchar("event_type", { length: 80 }).notNull(), // cart_open | add_to_cart | update_cart_quantity | remove_from_cart
  path: varchar("path", { length: 2048 }),
  productId: varchar("product_id", { length: 255 }),
  productName: varchar("product_name", { length: 255 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  quantity: integer("quantity"),
  isGift: boolean("is_gift"),
  country: varchar("country", { length: 8 }),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: text("user_agent"),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Checkout draft captures (anonymous session based, partial or complete)
export const checkoutDrafts = pgTable("checkout_drafts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 50 }).notNull().default("started"), // started | partial | complete | whatsapp_initiated
  path: varchar("path", { length: 2048 }),
  acquisitionSource: varchar("acquisition_source", { length: 100 }),
  acquisitionCategory: varchar("acquisition_category", { length: 50 }),
  acquisitionReferrerHost: varchar("acquisition_referrer_host", { length: 255 }),
  fullName: varchar("full_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  addressLine1: text("address_line_1"),
  addressLine2: text("address_line_2"),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 255 }),
  pincode: varchar("pincode", { length: 20 }),
  notes: text("notes"),
  lastEditedField: varchar("last_edited_field", { length: 100 }),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  shippingFee: decimal("shipping_fee", { precision: 10, scale: 2 }),
  grandTotal: decimal("grand_total", { precision: 10, scale: 2 }),
  cartSnapshot: jsonb("cart_snapshot")
    .$type<
      Array<{
        id: string;
        name: string;
        inspiration?: string;
        size?: string;
        quantity: number;
        price: number;
        isGift?: boolean;
      }>
    >()
    .notNull()
    .default([]),
  country: varchar("country", { length: 8 }),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  whatsappInitiatedAt: timestamp("whatsapp_initiated_at"),
});

// Export types
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type Bottle = typeof bottles.$inferSelect;
export type NewBottle = typeof bottles.$inferInsert;
export type Accessory = typeof accessories.$inferSelect;
export type NewAccessory = typeof accessories.$inferInsert;
export type ImageAsset = typeof images.$inferSelect;
export type NewImageAsset = typeof images.$inferInsert;
export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
export type ProductCategory = typeof productCategories.$inferSelect;
export type NewProductCategory = typeof productCategories.$inferInsert;
export type ConsentEvent = typeof consentEvents.$inferSelect;
export type NewConsentEvent = typeof consentEvents.$inferInsert;
export type CartEvent = typeof cartEvents.$inferSelect;
export type NewCartEvent = typeof cartEvents.$inferInsert;
export type CheckoutDraft = typeof checkoutDrafts.$inferSelect;
export type NewCheckoutDraft = typeof checkoutDrafts.$inferInsert;
