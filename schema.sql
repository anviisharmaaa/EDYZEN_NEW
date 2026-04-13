-- MySQL Schema for Edyzen Authentication System
-- Run this to create the database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS edyzen;
USE edyzen;

-- Users table with bcrypt hashed passwords
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'student', 'parent') NOT NULL DEFAULT 'student',
  organizationId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  adminEmail VARCHAR(255),
  adminPassword VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed admin user (email: admin@edyzen.com, password: 123456)
-- Password is hashed with bcrypt using salt rounds of 10
-- Original password: 123456
INSERT INTO users (name, email, password, role) 
SELECT 'Admin', 'admin@edyzen.com', '$2a$10$YourHashedPasswordHere', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@edyzen.com');

-- Example: Create teacher
-- INSERT INTO users (name, email, password, role, organizationId) 
-- VALUES ('John Teacher', 'john@school.com', '$2a$10$hashedpassword', 'teacher', 1);

-- Example: Create student  
-- INSERT INTO users (name, email, password, role, organizationId)
-- VALUES ('Jane Student', 'jane@school.com', '$2a$10$hashedpassword', 'student', 1);
