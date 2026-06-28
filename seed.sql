-- Drop tables if they exist
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    specs JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    total NUMERIC(10, 2) DEFAULT 0.00
);

-- Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL
);

-- Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Gadgets, devices, and accessories'),
('Books', 'Physical and electronic books across genres'),
('Clothing', 'Apparel, shoes, and accessories'),
('Home & Kitchen', 'Furniture, appliances, and decor'),
('Fitness', 'Exercise equipment and athletic gear');

-- Insert Users
INSERT INTO users (name, email, role, created_at) VALUES
('Alice Smith', 'alice@example.com', 'customer', '2026-01-10 10:00:00'),
('Bob Jones', 'bob@example.com', 'customer', '2026-02-15 11:30:00'),
('Charlie Brown', 'charlie@example.com', 'admin', '2026-01-01 09:00:00'),
('Diana Prince', 'diana@example.com', 'customer', '2026-03-20 14:15:00'),
('Evan Wright', 'evan@example.com', 'customer', '2026-04-05 16:45:00'),
('Fiona Gallagher', 'fiona@example.com', 'moderator', '2026-02-10 08:30:00'),
('George Costanza', 'george@example.com', 'customer', '2026-05-12 13:20:00'),
('Hannah Abbott', 'hannah@example.com', 'customer', '2026-05-28 17:00:00');

-- Insert Products with JSONB Specs
INSERT INTO products (category_id, name, price, stock, specs) VALUES
(1, 'Quantum Laptop Pro', 1299.99, 25, '{"brand": "Aether", "cpu": "Intel i7", "ram_gb": 16, "storage_gb": 512, "colors": ["silver", "space_gray"], "dimensions": {"weight_kg": 1.4, "screen_inches": 14}}'),
(1, 'SoundWave ANC Headphones', 199.99, 50, '{"brand": "AudioLux", "type": "over-ear", "wireless": true, "battery_life_hours": 30, "colors": ["black", "sand"], "anc": true}'),
(1, 'PixelScroll E-Reader', 129.50, 40, '{"brand": "BookWorm", "waterproof": true, "storage_gb": 8, "screen_inches": 6.8}'),
(2, 'Mastering SQL & PostgreSQL', 45.00, 100, '{"author": "Jane Doe", "pages": 450, "format": "Paperback"}'),
(2, 'A Brief History of Databases', 29.99, 75, '{"author": "John Smith", "pages": 320, "format": "Hardcover"}'),
(3, 'Merino Wool Trail Socks', 18.00, 150, '{"brand": "GearUp", "material": "Merino Wool", "sizes": ["M", "L"], "pack_count": 2}'),
(3, 'All-Weather Shell Jacket', 149.00, 30, '{"brand": "GearUp", "waterproof": true, "material": "Gore-Tex", "sizes": ["S", "M", "L", "XL"]}'),
(4, 'Barista Express Espresso Machine', 599.99, 12, '{"brand": "BrewMaster", "pressure_bars": 15, "water_tank_liters": 2.0, "built_in_grinder": true}'),
(4, 'Minimalist Ceramic Dinner Set', 85.00, 20, '{"brand": "ClayModern", "pieces": 16, "dishwasher_safe": true, "colors": ["matte_black", "sand_white"]}'),
(5, 'Ergonomic Kettlebell (16kg)', 65.00, 15, '{"brand": "IronFit", "weight_lbs": 35.2, "material": "Cast Iron", "coated": true}');

-- Insert Orders
INSERT INTO orders (user_id, order_date, status, total) VALUES
(1, '2026-06-01 10:30:00', 'completed', 1317.99),
(2, '2026-06-02 11:15:00', 'completed', 284.99),
(4, '2026-06-05 14:00:00', 'completed', 129.50),
(5, '2026-06-10 16:30:00', 'shipped', 664.99),
(1, '2026-06-12 09:45:00', 'completed', 149.00),
(7, '2026-06-15 13:00:00', 'pending', 85.00),
(2, '2026-06-18 15:20:00', 'shipped', 18.00),
(8, '2026-06-20 11:00:00', 'completed', 1317.99);

-- Insert Order Items
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 1299.99), -- Quantum Laptop
(1, 6, 1, 18.00),   -- Merino Wool Socks
(2, 2, 1, 199.99),  -- ANC Headphones
(2, 4, 1, 45.00),   -- Mastering SQL
(2, 5, 1, 40.00),   -- History of DBs (stored price is 29.99 but sold at 40 during peak)
(3, 3, 1, 129.50),  -- E-Reader
(4, 8, 1, 599.99),  -- Espresso Machine
(4, 10, 1, 65.00),  -- Kettlebell
(5, 7, 1, 149.00),  -- Jacket
(6, 9, 1, 85.00),   -- Dinner Set
(7, 6, 1, 18.00),   -- Socks
(8, 1, 1, 1299.99), -- Laptop
(8, 6, 1, 18.00);   -- Socks

-- Insert Reviews
INSERT INTO reviews (user_id, product_id, rating, comment, created_at) VALUES
(1, 1, 5, 'Absolutely spectacular laptop! Fast compilation times and fantastic screen.', '2026-06-05 12:00:00'),
(2, 2, 4, 'Noise cancelling is top notch. Audio balance is slightly bass-heavy but customizable.', '2026-06-10 15:00:00'),
(4, 3, 5, 'Battery lasts for weeks. Screen is very easy on the eyes.', '2026-06-08 09:30:00'),
(2, 4, 5, 'Highly detailed resource. The PostgreSQL-specific sections on EXPLAIN and JSONB are excellent.', '2026-06-12 11:00:00'),
(1, 6, 4, 'Super comfortable and warm, perfect for long hiking trips.', '2026-06-14 18:20:00'),
(5, 8, 5, 'Professional quality espresso at home. The learning curve is a bit steep but worth it.', '2026-06-15 14:00:00'),
(5, 10, 3, 'The handle grip is decent, but the coating has a slight rough spot. Still functions fine.', '2026-06-16 10:15:00');
