# MongoDB Atlas Migration Guide

## Overview
This document outlines the changes made to migrate FormCraft from MySQL to MongoDB Atlas.

## Changes Made

### 1. Dependencies Updated
- **Removed**: `mysql2` package
- **Added**: `mongodb` package (v6.15.0)

### 2. Environment Variables
Updated `.env.example`:
```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
MONGODB_DB_NAME=dynamicforms
```

### 3. Database Connection
Replaced MySQL connection pool with MongoDB client connection:
```javascript
// Before (MySQL)
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'dynamicforms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// After (MongoDB)
let db;
let client;

async function connectToDatabase() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGODB_DB_NAME || 'dynamicforms';
    
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    
    console.log('✅ Connected to MongoDB Atlas successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}
```

### 4. Query Conversions

#### User Authentication
**Before (MySQL)**:
```javascript
const [users] = await db.execute('SELECT user_id FROM users WHERE email = ?', [email]);
const [result] = await db.execute('INSERT INTO users (email, password, created_at) VALUES (?, ?, NOW())', [email, hashedPassword]);
```

**After (MongoDB)**:
```javascript
const existingUser = await db.collection('users').findOne({ email });
const result = await db.collection('users').insertOne({
  email,
  password: hashedPassword,
  created_at: new Date()
});
```

#### Form Management
**Before (MySQL)**:
```javascript
const [forms] = await db.execute('SELECT * FROM forms WHERE user_id=?', [userId]);
const [fields] = await db.execute('SELECT * FROM form_fields WHERE form_id=?', [form.form_id]);
```

**After (MongoDB)**:
```javascript
const forms = await db.collection('forms').find({ user_id: new ObjectId(userId) }).toArray();
// Fields are now embedded in the form document
```

### 5. Schema Changes

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String, // hashed
  created_at: Date,
  name: String // optional
}
```

#### Forms Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // reference to users collection
  title: String,
  status: String, // 'draft', 'published', etc.
  created_at: Date,
  fields: [{
    label: String,
    name: String,
    type: String,
    required: Boolean,
    options: Array,
    placeholder: String,
    defaultValue: mixed
  }]
}
```

## Setup Instructions

### 1. MongoDB Atlas Setup
1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster (free tier is available)
3. Create a database user with read/write permissions
4. Get your connection string from the Atlas dashboard
5. Configure IP access (allow access from anywhere or specific IP addresses)

### 2. Update Environment Variables
Create a `.env` file based on `.env.example`:
```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/dynamicforms?retryWrites=true&w=majority
MONGODB_DB_NAME=dynamicforms
JWT_SECRET=your_jwt_secret_key_here
GROQ_API_KEY=your_groq_api_key
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Server
```bash
npm start
```

## Key Differences

### 1. Data Structure
- **MySQL**: Relational with separate tables for users, forms, and form_fields
- **MongoDB**: Document-based with embedded fields array in forms collection

### 2. Query Methods
- **MySQL**: `db.execute()` with SQL queries
- **MongoDB**: `db.collection().find()`, `db.collection().insertOne()`, etc.

### 3. ID Handling
- **MySQL**: Auto-increment integers
- **MongoDB**: ObjectId values

### 4. Relationships
- **MySQL**: Foreign key relationships
- **MongoDB**: Document references using ObjectId

## Benefits of Migration

1. **Scalability**: MongoDB Atlas offers horizontal scaling
2. **Flexibility**: Document structure allows for easier schema evolution
3. **Performance**: Embedded documents reduce query complexity
4. **Cloud Hosting**: Fully managed database service
5. **Cost**: Free tier available for development

## Testing

After migration, test the following endpoints:
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/user/:userId` - Get user forms
- `POST /api/forms/save` - Save form
- `POST /generate-form` - Generate form fields

## Troubleshooting

### Common Issues
1. **Connection String**: Ensure proper URI format with credentials
2. **Network Access**: Configure IP whitelist in Atlas
3. **Authentication**: Verify database user permissions
4. **Environment Variables**: Check that all required variables are set

### Error Messages
- `MongoServerError: bad auth`: Check username/password in connection string
- `MongoNetworkError`: Verify network access and IP whitelist
- `MongoError: Authentication failed`: Ensure database user has correct permissions
