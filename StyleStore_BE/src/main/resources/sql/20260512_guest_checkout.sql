-- Drop the existing foreign key constraint (if it exists)
ALTER TABLE orders DROP FOREIGN KEY fk_orders_user;

-- Make user_id nullable and add receiver_phone_number column
ALTER TABLE orders
    MODIFY user_id BIGINT NULL;

ALTER TABLE orders
    ADD COLUMN receiver_phone_number VARCHAR(10) NOT NULL DEFAULT '0000000000' AFTER shipping_address;

-- Re-add the foreign key with ON DELETE SET NULL
ALTER TABLE orders
    ADD CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Remove the default now that the column exists with data
ALTER TABLE orders
    MODIFY receiver_phone_number VARCHAR(10) NOT NULL;
