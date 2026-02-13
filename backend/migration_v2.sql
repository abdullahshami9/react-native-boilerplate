-- Migration V2: Performance & Subscription Features

-- 1. Add Indexes for High-Traffic Queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_user_category ON products(user_id, category);
CREATE INDEX idx_orders_seller_status ON orders(seller_id, status);
CREATE INDEX idx_products_price ON products(price);

-- 2. Add Full-Text Search for Products (MySQL Boolean Mode)
ALTER TABLE products ADD FULLTEXT(name, description);

-- 3. Add Subscription Columns to Business Details
-- Note: Check if columns exist before running or use ignore error
ALTER TABLE business_details ADD COLUMN subscription_expiry_date DATETIME DEFAULT NULL;
ALTER TABLE business_details ADD COLUMN is_premium BOOLEAN DEFAULT 0;

-- 4. Update existing businesses to have trial period (Optional, logic handled in app)
-- UPDATE business_details SET subscription_expiry_date = DATE_ADD(NOW(), INTERVAL 3 MONTH), is_premium = 1 WHERE subscription_expiry_date IS NULL;
