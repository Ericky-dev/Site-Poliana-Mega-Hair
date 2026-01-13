-- Beauty Salon Database Schema
-- MariaDB 10.11

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS beauty_salon
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE beauty_salon;

-- Users table (clients and admin)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255),
    facebook_id VARCHAR(255),
    instagram_id VARCHAR(255),
    role ENUM('client', 'admin') DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_facebook_id (facebook_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    service_id INT NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    client_email VARCHAR(255),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
    INDEX idx_date (appointment_date),
    INDEX idx_status (status),
    INDEX idx_date_time (appointment_date, appointment_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    pix_code TEXT,
    pix_qrcode TEXT,
    status ENUM('pending', 'paid', 'cancelled', 'refunded') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Business hours table
CREATE TABLE IF NOT EXISTS business_hours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week TINYINT NOT NULL, -- 0 = Sunday, 6 = Saturday
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_open BOOLEAN DEFAULT TRUE,
    UNIQUE KEY unique_day (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default services
INSERT INTO services (name, description, price, duration_minutes) VALUES
    ('Escova', 'Escova profissional com produtos de qualidade', 100.00, 60),
    ('Permanente', 'Permanente completo para cabelos', 200.00, 120),
    ('Outros Serviços', 'Outros serviços do salão', 150.00, 90);

-- Insert default business hours (Monday to Saturday, 9am to 6pm)
INSERT INTO business_hours (day_of_week, open_time, close_time, is_open) VALUES
    (0, '00:00:00', '00:00:00', FALSE),  -- Sunday - closed
    (1, '09:00:00', '18:00:00', TRUE),   -- Monday
    (2, '09:00:00', '18:00:00', TRUE),   -- Tuesday
    (3, '09:00:00', '18:00:00', TRUE),   -- Wednesday
    (4, '09:00:00', '18:00:00', TRUE),   -- Thursday
    (5, '09:00:00', '18:00:00', TRUE),   -- Friday
    (6, '09:00:00', '16:00:00', TRUE);   -- Saturday

-- Insert default admin user (password: admin123 - should be changed!)
INSERT INTO users (name, email, phone, password, role) VALUES
    ('Admin', 'admin@beautysalon.com', '+5511999999999', '$2b$10$rQZ5kPZ5kPZ5kPZ5kPZ5kO5kPZ5kPZ5kPZ5kPZ5kPZ5kPZ5kPZ5kO', 'admin');
