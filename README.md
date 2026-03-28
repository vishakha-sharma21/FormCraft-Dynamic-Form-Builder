# FormCraft — Dynamic Form Builder

> Convert natural language prompts into dynamic, renderable form schemas in real time.

![Tech Stack](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## Overview

FormCraft is an AI-integrated full-stack application that eliminates the repetitive work of building forms. Users describe what they need in plain English — the system engineers a structured prompt, calls the Groq LLM API, validates the response, and renders a fully editable drag-and-drop form interface instantly.

---

## Features

- **Natural language → form schema** — Describe your form in plain English and get a production-ready form instantly
- **Drag-and-drop editor** — Reorder, add, or remove fields after generation
- **AI-powered generation** — Groq API converts prompts into strictly typed JSON schemas
- **Secure authentication** — JWT stored in HttpOnly, Secure, SameSite cookies (XSS-safe)
- **Persistent storage** — User accounts and form schemas saved in MySQL
- **Schema validation firewall** — Every LLM response validated server-side before reaching the frontend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MySQL |
| AI | Groq API |
| Auth | JWT (HttpOnly cookies) |

---

## Architecture

```
User Prompt
     │
     ▼
React Frontend (SPA)
     │  POST /api/generate
     ▼
Express Backend
     ├── JWT Middleware (auth guard)
     ├── Prompt engineering layer
     │        │
     │        ▼
     │   Groq API (LLM)
     │        │
     │        ▼
     │   Schema Validator ← rejects malformed LLM output
     │
     ├── Validated schema → React state
     └── Persist schema → MySQL
```

### Data Flow

1. User types a natural language prompt on the frontend
2. React sends a `POST /api/generate` request with the prompt and JWT cookie
3. Express middleware authenticates the JWT and forwards to the generation controller
4. The controller injects the prompt into an engineered system prompt and calls Groq API, instructing the model to return a strictly typed JSON schema
5. The LLM response is validated against a predefined schema contract — unsupported field types or missing required properties are rejected and retried
6. The validated schema is returned to the frontend and stored as a normalized array in React component state
7. The drag-and-drop interface renders the fields; reordering directly mutates the state array (single source of truth)
8. On save, the schema is persisted to MySQL

---

## Getting Started

### Prerequisites

- Node.js v18+
- MySQL 8+
- Groq API key — get one at [console.groq.com](https://console.groq.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/formcraft.git
cd formcraft

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

Create a `.env` file in the `/server` directory:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=formcraft
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

### Database Setup

```bash
# Run the schema migration
mysql -u root -p formcraft < server/db/schema.sql
```

### Running the App

```bash
# Start the backend server
cd server
npm run dev

# Start the frontend (in a new terminal)
cd client
npm run dev
```

The app will be available at `http://localhost:5173`

---

## API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT cookie |
| POST | `/api/auth/logout` | Clear the JWT cookie |

### Forms

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/generate` | Generate a form schema from a prompt |
| GET | `/api/forms` | Fetch all saved forms for the authenticated user |
| GET | `/api/forms/:id` | Fetch a single form schema |
| PUT | `/api/forms/:id` | Update a saved form |
| DELETE | `/api/forms/:id` | Delete a form |

### Example Request — Generate Form

```json
POST /api/generate
Content-Type: application/json

{
  "prompt": "Create a job application form with name, email, years of experience, and a resume upload"
}
```

### Example Response

```json
{
  "success": true,
  "schema": {
    "title": "Job Application",
    "fields": [
      { "id": "f1", "type": "text",   "label": "Full Name",           "required": true  },
      { "id": "f2", "type": "email",  "label": "Email Address",       "required": true  },
      { "id": "f3", "type": "number", "label": "Years of Experience", "required": false },
      { "id": "f4", "type": "file",   "label": "Resume Upload",       "required": true,  "accept": ".pdf,.doc,.docx" }
    ]
  }
}
```

---

## Security Design

- **JWT in HttpOnly cookies** — tokens are inaccessible to JavaScript, eliminating the XSS attack surface present with localStorage
- **SameSite=Strict** — prevents CSRF attacks by blocking cross-origin cookie submission
- **bcrypt password hashing** — passwords are never stored in plaintext
- **LLM output treated as untrusted input** — every Groq response is validated against a strict schema contract before processing, the same threat model applied to user-submitted data

---

## Key Technical Decisions

**Why Groq over OpenAI?**
Groq's inference speed is significantly faster, which matters for a real-time generation UX. The latency difference is noticeable when a user expects instant feedback.

**Why validate LLM output server-side?**
LLMs are non-deterministic. Even with an engineered system prompt, the model can hallucinate unsupported field types or omit required properties. Validating at the API boundary prevents malformed payloads from corrupting frontend state.

**Why store schemas in MySQL as JSON columns?**
For the current scale, MySQL's JSON column type with indexed fields is sufficient. At higher scale, migrating to MongoDB (document storage) would be a natural fit for variable-length, dynamically typed field arrays.

---

## Scaling Roadmap

| Challenge | Solution |
|---|---|
| Groq API rate limits under burst traffic | Decouple generation with BullMQ + Redis job queue; client receives job ID immediately and subscribes via WebSocket for result |
| MySQL bottleneck for dynamic schemas | Migrate form schemas to MongoDB; use MySQL only for relational user/auth data |
| JWT revocation at scale | Redis-backed token blocklist for immediate invalidation without DB hits |
| Real-time collaborative editing | WebSockets + CRDT (Conflict-free Replicated Data Types) for concurrent edits |

---

## Project Structure

```
formcraft/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   │   ├── FormBuilder/ # Drag-and-drop editor
│   │   │   ├── FormPreview/ # Live form renderer
│   │   │   └── Auth/        # Login / Register
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Route-level components
│   │   └── utils/           # API client, helpers
│   └── package.json
│
├── server/                  # Express backend
│   ├── controllers/         # Route handlers
│   ├── middleware/          # JWT auth, error handling
│   ├── routes/              # API route definitions
│   ├── services/
│   │   ├── groq.service.js  # Groq API integration + prompt engineering
│   │   └── validator.js     # LLM response schema validation
│   ├── db/
│   │   └── schema.sql       # MySQL schema
│   └── package.json
│
└── README.md
```

---

## License

MIT
