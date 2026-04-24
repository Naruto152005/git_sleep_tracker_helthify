# Project Structure

```
gogte_project/
│
├── backend/                          # Python Flask Backend
│   ├── database/
│   │   ├── __init__.py
│   │   └── db_connection.py         # Supabase connection & setup
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py                # Data models (User, SleepLog, etc.)
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth_routes.py           # Authentication endpoints
│   │   ├── sleep_routes.py          # Sleep tracking endpoints
│   │   ├── productivity_routes.py   # Productivity tracking endpoints
│   │   └── ai_coach_routes.py       # AI coaching endpoints
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   └── ai_service.py            # AI logic (OpenAI/Gemini)
│   │
│   ├── scripts/                      # Verification and utility scripts
│   │   ├── verify_auth.py
│   │   ├── verify_tables.py
│   │   └── ...
│   │
│   ├── app.py                       # Main Flask application
│   ├── requirements.txt             # Python dependencies
│   ├── .env.example                 # Environment variables template
│   └── .gitignore                   # Git ignore rules
│
├── frontend/                         # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx           # Main layout component
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login/Register page
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   ├── SleepTracker.jsx     # Sleep logging page
│   │   │   ├── ProductivityTracker.jsx  # Productivity logging page
│   │   │   └── AICoach.jsx          # AI coach interface
│   │   │
│   │   ├── services/
│   │   │   └── api.js               # API service layer
│   │   │
│   │   ├── App.jsx                  # Main App component
│   │   ├── App.css                  # App styles
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   │
│   ├── public/                      # Static assets
│   ├── index.html                   # HTML template
│   ├── package.json                 # Node dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind CSS config
│   ├── postcss.config.js           # PostCSS config
│   ├── .env.example                # Environment variables template
│   └── .gitignore                  # Git ignore rules
│
├── README.md                        # Main documentation
├── QUICKSTART.md                   # Quick start guide
└── .dist/                          # Build output directory

```

## Component Descriptions

### Backend Components

#### **app.py**
- Main Flask application entry point
- Registers all route blueprints
- Initializes database connection
- Configures CORS and middleware

#### **database/db_connection.py**
- Supabase connection management
- Database initialization
- Connection pooling for Postgres

#### **models/models.py**
- `User`: User account model
- `SleepLog`: Sleep tracking data model
- `ProductivityLog`: Productivity data model
- `AIRecommendation`: AI-generated recommendations model

#### **routes/**
- **auth_routes.py**: Registration, login, Google OAuth (Supabase Auth)
- **sleep_routes.py**: Sleep logging, analytics, trends
- **productivity_routes.py**: Productivity logging, correlation analysis
- **ai_coach_routes.py**: AI recommendations, chat, insights

#### **services/ai_service.py**
- AI API integration (OpenAI/Gemini)
- Prompt engineering
- Fallback responses when API unavailable
- Predictive analytics

### Frontend Components

#### **App.jsx**
- Main application component
- Authentication state management
- Route configuration
- User session handling

#### **components/Layout.jsx**
- Navigation bar
- Page layout wrapper
- User menu
- Responsive design

#### **pages/**
- **Login.jsx**: Authentication interface
- **Dashboard.jsx**: Overview with charts and insights
- **SleepTracker.jsx**: Sleep data entry form
- **ProductivityTracker.jsx**: Productivity data entry form
- **AICoach.jsx**: Chat interface and predictive insights

#### **services/api.js**
- Axios instance configuration
- API endpoint definitions
- Request interceptors
- Error handling


## Data Flow

### AI Coaching Flow
```
User Question (Frontend)
    ↓
coachAPI.chat()
    ↓
Backend Route (/api/coach/chat)
    ↓
AIService.chat_response()
    ↓
AI API Call (or Fallback)
    ↓
Response Processing
    ↓
Return to User
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/google-auth` - Google OAuth

### Sleep Tracking
- `POST /api/sleep/log` - Log sleep data
- `GET /api/sleep/logs/:userId?days=30` - Get sleep logs
- `GET /api/sleep/analytics/:userId?days=30` - Get analytics

### Productivity
- `POST /api/productivity/log` - Log productivity data
- `GET /api/productivity/logs/:userId?days=30` - Get logs
- `GET /api/productivity/correlation/:userId` - Get sleep-productivity correlation

### AI Coach
- `GET /api/coach/recommendation/:userId` - Get daily recommendation
- `POST /api/coach/chat` - Chat with AI assistant
- `GET /api/coach/insights/:userId` - Get predictive insights
- `GET /api/coach/recommendations/:userId?days=7` - Get all recommendations

## Database Tables (Supabase/PostgreSQL)

### users
- `id`: UUID (Primary Key)
- `email`: Text (Unique)
- `name`: Text
- `google_id`: Text (Optional)
- `created_at`: Timestamptz
- `preferences`: JSONB (Target hours, bedtime, etc.)
- `profile`: JSONB (Age, occupation, etc.)

### sleep_logs
- `id`: Bigint (Primary Key)
- `user_id`: UUID (Foreign Key)
- `date`: Date
- `sleep_time`: Timestamptz
- `wake_time`: Timestamptz
- `duration_hours`: Numeric
- `mood`: Integer (1-5)
- `sleep_quality`: Integer (1-5)
- `notes`: Text
- `created_at`: Timestamptz

### productivity_logs
- `id`: Bigint (Primary Key)
- `user_id`: UUID (Foreign Key)
- `date`: Date
- `productivity_score`: Integer (1-10)
- `focus_level`: Integer (1-5)
- `tasks_completed`: Integer
- `energy_level`: Integer (1-5)
- `notes`: Text
- `created_at`: Timestamptz

### ai_recommendations
- `id`: Bigint (Primary Key)
- `user_id`: UUID (Foreign Key)
- `type`: Text
- `content`: Text
- `priority`: Text
- `read`: Boolean
- `created_at`: Timestamptz
- `expires_at`: Timestamptz (Optional)

## Technology Stack Details

### Frontend
- **React 18**: Latest React features
- **Vite**: Fast build tool
- **TailwindCSS**: Utility-first CSS
- **Chart.js**: Data visualization
- **Axios**: HTTP client
- **React Router**: Navigation

### Backend
- **Flask**: Lightweight Python web framework
- **Supabase-py**: Supabase Python client
- **OpenAI/Gemini**: AI API integration
- **Flask-CORS**: CORS handling
- **PyJWT**: JWT authentication
- **python-dotenv**: Environment management

### Database
- **Supabase**: PostgreSQL database with Auth and Realtime
- Row Level Security (RLS) enabled
- Relational schema with foreign keys

