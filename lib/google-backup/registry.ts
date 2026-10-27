// Fixed approved business fields. New schema columns are NOT automatically exported.
export const BACKUP_REGISTRY = [
  {
    "name": "products",
    "key": "id",
    "columns": [
      "id",
      "name",
      "inspiration",
      "inspiration_brand",
      "wore_by",
      "wore_by_image_url",
      "category",
      "category_id",
      "gender",
      "images",
      "price",
      "price_currency",
      "description",
      "seo_description",
      "seo_keywords",
      "badges",
      "notes",
      "longevity",
      "size",
      "primary_blog_slug",
      "visibility",
      "created_at",
      "updated_at"
    ],
    "json": [
      "images",
      "seo_keywords",
      "badges",
      "notes",
      "longevity"
    ],
    "snapshotKeys": [
      "id",
      "name",
      "inspiration",
      "inspirationBrand",
      "woreBy",
      "woreByImageUrl",
      "category",
      "categoryId",
      "gender",
      "images",
      "price",
      "priceCurrency",
      "description",
      "seoDescription",
      "seoKeywords",
      "badges",
      "notes",
      "longevity",
      "size",
      "primaryBlogSlug",
      "visibility",
      "createdAt",
      "updatedAt"
    ]
  },
  {
    "name": "product_categories",
    "key": "id",
    "columns": [
      "id",
      "product_id",
      "category_id",
      "category_label",
      "created_at"
    ],
    "json": [],
    "snapshotKeys": [
      "id",
      "productId",
      "categoryId",
      "categoryLabel",
      "createdAt"
    ]
  },
  {
    "name": "accessories",
    "key": "id",
    "columns": [
      "id",
      "name",
      "short_description",
      "description",
      "images",
      "price",
      "price_currency",
      "is_complementary",
      "gift_tier",
      "created_at",
      "updated_at"
    ],
    "json": [
      "images"
    ],
    "snapshotKeys": [
      "id",
      "name",
      "shortDescription",
      "description",
      "images",
      "price",
      "priceCurrency",
      "isComplementary",
      "giftTier",
      "createdAt",
      "updatedAt"
    ]
  },
  {
    "name": "reviews",
    "key": "id",
    "columns": [
      "id",
      "product_id",
      "author",
      "avatar_url",
      "reviewer_city",
      "reviewer_language",
      "rating",
      "date",
      "title",
      "content",
      "images",
      "verified",
      "created_at"
    ],
    "json": [
      "images"
    ],
    "snapshotKeys": [
      "id",
      "productId",
      "author",
      "avatarUrl",
      "reviewerCity",
      "reviewerLanguage",
      "rating",
      "date",
      "title",
      "content",
      "images",
      "verified",
      "createdAt"
    ]
  },
  {
    "name": "images",
    "key": "id",
    "columns": [
      "id",
      "label",
      "url",
      "link",
      "usage",
      "tags",
      "mime_type",
      "size_bytes",
      "provider",
      "provider_asset_id",
      "provider_public_id",
      "width",
      "height",
      "format",
      "data_base64",
      "created_at",
      "updated_at"
    ],
    "json": [
      "tags"
    ],
    "snapshotKeys": [
      "id",
      "label",
      "url",
      "link",
      "usage",
      "tags",
      "mimeType",
      "sizeBytes",
      "provider",
      "providerAssetId",
      "providerPublicId",
      "width",
      "height",
      "format",
      "dataBase64",
      "createdAt",
      "updatedAt"
    ]
  },
  {
    "name": "blog_posts",
    "key": "id",
    "columns": [
      "id",
      "title",
      "slug",
      "excerpt",
      "content",
      "seo_title",
      "seo_description",
      "seo_keywords",
      "category",
      "author",
      "date",
      "read_time",
      "featured",
      "image_url",
      "related_product_id",
      "created_at",
      "updated_at"
    ],
    "json": [
      "seo_keywords"
    ],
    "snapshotKeys": [
      "id",
      "title",
      "slug",
      "excerpt",
      "content",
      "seoTitle",
      "seoDescription",
      "seoKeywords",
      "category",
      "author",
      "date",
      "readTime",
      "featured",
      "imageUrl",
      "relatedProductId",
      "createdAt",
      "updatedAt"
    ]
  },
  {
    "name": "coupons",
    "key": "id",
    "columns": [
      "id",
      "code",
      "title",
      "description",
      "type",
      "value",
      "min_subtotal",
      "active",
      "display_in_cart",
      "welcome_back_mode",
      "archived_at",
      "created_at",
      "updated_at"
    ],
    "json": [],
    "snapshotKeys": [
      "id",
      "code",
      "title",
      "description",
      "type",
      "value",
      "minSubtotal",
      "active",
      "displayInCart",
      "welcomeBackMode",
      "archivedAt",
      "createdAt",
      "updatedAt"
    ]
  },
  {
    "name": "orders",
    "key": "id",
    "columns": [
      "id",
      "order_number",
      "status",
      "checkout_channel",
      "payment_method",
      "razorpay_order_id",
      "razorpay_payment_id",
      "captured_payment_amount",
      "external_payment_receipt",
      "payment_captured_at",
      "payment_reconciled_at",
      "payment_sync_status",
      "payment_attempt_count",
      "shipping_method",
      "fulfillment_carrier",
      "tracking_number",
      "tracking_url",
      "tracking_status",
      "tracking_last_checked_at",
      "path",
      "acquisition_source",
      "acquisition_category",
      "acquisition_referrer_host",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "full_name",
      "phone",
      "alternate_phone",
      "email",
      "address_line_1",
      "address_line_2",
      "city",
      "state",
      "pincode",
      "notes",
      "applied_coupon_code",
      "subtotal",
      "shipping_fee",
      "cod_fee",
      "manual_adjustment",
      "adjustment_reason",
      "grand_total",
      "cart_snapshot",
      "gift_items",
      "country",
      "created_at",
      "updated_at",
      "whatsapp_initiated_at",
      "shipped_at",
      "delivered_at"
    ],
    "json": [
      "external_payment_receipt",
      "cart_snapshot",
      "gift_items"
    ],
    "snapshotKeys": [
      "id",
      "orderNumber",
      "status",
      "checkoutChannel",
      "paymentMethod",
      "razorpayOrderId",
      "razorpayPaymentId",
      "capturedPaymentAmount",
      "externalPaymentReceipt",
      "paymentCapturedAt",
      "paymentReconciledAt",
      "paymentSyncStatus",
      "paymentAttemptCount",
      "shippingMethod",
      "fulfillmentCarrier",
      "trackingNumber",
      "trackingUrl",
      "trackingStatus",
      "trackingLastCheckedAt",
      "path",
      "acquisitionSource",
      "acquisitionCategory",
      "acquisitionReferrerHost",
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "utmTerm",
      "utmContent",
      "fullName",
      "phone",
      "alternatePhone",
      "email",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "pincode",
      "notes",
      "appliedCouponCode",
      "subtotal",
      "shippingFee",
      "codFee",
      "manualAdjustment",
      "adjustmentReason",
      "grandTotal",
      "cartSnapshot",
      "giftItems",
      "country",
      "createdAt",
      "updatedAt",
      "whatsappInitiatedAt",
      "shippedAt",
      "deliveredAt"
    ]
  },
  {
    "name": "order_edit_audits",
    "key": "id",
    "columns": [
      "id",
      "order_id",
      "change_type",
      "reason",
      "actor",
      "before_snapshot",
      "after_snapshot",
      "created_at"
    ],
    "json": [
      "before_snapshot",
      "after_snapshot"
    ],
    "snapshotKeys": [
      "id",
      "orderId",
      "changeType",
      "reason",
      "actor",
      "beforeSnapshot",
      "afterSnapshot",
      "createdAt"
    ]
  },
  {
    "name": "checkout_drafts",
    "key": "id",
    "columns": [
      "id",
      "status",
      "path",
      "acquisition_source",
      "acquisition_category",
      "acquisition_referrer_host",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "full_name",
      "phone",
      "alternate_phone",
      "email",
      "address_line_1",
      "address_line_2",
      "city",
      "state",
      "pincode",
      "notes",
      "last_edited_field",
      "subtotal",
      "shipping_fee",
      "grand_total",
      "pricing_breakdown",
      "cart_snapshot",
      "country",
      "lead_status",
      "lead_notes",
      "last_contacted_at",
      "next_follow_up_at",
      "created_at",
      "updated_at",
      "whatsapp_initiated_at"
    ],
    "json": [
      "pricing_breakdown",
      "cart_snapshot"
    ],
    "snapshotKeys": [
      "id",
      "status",
      "path",
      "acquisitionSource",
      "acquisitionCategory",
      "acquisitionReferrerHost",
      "utmSource",
      "utmMedium",
      "utmCampaign",
      "utmTerm",
      "utmContent",
      "fullName",
      "phone",
      "alternatePhone",
      "email",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "pincode",
      "notes",
      "lastEditedField",
      "subtotal",
      "shippingFee",
      "grandTotal",
      "pricingBreakdown",
      "cartSnapshot",
      "country",
      "leadStatus",
      "leadNotes",
      "lastContactedAt",
      "nextFollowUpAt",
      "createdAt",
      "updatedAt",
      "whatsappInitiatedAt"
    ]
  },
  {
    "name": "invoice_customers",
    "key": "id",
    "columns": [
      "id",
      "name",
      "address",
      "email",
      "phone",
      "gstin",
      "created_at",
      "updated_at"
    ],
    "json": [],
    "snapshotKeys": [
      "id",
      "name",
      "address",
      "email",
      "phone",
      "gstin",
      "createdAt",
      "updatedAt"
    ]
  },
  {
    "name": "saved_invoices",
    "key": "id",
    "columns": [
      "id",
      "title",
      "document",
      "created_at",
      "updated_at"
    ],
    "json": [
      "document"
    ],
    "snapshotKeys": [
      "id",
      "title",
      "document",
      "createdAt",
      "updatedAt"
    ]
  },
  {
    "name": "issued_invoices",
    "key": "invoice_id",
    "columns": [
      "invoice_id",
      "financial_year",
      "invoice_number",
      "document",
      "issued_at"
    ],
    "json": [
      "document"
    ],
    "snapshotKeys": [
      "invoiceId",
      "financialYear",
      "invoiceNumber",
      "document",
      "issuedAt"
    ]
  },
  {
    "name": "invoice_revisions",
    "key": "id",
    "columns": [
      "id",
      "invoice_id",
      "action",
      "title",
      "document",
      "created_at"
    ],
    "json": [
      "document"
    ],
    "snapshotKeys": [
      "id",
      "invoiceId",
      "action",
      "title",
      "document",
      "createdAt"
    ]
  },
  {
    "name": "invoice_corrections",
    "key": "id",
    "columns": [
      "id",
      "invoice_id",
      "kind",
      "number",
      "date",
      "reason",
      "reference",
      "amount_minor",
      "details",
      "request_fingerprint",
      "created_at"
    ],
    "json": [
      "details"
    ],
    "snapshotKeys": [
      "id",
      "invoiceId",
      "kind",
      "number",
      "date",
      "reason",
      "reference",
      "amountMinor",
      "details",
      "requestFingerprint",
      "createdAt"
    ]
  },
  {
    "name": "invoice_customer_links",
    "key": "invoice_id",
    "columns": [
      "invoice_id",
      "customer_id",
      "updated_at"
    ],
    "json": [],
    "snapshotKeys": [
      "invoiceId",
      "customerId",
      "updatedAt"
    ]
  },
  {
    "name": "invoice_counters",
    "key": "financial_year",
    "columns": [
      "financial_year",
      "last_number"
    ],
    "json": [],
    "snapshotKeys": [
      "financialYear",
      "lastNumber"
    ]
  },
  {
    "name": "invoice_correction_counters",
    "key": "financial_year",
    "columns": [
      "financial_year",
      "last_number"
    ],
    "json": [],
    "snapshotKeys": [
      "financialYear",
      "lastNumber"
    ]
  },
  {
    "name": "invoice_item_suggestions",
    "key": "id",
    "columns": [
      "details",
      "id",
      "name",
      "category",
      "unit",
      "price",
      "created_at",
      "updated_at"
    ],
    "json": [
      "details"
    ],
    "snapshotKeys": [
      "details",
      "id",
      "name",
      "category",
      "unit",
      "price",
      "createdAt",
      "updatedAt"
    ]
  },
  {
    "name": "invoice_reusable_defaults",
    "key": "id",
    "columns": [
      "id",
      "document",
      "updated_at"
    ],
    "json": [
      "document"
    ],
    "snapshotKeys": [
      "id",
      "document",
      "updatedAt"
    ]
  },
  {
    "name": "corporate_gifting_leads",
    "key": "id",
    "columns": [
      "id",
      "company_name",
      "contact_name",
      "email",
      "phone",
      "estimated_quantity",
      "customization_details",
      "status",
      "created_at",
      "updated_at"
    ],
    "json": [],
    "snapshotKeys": [
      "id",
      "companyName",
      "contactName",
      "email",
      "phone",
      "estimatedQuantity",
      "customizationDetails",
      "status",
      "createdAt",
      "updatedAt"
    ]
  },
  {
    "name": "customer_feedback",
    "key": "id",
    "columns": [
      "id",
      "source",
      "source_details",
      "rating",
      "feedback_text",
      "contact_info",
      "created_at",
      "updated_at"
    ],
    "json": [],
    "snapshotKeys": [
      "id",
      "source",
      "sourceDetails",
      "rating",
      "feedbackText",
      "contactInfo",
      "createdAt",
      "updatedAt"
    ]
  },
  {
    "name": "stock_notify_requests",
    "key": "id",
    "columns": [
      "id",
      "product_id",
      "product_name",
      "email",
      "phone",
      "source_path",
      "status",
      "created_at",
      "updated_at"
    ],
    "json": [],
    "snapshotKeys": [
      "id",
      "productId",
      "productName",
      "email",
      "phone",
      "sourcePath",
      "status",
      "createdAt",
      "updatedAt"
    ]
  },
  {
    "name": "qr_campaigns",
    "key": "id",
    "columns": [
      "id",
      "name",
      "city",
      "target_page",
      "target_url",
      "body_type",
      "eye_style",
      "logo_type",
      "qr_code_svg",
      "scan_count",
      "last_scanned_at",
      "created_at"
    ],
    "json": [],
    "snapshotKeys": [
      "id",
      "name",
      "city",
      "targetPage",
      "targetUrl",
      "bodyType",
      "eyeStyle",
      "logoType",
      "qrCodeSvg",
      "scanCount",
      "lastScannedAt",
      "createdAt"
    ]
  },
  {
    "name": "site_settings",
    "key": "key",
    "columns": [
      "key",
      "value",
      "updated_at"
    ],
    "json": [
      "value"
    ],
    "snapshotKeys": [
      "key",
      "value",
      "updatedAt"
    ]
  }
] as const;
