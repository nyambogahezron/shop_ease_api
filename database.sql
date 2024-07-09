CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL CHECK (char_length(name) >= 3),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL CHECK (char_length(password) >= 6),
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user'))
);

ALTER TABLE users ADD CONSTRAINT email_format_check CHECK (email ~* '^[^@]+@[^@]+\.[^@]{2,}$');

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC DEFAULT 0 NOT NULL,
    discount NUMERIC DEFAULT 0,
    description VARCHAR(1000) NOT NULL,
    image VARCHAR DEFAULT '/uploads/example.jpeg',
    category VARCHAR NOT NULL CHECK (category IN ('office', 'kitchen', 'bedroom' , 'others')),
    company VARCHAR NOT NULL CHECK (company IN ('ikea', 'liddy', 'marcos', 'others')),
    colors TEXT[] DEFAULT ARRAY['#222']::TEXT[] NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    freeShipping BOOLEAN DEFAULT FALSE,
    inventory INTEGER DEFAULT 15 NOT NULL,
    averageRating NUMERIC DEFAULT 0,
    numOfReviews INTEGER DEFAULT 0,
    "user" INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY("user") REFERENCES users(id)
);

-- Create a trigger to update the updated_at column on update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE
ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();