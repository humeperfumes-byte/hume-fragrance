-- Normalize identifiers without changing which scent families a product belongs to.
CREATE TABLE IF NOT EXISTS catalog_categories (
 id varchar(100) PRIMARY KEY,
 name varchar(100) NOT NULL,
 description varchar(500) NOT NULL DEFAULT '',
 visible boolean NOT NULL DEFAULT true,
 sort_order integer NOT NULL DEFAULT 200,
 created_at timestamp NOT NULL DEFAULT now(),
 updated_at timestamp NOT NULL DEFAULT now()
);
UPDATE products SET category_id=trim(both '-' from regexp_replace(lower(trim(category_id)), '[^a-z0-9]+', '-', 'g')) WHERE category_id IS NOT NULL;
UPDATE product_categories SET category_id=trim(both '-' from regexp_replace(lower(trim(category_id)), '[^a-z0-9]+', '-', 'g'));
INSERT INTO catalog_categories(id,name,visible,sort_order)
SELECT id, initcap(replace(id,'-',' ')),
 id NOT IN ('gourmand-amber','gourmand-spice','fresh-woody','mysterious','incense','earthy','aromatic','discovery-set'),
 CASE id WHEN 'fresh' THEN 10 WHEN 'citrus' THEN 20 WHEN 'aquatic' THEN 30 WHEN 'floral' THEN 40 WHEN 'fruity' THEN 50 WHEN 'woody' THEN 60 WHEN 'amber' THEN 70 WHEN 'spicy' THEN 80 WHEN 'sweet' THEN 90 WHEN 'gourmand' THEN 100 WHEN 'oud' THEN 110 WHEN 'vanilla' THEN 120 WHEN 'musky' THEN 130 WHEN 'leather' THEN 140 ELSE 200 END
FROM (SELECT category_id AS id FROM products UNION SELECT category_id FROM product_categories) c
WHERE id<>'' ON CONFLICT(id) DO NOTHING;
CREATE UNIQUE INDEX IF NOT EXISTS catalog_categories_name_unique ON catalog_categories(lower(name));
DELETE FROM product_categories a USING product_categories b WHERE a.product_id=b.product_id AND a.category_id=b.category_id AND a.id>b.id;
CREATE UNIQUE INDEX IF NOT EXISTS product_categories_product_category_unique ON product_categories(product_id,category_id);
INSERT INTO product_categories(product_id,category_id,category_label)
SELECT p.id,p.category_id,c.name FROM products p JOIN catalog_categories c ON c.id=p.category_id
ON CONFLICT(product_id,category_id) DO NOTHING;
UPDATE product_categories m SET category_label=c.name FROM catalog_categories c WHERE c.id=m.category_id AND m.category_label IS DISTINCT FROM c.name;
