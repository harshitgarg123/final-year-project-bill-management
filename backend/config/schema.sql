-- ============================================
-- Bill Management System - Database Schema
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS bill_management;
USE bill_management;

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('CLIENT', 'ADMIN', 'MANAGER') NOT NULL,
  profile_image VARCHAR(255) DEFAULT NULL,
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Bills Table
-- ============================================
CREATE TABLE IF NOT EXISTS bills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  admin_id INT NOT NULL,
  bill_type ENUM('LIGHT', 'BIN', 'VOTER', 'NEWSPAPER') NOT NULL,
  bill_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  bill_file VARCHAR(255) NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  remarks TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- Password Resets Table
-- ============================================
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- User Details Table (Additional Information)
-- ============================================
CREATE TABLE IF NOT EXISTS user_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  phone VARCHAR(20) DEFAULT NULL,
  date_of_birth DATE DEFAULT NULL,
  gender ENUM('MALE','FEMALE','OTHER') DEFAULT NULL,
  address_line1 VARCHAR(255) DEFAULT NULL,
  address_line2 VARCHAR(255) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  state VARCHAR(100) DEFAULT NULL,
  zip_code VARCHAR(20) DEFAULT NULL,
  country VARCHAR(100) DEFAULT NULL,
  company_name VARCHAR(150) DEFAULT NULL,
  department VARCHAR(100) DEFAULT NULL,
  designation VARCHAR(100) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX idx_bills_client_id ON bills(client_id);
CREATE INDEX idx_bills_admin_id ON bills(admin_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_user ON password_resets(user_id);
CREATE INDEX idx_user_details_user ON user_details(user_id);
