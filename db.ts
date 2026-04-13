import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "edyzen",
};

export let pool: mysql.Pool;

export const initDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.query(`USE ${dbConfig.database}`);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        role ENUM('admin', 'teacher', 'student'),
        organizationId INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizationId) REFERENCES organizations(id)
      )
    `);

    await connection.end();
    pool = mysql.createPool(dbConfig);
    console.log("✓ MySQL database connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

export const query = async (sql: string, params?: any[]) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

export const logActivity = async (userId: string, userType: string, action: string, details?: any) => {
  console.log(`[Activity] ${userType}:${userId} - ${action}`, details || "");
};
