-- Create categories table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT, -- Category cover image URL
    image_public_id VARCHAR(255), -- Cloudinary public ID for deletion
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create photos table
CREATE TABLE photos (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
    public_id VARCHAR(255), -- Cloudinary public ID for deletion
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_photos_category_id ON photos(category_id);
CREATE INDEX idx_photos_created_at ON photos(created_at);
CREATE INDEX idx_categories_name ON categories(name);

-- Insert some sample categories with dummy images
INSERT INTO categories (name, description, image_url, image_public_id) VALUES
    ('Wedding', 'Wedding photography sessions', 'https://res.cloudinary.com/demo/image/upload/c_fill,h_400,w_600/v1/wedding-category.jpg', 'demo-wedding-category'),
    ('Maternity', 'Maternity and pregnancy photoshoots', 'https://res.cloudinary.com/demo/image/upload/c_fill,h_400,w_600/v1/maternity-category.jpg', 'demo-maternity-category'),
    ('Children', 'Children portraits and family sessions', 'https://res.cloudinary.com/demo/image/upload/c_fill,h_400,w_600/v1/children-category.jpg', 'demo-children-category'),
    ('Portrait', 'Individual portrait sessions', 'https://res.cloudinary.com/demo/image/upload/c_fill,h_400,w_600/v1/portrait-category.jpg', 'demo-portrait-category'),
    ('Event', 'Event and celebration photography', 'https://res.cloudinary.com/demo/image/upload/c_fill,h_400,w_600/v1/event-category.jpg', 'demo-event-category');

-- Insert some sample photos with dummy Cloudinary URLs
INSERT INTO photos (title, url, category_id) VALUES
    ('Elegant Wedding Ceremony', 'https://res.cloudinary.com/demo/image/upload/v1234567890/wedding_ceremony_1.jpg', 1),
    ('Bride and Groom Portrait', 'https://res.cloudinary.com/demo/image/upload/v1234567890/wedding_portrait_1.jpg', 1),
    ('Wedding Reception Dance', 'https://res.cloudinary.com/demo/image/upload/v1234567890/wedding_dance_1.jpg', 1),
    ('Maternity Glow', 'https://res.cloudinary.com/demo/image/upload/v1234567890/maternity_glow_1.jpg', 2),
    ('Expecting Couple', 'https://res.cloudinary.com/demo/image/upload/v1234567890/maternity_couple_1.jpg', 2),
    ('Baby Bump Silhouette', 'https://res.cloudinary.com/demo/image/upload/v1234567890/maternity_silhouette_1.jpg', 2),
    ('Happy Child Portrait', 'https://res.cloudinary.com/demo/image/upload/v1234567890/child_portrait_1.jpg', 3),
    ('Kids Playing', 'https://res.cloudinary.com/demo/image/upload/v1234567890/children_playing_1.jpg', 3),
    ('Family with Children', 'https://res.cloudinary.com/demo/image/upload/v1234567890/family_children_1.jpg', 3),
    ('Professional Headshot', 'https://res.cloudinary.com/demo/image/upload/v1234567890/portrait_headshot_1.jpg', 4),
    ('Artistic Portrait', 'https://res.cloudinary.com/demo/image/upload/v1234567890/portrait_artistic_1.jpg', 4),
    ('Birthday Celebration', 'https://res.cloudinary.com/demo/image/upload/v1234567890/event_birthday_1.jpg', 5),
    ('Corporate Event', 'https://res.cloudinary.com/demo/image/upload/v1234567890/event_corporate_1.jpg', 5);