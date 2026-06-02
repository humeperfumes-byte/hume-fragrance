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
      soldOut?: boolean;
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
  avatarUrl: varchar("avatar_url", { length: 2048 }),
  reviewerCity: varchar("reviewer_city", { length: 255 }),
  reviewerLanguage: varchar("reviewer_language", { length: 50 }),
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
  mimeType: varchar("mime_type", { length: 100 }),
  sizeBytes: integer("size_bytes"),
  dataBase64: text("data_base64"),
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
  welcomeBackMode: varchar("welcome_back_mode", { length: 30 }).notNull().default("cap_5"),
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
  eventType: varchar("event_type", { length: 80 }).notNull(), // cart_open | add_to_cart | update_cart_quantity | remove_from_cart | coupon_auto_applied
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
  utmSource: varchar("utm_source", { length: 120 }),
  utmMedium: varchar("utm_medium", { length: 120 }),
  utmCampaign: varchar("utm_campaign", { length: 180 }),
  utmTerm: varchar("utm_term", { length: 180 }),
  utmContent: varchar("utm_content", { length: 180 }),
  fullName: varchar("full_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  alternatePhone: varchar("alternate_phone", { length: 50 }),
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
  pricingBreakdown: jsonb("pricing_breakdown").$type<Record<string, unknown>>().notNull().default({}),
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
          kitSelections?: Array<{
            id: string;
            name: string;
            inspiration?: string;
          }>;
          sampleSelections?: Array<{
            id: string;
            name: string;
            inspiration?: string;
          }>;
        }>
      >()
    .notNull()
    .default([]),
  country: varchar("country", { length: 8 }),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: text("user_agent"),
  leadStatus: varchar("lead_status", { length: 50 }).notNull().default("new"),
  leadNotes: text("lead_notes"),
  lastContactedAt: timestamp("last_contacted_at"),
  nextFollowUpAt: timestamp("next_follow_up_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  whatsappInitiatedAt: timestamp("whatsapp_initiated_at"),
});

// Order intents captured when customer proceeds to WhatsApp checkout
export const orders = pgTable("orders", {
  id: varchar("id", { length: 255 }).primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("whatsapp_initiated"),
  checkoutChannel: varchar("checkout_channel", { length: 50 }).notNull().default("whatsapp"),
  paymentMethod: varchar("payment_method", { length: 100 }),
  shippingMethod: varchar("shipping_method", { length: 100 }),
  fulfillmentCarrier: varchar("fulfillment_carrier", { length: 100 }),
  trackingNumber: varchar("tracking_number", { length: 120 }),
  trackingUrl: varchar("tracking_url", { length: 2048 }),
  trackingStatus: varchar("tracking_status", { length: 80 }),
  trackingLastCheckedAt: timestamp("tracking_last_checked_at"),
  path: varchar("path", { length: 2048 }),
  acquisitionSource: varchar("acquisition_source", { length: 100 }),
  acquisitionCategory: varchar("acquisition_category", { length: 50 }),
  acquisitionReferrerHost: varchar("acquisition_referrer_host", { length: 255 }),
  utmSource: varchar("utm_source", { length: 120 }),
  utmMedium: varchar("utm_medium", { length: 120 }),
  utmCampaign: varchar("utm_campaign", { length: 180 }),
  utmTerm: varchar("utm_term", { length: 180 }),
  utmContent: varchar("utm_content", { length: 180 }),
  fullName: varchar("full_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  alternatePhone: varchar("alternate_phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  addressLine1: text("address_line_1"),
  addressLine2: text("address_line_2"),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 255 }),
  pincode: varchar("pincode", { length: 20 }),
  notes: text("notes"),
  appliedCouponCode: varchar("applied_coupon_code", { length: 50 }),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  shippingFee: decimal("shipping_fee", { precision: 10, scale: 2 }),
  grandTotal: decimal("grand_total", { precision: 10, scale: 2 }),
  whatsappMessage: text("whatsapp_message"),
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
          kitSelections?: Array<{
            id: string;
            name: string;
            inspiration?: string;
          }>;
          sampleSelections?: Array<{
            id: string;
            name: string;
            inspiration?: string;
          }>;
        }>
      >()
    .notNull()
    .default([]),
  giftItems: jsonb("gift_items").$type<string[]>().notNull().default([]),
  country: varchar("country", { length: 8 }),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  whatsappInitiatedAt: timestamp("whatsapp_initiated_at").defaultNow().notNull(),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
});

// Raw Razorpay webhook ledger for payment, refund, dispute, settlement and downtime reconciliation.
export const razorpayWebhookEvents = pgTable("razorpay_webhook_events", {
  id: varchar("id", { length: 255 }).primaryKey(),
  event: varchar("event", { length: 120 }).notNull(),
  accountId: varchar("account_id", { length: 255 }),
  localOrderId: varchar("local_order_id", { length: 255 }),
  orderNumber: varchar("order_number", { length: 50 }),
  razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
  razorpayRefundId: varchar("razorpay_refund_id", { length: 255 }),
  razorpayDisputeId: varchar("razorpay_dispute_id", { length: 255 }),
  razorpaySettlementId: varchar("razorpay_settlement_id", { length: 255 }),
  razorpayDowntimeId: varchar("razorpay_downtime_id", { length: 255 }),
  entityType: varchar("entity_type", { length: 80 }),
  entityId: varchar("entity_id", { length: 255 }),
  status: varchar("status", { length: 80 }),
  amount: decimal("amount", { precision: 14, scale: 0 }),
  currency: varchar("currency", { length: 8 }),
  matched: boolean("matched").notNull().default(false),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  eventCreatedAt: timestamp("event_created_at"),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Coupon code send / share events (email + whatsapp)
export const couponCodeEvents = pgTable("coupon_code_events", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sessionId: varchar("session_id", { length: 255 }),
  channel: varchar("channel", { length: 30 }).notNull(), // email | whatsapp
  eventType: varchar("event_type", { length: 50 }).notNull().default("sent"), // sent | requested
  couponCode: varchar("coupon_code", { length: 100 }),
  destination: varchar("destination", { length: 255 }), // email or phone
  path: varchar("path", { length: 2048 }),
  referrer: varchar("referrer", { length: 2048 }),
  country: varchar("country", { length: 8 }),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: text("user_agent"),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 120 }).primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const emailEvents = pgTable("email_events", {
  id: varchar("id", { length: 255 }).primaryKey(),
  messageType: varchar("message_type", { length: 80 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull().default("resend"),
  toEmail: varchar("to_email", { length: 255 }).notNull(),
  fromEmail: varchar("from_email", { length: 255 }).notNull(),
  subject: text("subject").notNull(),
  status: varchar("status", { length: 40 }).notNull().default("pending"),
  providerMessageId: varchar("provider_message_id", { length: 255 }),
  relatedType: varchar("related_type", { length: 80 }),
  relatedId: varchar("related_id", { length: 255 }),
  error: text("error"),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accountLoginOtps = pgTable("account_login_otps", {
  id: varchar("id", { length: 255 }).primaryKey(),
  identityType: varchar("identity_type", { length: 20 }).notNull(), // email | phone
  identifier: varchar("identifier", { length: 255 }).notNull(),
  destinationEmail: varchar("destination_email", { length: 255 }).notNull(),
  otpHash: varchar("otp_hash", { length: 255 }).notNull(),
  attempts: integer("attempts").notNull().default(0),
  expiresAt: timestamp("expires_at").notNull(),
  consumedAt: timestamp("consumed_at"),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerAccountSessions = pgTable("customer_account_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
  identityType: varchar("identity_type", { length: 20 }).notNull(), // email | phone
  identifier: varchar("identifier", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  expiresAt: timestamp("expires_at").notNull(),
  lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stockNotifyRequests = pgTable("stock_notify_requests", {
  id: varchar("id", { length: 255 }).primaryKey(),
  productId: varchar("product_id", { length: 255 }).notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  sourcePath: varchar("source_path", { length: 2048 }),
  status: varchar("status", { length: 40 }).notNull().default("new"),
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Behavioral Analytics & Behavioral Events
export const behavioralEvents = pgTable("behavioral_events", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(), // click | scroll | hover | section_view | exit_intent
  path: varchar("path", { length: 2048 }),
  elementId: varchar("element_id", { length: 255 }),
  elementText: text("element_text"),
  sectionName: varchar("section_name", { length: 255 }), // hero | products | notes | reviews
  scrollDepth: integer("scroll_depth"), // 10 | 25 | 50 | 75 | 100
  dwellTimeMs: integer("dwell_time_ms"), 
  ipAddress: varchar("ip_address", { length: 255 }),
  userAgent: text("user_agent"),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Real-time Session Intelligence (Intent & Prediction)
export const sessionIntelligence = pgTable("session_intelligence", {
  id: varchar("id", { length: 255 }).primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  intentScore: integer("intent_score").notNull().default(0), // 0-100
  abandonmentRisk: integer("abandonment_risk").notNull().default(0), // 0-100
  predictedNextAction: varchar("predicted_next_action", { length: 100 }), // checkout | exit | add_cart
  topAbandonmentCause: varchar("top_abandonment_cause", { length: 100 }), // price | shipping | trust
  currentSection: varchar("current_section", { length: 255 }),
  totalInteractions: integer("total_interactions").notNull().default(0),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Section Attribution Scoring
export const sectionAttribution = pgTable("section_attribution", {
  id: varchar("id", { length: 255 }).primaryKey(),
  path: varchar("path", { length: 2048 }).notNull(),
  sectionName: varchar("section_name", { length: 255 }).notNull(),
  views: integer("views").notNull().default(0),
  interactions: integer("interactions").notNull().default(0),
  conversions: integer("conversions").notNull().default(0), // How many users added to cart after seeing this section
  attributionScore: decimal("attribution_score", { precision: 5, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Export types
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
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
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type RazorpayWebhookEvent = typeof razorpayWebhookEvents.$inferSelect;
export type NewRazorpayWebhookEvent = typeof razorpayWebhookEvents.$inferInsert;
export type CouponCodeEvent = typeof couponCodeEvents.$inferSelect;
export type NewCouponCodeEvent = typeof couponCodeEvents.$inferInsert;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;
export type EmailEvent = typeof emailEvents.$inferSelect;
export type NewEmailEvent = typeof emailEvents.$inferInsert;
export type AccountLoginOtp = typeof accountLoginOtps.$inferSelect;
export type NewAccountLoginOtp = typeof accountLoginOtps.$inferInsert;
export type CustomerAccountSession = typeof customerAccountSessions.$inferSelect;
export type NewCustomerAccountSession = typeof customerAccountSessions.$inferInsert;
export type StockNotifyRequest = typeof stockNotifyRequests.$inferSelect;
export type NewStockNotifyRequest = typeof stockNotifyRequests.$inferInsert;
export type BehavioralEvent = typeof behavioralEvents.$inferSelect;
export type NewBehavioralEvent = typeof behavioralEvents.$inferInsert;
export type SessionIntelligence = typeof sessionIntelligence.$inferSelect;
export type NewSessionIntelligence = typeof sessionIntelligence.$inferInsert;
export type SectionAttribution = typeof sectionAttribution.$inferSelect;
export type NewSectionAttribution = typeof sectionAttribution.$inferInsert;
