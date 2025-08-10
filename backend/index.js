const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

// Load environment variables first
require('dotenv').config();

// Debug: Check if env variables are loaded
console.log('Environment check:');
console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET');
console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('Groq API Key:', process.env.GROQ_API_KEY ? '***' + process.env.GROQ_API_KEY.slice(-4) : 'NOT SET');
console.log('Groq Model:', process.env.GROQ_MODEL || 'llama3-70b-8192 (default)');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'dynamicforms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('Database config:');
console.log('Host:', process.env.DB_HOST || '127.0.0.1');
console.log('User:', process.env.DB_USER || 'root');
console.log('Database:', process.env.DB_NAME || 'dynamicforms');

// Test database connection
async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}
testConnection();

// Input validation middleware
const validateInput = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  
  // Password length validation
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  next();
};

// AUTHENTICATION ROUTES
// Sign up
app.post('/api/auth/signup', validateInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const [users] = await db.execute('SELECT user_id FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert new user
    const [result] = await db.execute(
      'INSERT INTO users (email, password, created_at) VALUES (?, ?, NOW())', 
      [email, hashedPassword]
    );

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { 
        userId: result.insertId,
        email: email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: {
        id: result.insertId,
        email: email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign in
app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = rows[0];

     // 🟢 CORRECT WAY TO COMPARE PASSWORDS
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // This is the correct check for an incorrect password
            return res.status(401).json({ error: 'Incorrect password' });
        }

    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.status(200).json({
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// FORM GENERATION ENDPOINT WITH IMPROVED ERROR HANDLING
app.post('/generate-form', async (req, res) => {
  const requestId = uuidv4(); // Unique ID for request tracing
  console.log(`[${requestId}] Form generation request received`);
  
  const { query } = req.body;
  if (!query) {
    console.log(`[${requestId}] Missing query parameter`);
    return res.status(400).json({ 
      error: 'Query is required',
      requestId
    });
  }

  const prompt = `You are a JSON generator for dynamic forms. Respond ONLY with a raw JSON array. Each form field must follow this format:
{
  "label": "Field Label",
  "name": "fieldName",
  "type": "text" | "email" | "number" | "checkbox" | "radio" | "select",
  "required": true | false,
  "options": ["Option1", "Option2"] // only for radio/select types
}

Generate a form with these requirements: ${query}`;

  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Groq API key not configured');
    }

    console.log(`[${requestId}] Calling Groq API...`);
    const startTime = Date.now();
    
    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: process.env.GROQ_MODEL || 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a JSON generator for dynamic forms. Respond with a valid JSON object containing a "fields" array.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000 // 15 seconds timeout
      }
    );

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Groq API response received (${duration}ms)`);

    if (!groqResponse?.data?.choices?.[0]?.message?.content) {
      console.error(`[${requestId}] Invalid Groq response structure:`, groqResponse?.data);
      throw new Error('Invalid response structure from Groq API');
    }

    const responseContent = groqResponse.data.choices[0].message.content.trim();
    console.log(`[${requestId}] Raw response content:\n`, responseContent);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse error:`, parseError);
      throw new Error('Received invalid JSON from Groq API');
    }

    // Robust field extraction
    let formFields;
    if (Array.isArray(parsedResponse)) {
      formFields = parsedResponse;
    } else {
      // Check common response structures
      formFields = parsedResponse.fields || 
                  parsedResponse.form ||
                  parsedResponse.data ||
                  Object.values(parsedResponse).find(Array.isArray);
    }

    if (!Array.isArray(formFields)) {
      console.error(`[${requestId}] No valid form fields found in:`, parsedResponse);
      throw new Error('Response did not contain valid form fields');
    }

    // Validate each field
    const validatedFields = formFields.map((field, index) => {
      if (!field.label || !field.name || !field.type) {
        console.warn(`[${requestId}] Invalid field at index ${index}:`, field);
        throw new Error(`Field at position ${index} is missing required properties`);
      }
      return {
        label: field.label,
        name: field.name,
        type: field.type,
        required: Boolean(field.required),
        options: field.options || [],
        placeholder: field.placeholder || '',
        defaultValue: field.defaultValue || null
      };
    });

    console.log(`[${requestId}] Successfully generated ${validatedFields.length} form fields`);
    res.status(200).json({
      success: true,
      fields: validatedFields,
      requestId,
      responseTime: `${duration}ms`
    });

  } catch (error) {
    console.error(`[${requestId}] Error:`, error.message);
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error.response) {
      statusCode = error.response.status;
    } else if (error.message.includes('API key')) {
      statusCode = 401;
    } else if (error.message.includes('timeout')) {
      statusCode = 504;
    }
    
    res.status(statusCode).json({
      error: 'Form generation failed',
      message: error.message,
      requestId,
      ...(error.response && { 
        apiError: error.response.data,
        statusCode: error.response.status 
      })
    });
  }
});

app.get('/api/user/:userId',async(req,res)=>{
  const {userId}=req.params;

  try{
    //get all forms for user
    const [forms]=await db.execute(
      'SELECT * FROM forms WHERE user_id=?',[userId]
    );

    //for each form get fields
    for(const form of forms){
      const [fields]=await db.execute(
        'SELECT * FROM form_fields WHERE form_id=?',
        [form.form_id]
      );
      form.fields=fields;
    }

    res.json({forms});
  }
  catch(err){
    console.error('Error fetching user forms:',err);
    res.status(500).json({error:'Failed to load forms'});
  }
});

// ... (your existing code) ...

// Endpoint to save a form as a draft
// Endpoint to save a form as a draft
app.post('/api/forms/save', async (req, res) => {
    try {
        const { userId, title, fields } = req.body;

        if (!userId || !title || !fields || !Array.isArray(fields)) {
            return res.status(400).json({ error: 'User ID, title, and form fields are required' });
        }

        // 1. Insert into the forms table
        const [formResult] = await db.execute(
            'INSERT INTO forms (user_id, title, status) VALUES (?, ?, ?)',
            [userId, title, 'draft']
        );
        const formId = formResult.insertId;

        // 2. Prepare the fields data for insertion
        const fieldValues = fields.map(field => {
            return [
                formId,
                field.label,
                field.name,
                field.type,
                // FIX: Convert the boolean 'required' value to 1 or 0 for MySQL
                field.required ? 1 : 0, 
                JSON.stringify(field.options || [])
            ];
        });

        // 3. Insert all fields into the form_fields table
        if (fieldValues.length > 0) {
            await db.query(
                'INSERT INTO form_fields (form_id, label, name, type, required, options) VALUES ?',
                [fieldValues]
            );
        }

        res.status(201).json({
            message: 'Form saved successfully',
            formId: formId,
            status: 'draft'
        });

    } catch (error) {
        console.error('Error saving form:', error);
        res.status(500).json({ error: 'Failed to save form' });
    }
});


// SERVER SETUP
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
  console.log('Available endpoints:');
  console.log('POST /api/auth/signup - User registration');
  console.log('POST /api/auth/signin - User login');
  console.log('POST /generate-form - Generate dynamic form');
});