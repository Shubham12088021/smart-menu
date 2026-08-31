# 🍽️ AI-Based Smart Digital Menu Designer & QR Ordering System

A complete, modern full-stack web application that enables restaurant owners to create professional digital menus with AI-assisted content generation, beautiful templates, QR code ordering, and a real-time dashboard.

**Built as a BTech Final Year Project** — 100% free, runs entirely locally.

---

## ✨ Features

### 🏪 Restaurant Management
- Complete restaurant profile (name, logo, description, address, contact, hours, social media)
- Slug-based public URL generation

### 📋 Menu Management
- Create unlimited categories and menu items
- Full CRUD (Add, Edit, Delete, Duplicate)
- Drag-and-drop reorder for categories and items
- Food image upload with validation
- Veg/Non-Veg, Spicy, and Bestseller indicators

### 🤖 AI Assistant (Ollama)
- AI-generated food item descriptions
- Restaurant tagline generator (5 suggestions at once)
- Category description generator
- **Graceful fallback** — app works fully without AI

### 🎨 5 Beautiful Menu Templates
| Template | Style |
|----------|-------|
| Modern | Clean cards, shadows, sans-serif |
| Minimal | Whitespace, thin borders, elegant |
| Café | Warm tones, cozy serif headings |
| Luxury | Dark background, gold accents |
| Street Food | Bold colors, energetic layout |

### 📱 Live Menu Preview
- Real-time preview while editing design
- Typography, layout, and color customization

### 📲 QR Code Generation
- Auto-generated QR code for your menu
- Download as PNG
- Print-ready output
- Free `qrcode` Python library

### 🛒 Customer Ordering
- Mobile-first customer menu page
- Search and filter (Veg, Non-Veg, Spicy, Bestseller)
- Category tabs navigation
- Add to cart with quantity management
- Place orders with name and table number
- No login required for customers

### 📊 Dashboard & Analytics
- Professional admin dashboard with statistics
- Order management with status flow (Pending → Preparing → Ready → Completed)
- Revenue tracking
- Menu views and QR scan analytics
- Order trend charts (Recharts)
- Top ordered items visualization

### 🌙 Dark Mode
- Light/Dark/System theme support
- Persisted in localStorage

### 🔐 Authentication
- JWT-based authentication
- Register and Login
- Protected dashboard routes
- Public menu access without login

---

## 🏗️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6 |
| **Backend** | Python 3.10+, FastAPI, SQLAlchemy |
| **Database** | SQLite (zero-config) |
| **AI** | Ollama + llama3.2 (optional) |
| **Charts** | Recharts |
| **Drag & Drop** | @dnd-kit |
| **QR Code** | qrcode (Python library) |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |

---

## 📁 Project Structure

```
smart-menu/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── api/                  # API route handlers
│   │   │   ├── auth.py           # Registration, Login, JWT
│   │   │   ├── restaurant.py     # Restaurant profile CRUD
│   │   │   ├── categories.py     # Category management
│   │   │   ├── menu.py           # Menu item CRUD
│   │   │   ├── ai.py             # AI description/tagline
│   │   │   ├── qr.py             # QR code generation
│   │   │   ├── public.py         # Public menu (no auth)
│   │   │   ├── orders.py         # Order management
│   │   │   └── analytics.py      # Dashboard analytics
│   │   ├── models/models.py      # SQLAlchemy ORM models
│   │   ├── schemas/schemas.py    # Pydantic validation
│   │   ├── services/
│   │   │   ├── ai_service.py     # Ollama integration
│   │   │   └── seed_data.py      # Demo data seeder
│   │   ├── database/database.py  # DB configuration
│   │   └── utils/
│   │       ├── auth.py           # JWT + password hashing
│   │       └── files.py          # Image upload handling
│   ├── uploads/                  # Uploaded images
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Routing
│   │   ├── components/           # 15+ reusable components
│   │   ├── pages/                # 13 pages
│   │   ├── layouts/              # Dashboard + Public layouts
│   │   ├── services/             # API service layer
│   │   ├── hooks/                # useAuth, useDarkMode
│   │   └── utils/constants.js    # Templates, formatters
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Python 3.10+** installed
- **Node.js 18+** and **npm** installed
- **Ollama** (optional, for AI features)

### 1. Clone / Download

```bash
cd smart-menu
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy ..\.env.example .env    # Windows
# cp ../.env.example .env    # macOS/Linux

# Run the server
uvicorn app.main:app --reload
```

The backend starts at **http://localhost:8000**

API docs available at **http://localhost:8000/docs**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

The frontend starts at **http://localhost:5173**

### 4. Ollama Setup (Optional)

```bash
# Install Ollama from https://ollama.ai

# Pull a model
ollama pull llama3.2

# Ollama runs at http://localhost:11434
```

> **Note:** The application works fully without Ollama. AI features will show "AI unavailable" and you can enter content manually.

---

## 🎮 Demo Flow

1. Open **http://localhost:5173**
2. Click **"Get Started"** or login with **demo / demo123**
3. Explore the dashboard — it comes pre-loaded with "Urban Spice" restaurant
4. Go to **Menu** → Add/Edit items
5. Go to **AI Assistant** → Generate descriptions
6. Go to **Design** → Choose template, customize colors
7. Go to **QR Code** → Download/Print QR
8. Open **http://localhost:5173/menu/urban-spice** to see the customer menu
9. Add items to cart → Place an order
10. Back in dashboard → **Orders** → See incoming order → Update status

---

## 📡 API Documentation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | ❌ | Register user |
| POST | /api/auth/login | ❌ | Login |
| GET | /api/auth/me | ✅ | Current user |
| GET | /api/restaurant | ✅ | Get profile |
| PUT | /api/restaurant | ✅ | Update profile |
| POST | /api/restaurant/logo | ✅ | Upload logo |
| GET | /api/categories | ✅ | List categories |
| POST | /api/categories | ✅ | Create category |
| PUT | /api/categories/:id | ✅ | Update category |
| DELETE | /api/categories/:id | ✅ | Delete category |
| GET | /api/menu | ✅ | List items |
| POST | /api/menu | ✅ | Create item |
| PUT | /api/menu/:id | ✅ | Update item |
| DELETE | /api/menu/:id | ✅ | Delete item |
| POST | /api/menu/:id/duplicate | ✅ | Duplicate item |
| POST | /api/menu/:id/image | ✅ | Upload image |
| POST | /api/ai/description | ✅ | Generate description |
| POST | /api/ai/tagline | ✅ | Generate taglines |
| GET | /api/ai/status | ❌ | AI availability |
| GET | /api/qr/image/:slug | ❌ | QR code image |
| GET | /api/qr/download/:slug | ❌ | Download QR PNG |
| GET | /api/public/menu/:slug | ❌ | Public menu data |
| POST | /api/orders | ❌ | Place order |
| GET | /api/orders | ✅ | List orders |
| PUT | /api/orders/:id/status | ✅ | Update status |
| GET | /api/analytics | ✅ | Dashboard stats |

---

## 🔐 Environment Variables

```env
DATABASE_URL=sqlite:///./menu.db
SECRET_KEY=your-secret-key-here
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
FRONTEND_URL=http://localhost:5173
```

---

## 📸 Screenshots

> Screenshots will be available after running the application.

- Landing Page
- Login / Register
- Dashboard Home
- Menu Manager with Drag & Drop
- AI Description Generator
- Design Customizer with Live Preview
- QR Code Page
- Customer Mobile Menu
- Cart & Ordering
- Order Management
- Analytics Dashboard

---

## 🔮 Future Scope

- Multi-language menu support
- Online payment integration (Razorpay/UPI)
- Table-wise order tracking with real-time notifications
- AI-powered food image generation
- Menu performance analytics with recommendations
- PWA support for offline menu access
- Multi-branch restaurant support
- Inventory management integration
- Customer feedback and rating system

---

## ⚠️ Limitations

- No online payment (orders stored locally)
- AI requires Ollama running locally
- Single-user/single-restaurant per account
- No real-time WebSocket notifications (polling-based)
- SQLite is single-file (not suitable for production scale)

---

## 📄 License

This project is built for educational purposes as a BTech Final Year Project.

---

## 👨‍💻 Built With

Made with ❤️ using Python, React, and AI.
