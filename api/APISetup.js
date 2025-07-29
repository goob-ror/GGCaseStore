const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

const dbName = process.env.DB_NAME || 'gg_catalog_db';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

// Function to create database and tables
async function setupDatabase() {
  let connection;
  
  try {
    log('🚀 Starting Database Setup...', colors.cyan);
    
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection(dbConfig);
    log('✅ Connected to MySQL server', colors.green);
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    log(`✅ Database '${dbName}' created/verified`, colors.green);
    
    // Use the database
    await connection.execute(`USE ${dbName}`);
    log(`✅ Using database '${dbName}'`, colors.green);
    
    // Read and execute schema from database_schema.sql
    const schemaPath = path.join(__dirname, '..', 'database_schema.sql');
    
    try {
      const schemaSQL = await fs.readFile(schemaPath, 'utf8');
      
      // Split the SQL into individual statements and execute them
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
      
      log('📋 Executing schema statements...', colors.yellow);
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await connection.execute(statement);
          } catch (error) {
            // Ignore table already exists errors
            if (!error.message.includes('already exists')) {
              throw error;
            }
          }
        }
      }
      
      log('✅ Database schema created successfully', colors.green);
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        log('⚠️  database_schema.sql not found, creating basic tables...', colors.yellow);
        await createBasicTables(connection);
      } else {
        throw error;
      }
    }
    
    // Verify tables were created
    const [tables] = await connection.execute('SHOW TABLES');
    log(`✅ Created ${tables.length} tables:`, colors.green);
    tables.forEach(table => {
      log(`   - ${Object.values(table)[0]}`, colors.blue);
    });
    
    // Test database connection
    await testDatabaseConnection(connection);
    
    log('🎉 Database setup completed successfully!', colors.green);
    
  } catch (error) {
    log(`❌ Database setup failed: ${error.message}`, colors.red);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      log('🔌 Database connection closed', colors.yellow);
    }
  }
}

// Function to create basic tables if schema file is not found
async function createBasicTables(connection) {
  const basicSchema = `
    CREATE TABLE IF NOT EXISTS admins (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS brands (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL UNIQUE,
      brand_photo TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL UNIQUE,
      category_photo TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      brand_id INT,
      category_id INT,
      total_sold INT DEFAULT 0,
      avg_rating FLOAT DEFAULT 0,
      total_raters INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id INT PRIMARY KEY AUTO_INCREMENT,
      product_id INT,
      variant_name VARCHAR(100),
      price DECIMAL(12,2) NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS product_photos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      product_id INT,
      photo_url TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      product_id INT,
      star INT CHECK (star >= 1 AND star <= 5),
      review_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS web_banners (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255),
      banner_image_url TEXT,
      redirect_url TEXT,
      active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  const statements = basicSchema
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  for (const statement of statements) {
    if (statement.trim()) {
      await connection.execute(statement);
    }
  }
}

// Function to test database connection and basic operations
async function testDatabaseConnection(connection) {
  log('🔍 Testing database connection...', colors.yellow);
  
  try {
    // Test basic query
    const [result] = await connection.execute('SELECT 1 as test');
    if (result[0].test === 1) {
      log('✅ Database connection test passed', colors.green);
    }
    
    // Test table access
    const [adminCount] = await connection.execute('SELECT COUNT(*) as count FROM admins');
    log(`✅ Admins table accessible (${adminCount[0].count} records)`, colors.green);
    
    const [brandCount] = await connection.execute('SELECT COUNT(*) as count FROM brands');
    log(`✅ Brands table accessible (${brandCount[0].count} records)`, colors.green);
    
  } catch (error) {
    log(`❌ Database test failed: ${error.message}`, colors.red);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  setupDatabase()
    .then(() => {
      log('✨ Setup completed successfully!', colors.bright + colors.green);
      process.exit(0);
    })
    .catch((error) => {
      log(`💥 Setup failed: ${error.message}`, colors.bright + colors.red);
      process.exit(1);
    });
}

module.exports = { setupDatabase, testDatabaseConnection };
