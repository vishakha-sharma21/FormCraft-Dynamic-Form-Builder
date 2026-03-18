const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

// Load environment variables first
require('dotenv').config();

// Debug: Check if env variables are loaded
console.log('Environment check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('MONGODB_DB_NAME:', process.env.MONGODB_DB_NAME || 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('Groq API Key:', process.env.GROQ_API_KEY ? '***' + process.env.GROQ_API_KEY.slice(-4) : 'NOT SET');
console.log('Groq Model:', process.env.GROQ_MODEL || 'llama-3.3-70b-versatile (default)');

const app = express();
// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://form-craft-dynamic-form-builder.vercel.app',
    'https://formcraft-dynamic-form-builder.onrender.com',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Debug: Log CORS configuration
console.log('🌐 CORS Configuration:', corsOptions);

app.use(cors(corsOptions));
app.use(express.json());

// Database connection
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
    console.log('Database:', dbName);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

connectToDatabase();

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
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert new user
    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      created_at: new Date()
    });

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { 
        userId: result.insertedId,
        email: email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: {
        id: result.insertedId,
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
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // 🟢 CORRECT WAY TO COMPARE PASSWORDS
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // This is the correct check for an incorrect password
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.status(200).json({
      token,
      user: {
        user_id: user._id,
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

  const prompt = `You are a JSON generator for dynamic forms. Respond ONLY with a valid JSON object containing both a "title" and "fields" array.

Your response must follow this exact format:
{
  "title": "A descriptive title for the form based on the requirements",
  "fields": [
    {
      "label": "Field Label",
      "name": "fieldName",
      "type": "text" | "email" | "number" | "checkbox" | "radio" | "select",
      "required": true | false,
      "options": ["Option1", "Option2"] // only for radio/select types
    }
  ]
}

Generate a form with these requirements: ${query}`;

  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Groq API key not configured');
    }

    console.log(`[${requestId}] Calling Groq API...`);
    const startTime = Date.now();
    
    // Fallback models in order of preference (confirmed working models from Groq API)
    const fallbackModels = [
      process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'qwen/qwen3-32b',
      'moonshotai/kimi-k2-instruct'
    ];
    
    let groqResponse = null;
    let lastError = null;
    
    // Try each model until one works
    for (const model of fallbackModels) {
      try {
        console.log(`[${requestId}] Trying model: ${model}`);
        
        groqResponse = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: model,
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
        
        // If we get here, the model worked
        console.log(`[${requestId}] Success with model: ${model}`);
        break;
        
      } catch (error) {
        lastError = error;
        console.log(`[${requestId}] Model ${model} failed:`, error.response?.data?.error?.message || error.message);
        
        // Continue to next model
        continue;
      }
    }
    
    if (!groqResponse) {
      throw lastError || new Error('All models failed');
    }

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

    // Robust field and title extraction
    let formFields;
    let formTitle;
    
    if (Array.isArray(parsedResponse)) {
      formFields = parsedResponse;
      formTitle = 'Generated Form'; // Fallback title for array responses
    } else {
      // Extract title and fields from object response
      formTitle = parsedResponse.title || 'Generated Form';
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

    console.log(`[${requestId}] Successfully generated ${validatedFields.length} form fields with title: "${formTitle}"`);
    res.status(200).json({
      success: true,
      title: formTitle,
      fields: validatedFields,
      requestId,
      responseTime: `${duration}ms`
    });

  } catch (error) {
    console.error(`[${requestId}] Error:`, error.message);
    
    // Log detailed error information for debugging
    if (error.response) {
      console.error(`[${requestId}] Groq API Error Details:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
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
    const forms = await db.collection('forms').find({ user_id: new ObjectId(userId) }).toArray();

    //transform forms for frontend compatibility
    const transformedForms = forms.map(form => ({
      form_id: form._id.toString(), // Convert ObjectId to string for frontend
      title: form.title,
      status: form.status || 'draft',
      created_at: form.created_at,
      fields: form.fields || [],
      responses: 0, // Default response count
      description: `Form with ${form.fields?.length || 0} fields` // Generate description
    }));

    res.json({ forms: transformedForms });
  }
  catch(err){
    console.error('Error fetching user forms:',err);
    res.status(500).json({error:'Failed to load forms'});
  }
});

// ... (your existing code) ...

// Endpoint to save a form as a draft
app.post('/api/forms/save', async (req, res) => {
    try {
        const { userId, title, fields } = req.body;

        if (!userId || !title || !fields || !Array.isArray(fields)) {
            return res.status(400).json({ error: 'User ID, title, and form fields are required' });
        }

        // 1. Insert into the forms collection
        const formResult = await db.collection('forms').insertOne({
            user_id: new ObjectId(userId),
            title,
            status: 'draft',
            created_at: new Date(),
            fields: fields.map(field => ({
                label: field.label,
                name: field.name,
                type: field.type,
                required: Boolean(field.required),
                options: field.options || [],
                placeholder: field.placeholder || '',
                defaultValue: field.defaultValue || null
            }))
        });
        const formId = formResult.insertedId;

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

// DELETE FORM ENDPOINT
app.delete('/api/forms/:formId', async (req, res) => {
    try {
        const { formId } = req.params;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Verify token and get user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Check if form exists and belongs to user
        const form = await db.collection('forms').findOne({ 
            _id: new ObjectId(formId),
            user_id: new ObjectId(decoded.userId)
        });

        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        // Delete the form
        await db.collection('forms').deleteOne({ _id: new ObjectId(formId) });

        res.json({ message: 'Form deleted successfully' });

    } catch (error) {
        console.error('Error deleting form:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        res.status(500).json({ error: 'Failed to delete form' });
    }
});

// SERVER SETUP
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('POST /api/auth/signup - User registration');
  console.log('POST /api/auth/signin - User login');
  console.log('POST /generate-form - Generate dynamic form');
});