-- Migration V3: Restaurant Features (Addons, Delivery, Rider, Chat Scope)

-- 1. Add Addons to Products
ALTER TABLE products ADD COLUMN addons JSON;

-- 2. Add Selected Addons to Order Items
ALTER TABLE order_items ADD COLUMN selected_addons JSON;

-- 3. Update Business Details
ALTER TABLE business_details ADD COLUMN operating_hours JSON;
ALTER TABLE business_details ADD COLUMN delivery_radius DECIMAL(10,2);

-- 4. Update Orders Table (Status, Rider, Delivery Fee)
ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'accepted', 'preparing', 'out_for_delivery', 'completed', 'cancelled') DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN rider_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN rider_phone VARCHAR(50);
ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10,2) DEFAULT 0.00;

-- 5. Update Chats Table (Order Scope)
ALTER TABLE chats ADD COLUMN order_id INT;
ALTER TABLE chats ADD CONSTRAINT fk_chats_order FOREIGN KEY (order_id) REFERENCES orders(id);
