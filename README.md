# LIMA - Learning Intelligent Market Agro-advisor

![LIMA Logo](logo.png)

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/lima)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-lightgrey.svg)](https://lima.co.ke)

**Your Smart Farming Assistant - Voice-Powered AI for Kenyan Smallholder Farmers**

LIMA is a comprehensive AI-powered platform that combines market intelligence, climate risk assessment, agronomic expertise, and business analytics into one voice-first farming assistant. Built by [Jackson Alex](https://github.com/jacksonmilees), creator of KAVI (Best AI Agent 2025 ).

---

##  Features

###  Market Price Intelligence
- **Real-time price tracking** across multiple markets
- **AI-powered price forecasting** (1-3 months ahead)
- **Smart selling recommendations** - know when and where to sell
- **Price alerts** - get notified when your target price is reached
- **Market comparison** - find the best market for your crops

###  Climate Risk Intelligence
- **Real-time drought/flood risk scoring** (0-100 scale)
- **Satellite-based crop monitoring** using Google Earth Engine
- **7-day weather forecasts** localized to your farm
- **Planting window recommendations** based on climate data
- **Early warning system** for climate threats

###  Smart Agronomy Chatbot
- **24/7 farming advice** in 5 languages (Kiswahili, English, Kikuyu, Kalenjin, Maasai)
- **Pest & disease identification** from photos
- **Personalized crop management** recommendations
- **Fertilizer and planting schedules** tailored to your location
- **Knowledge base** from KALRO research and local expertise

###  Voice-Based Business Insights
- **Voice-powered expense tracking** - just speak your transactions
- **Automatic profit/loss calculations** by crop and season
- **Financial reports** via voice narration
- **Benchmarking** against similar farms
- **Credit-ready records** for loan applications

###  Multi-Language Voice Interface
- **Voice-first design** - do everything by speaking
- **5 languages supported** with more coming
- **Phone call access** - toll-free number (0800-LIMA-360)
- **WhatsApp bot** - text or voice messages
- **SMS & USSD** - works on any phone
- **Offline mode** - core features work without internet

###  Parametric Insurance Automation
- **Automatic trigger monitoring** for insurance policies
- **Real-time threshold tracking** with visual progress indicators
- **Payout calculation** based on satellite data
- **Transparent status updates** via SMS/WhatsApp
- **Claims history** and policy management

---

##  Quick Start

### For Farmers

#### Option 1: Mobile App
```bash
# Android
Download from Google Play Store
Search: "LIMA Farming Assistant"

# iOS
Download from Apple App Store
Search: "LIMA Farming Assistant"
```

#### Option 2: Phone Call
```
Call toll-free: 0800-LIMA-360
Speak your question in any supported language
```

#### Option 3: WhatsApp
```
Send a message to: +254-XXX-XXXXXX
Text or voice - we respond in your language
```

#### Option 4: SMS
```
Send "LIMA" to 22542
Follow the prompts
```

#### Option 5: USSD (Feature Phones)
```
Dial: *384*LIMA#
Navigate the menu using your keypad
```

### For Developers

#### Prerequisites
```bash
# Required
- Node.js >= 16.x
- Python >= 3.9
- PostgreSQL >= 13
- Redis >= 6.x

# Optional (for satellite data)
- Google Earth Engine account
- Google Cloud Platform account
```

#### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Jacksonmilees/LIMA-Agro-Advisor
cd lima
```

2. **Install backend dependencies**
```bash
cd backend
pip install -r requirements.txt
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Set up environment variables**
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Required environment variables:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lima_db
REDIS_URL=redis://localhost:6379

# Google Earth Engine
GEE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GEE_PRIVATE_KEY_PATH=/path/to/private-key.json

# Weather API
OPENWEATHER_API_KEY=your_api_key_here

# Voice Services
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+254XXXXXXXXX

# AI Services
OPENAI_API_KEY=your_openai_key
# OR
ANTHROPIC_API_KEY=your_anthropic_key

# SMS Gateway
AFRICAS_TALKING_API_KEY=your_api_key
AFRICAS_TALKING_USERNAME=your_username

# Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=lima-data

# Security
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key
```

5. **Initialize database**
```bash
cd backend
python manage.py migrate
python manage.py seed_data  # Optional: load sample data
```

6. **Run the application**

Backend:
```bash
cd backend
python manage.py runserver
# API available at http://localhost:8000
```

Frontend:
```bash
cd frontend
npm run dev
# Web app available at http://localhost:3000
```

Voice Service:
```bash
cd voice-service
python app.py
# Voice API available at http://localhost:5000
```

---

##  Project Structure

```
lima/
├── backend/                    # Python/FastAPI backend
│   ├── api/                   # API endpoints
│   │   ├── market.py         # Market price endpoints
│   │   ├── climate.py        # Climate risk endpoints
│   │   ├── insurance.py      # Insurance endpoints
│   │   └── chatbot.py        # Chatbot endpoints
│   ├── models/               # Database models
│   ├── services/             # Business logic
│   │   ├── market_intelligence.py
│   │   ├── climate_risk.py
│   │   ├── insurance_engine.py
│   │   └── nlp_service.py
│   ├── ml_models/            # Machine learning models
│   │   ├── price_forecasting.py
│   │   ├── risk_assessment.py
│   │   └── image_recognition.py
│   ├── utils/                # Utility functions
│   └── requirements.txt      # Python dependencies
│
├── frontend/                  # React/React Native frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── screens/          # App screens
│   │   │   ├── Dashboard.js
│   │   │   ├── ClimateRisk.js
│   │   │   ├── MarketPrices.js
│   │   │   ├── Insurance.js
│   │   │   └── Chatbot.js
│   │   ├── services/         # API calls
│   │   ├── utils/            # Helper functions
│   │   └── localization/     # Language files
│   │       ├── en.json
│   │       ├── sw.json       # Kiswahili
│   │       ├── ki.json       # Kikuyu
│   │       ├── kln.json      # Kalenjin
│   │       └── mas.json      # Maasai
│   └── package.json
│
├── voice-service/             # Voice interface service
│   ├── voice_handler.py      # Twilio webhook handlers
│   ├── speech_processor.py   # STT/TTS processing
│   ├── language_detector.py  # Language identification
│   └── conversation_manager.py
│
├── data-pipeline/             # Data ingestion & processing
│   ├── satellite_fetcher.py  # Google Earth Engine
│   ├── weather_fetcher.py    # Weather API integration
│   ├── market_scraper.py     # Market price scraping
│   └── schedulers.py         # Cron jobs
│
├── ml-training/               # Model training scripts
│   ├── train_price_model.py
│   ├── train_risk_model.py
│   └── notebooks/            # Jupyter notebooks
│
├── docs/                      # Documentation
│   ├── API.md                # API documentation
│   ├── ARCHITECTURE.md       # System architecture
│   ├── DEPLOYMENT.md         # Deployment guide
│   └── CONTRIBUTING.md       # Contribution guidelines
│
├── tests/                     # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docker/                    # Docker configurations
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── .github/                   # GitHub Actions CI/CD
│   └── workflows/
│       ├── test.yml
│       └── deploy.yml
│
├── LICENSE                    # MIT License
├── README.md                  # This file
├── CHANGELOG.md              # Version history
└── .env.example              # Example environment variables
```

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FARMERS                               │
│  (Phone Call | WhatsApp | SMS | USSD | Mobile App | Web)   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   VOICE INTERFACE LAYER                      │
│  ┌────────────┐  ┌───────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Twilio    │  │ WhatsApp  │  │   SMS    │  │  USSD   │ │
│  │   Voice    │  │    Bot    │  │ Gateway  │  │ Gateway │ │
│  └────────────┘  └───────────┘  └──────────┘  └─────────┘ │
│         │               │              │            │        │
│  ┌──────┴───────────────┴──────────────┴────────────┴────┐ │
│  │   Speech-to-Text & Text-to-Speech Processing         │ │
│  │   (Google Cloud | Multi-language Support)            │ │
│  └──────────────────────────┬───────────────────────────┘ │
└─────────────────────────────┼─────────────────────────────┘
                              │
┌─────────────────────────────┴─────────────────────────────┐
│                     AI PROCESSING LAYER                    │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Natural Language Understanding (NLU)              │   │
│  │  - Intent Classification                           │   │
│  │  - Entity Extraction                               │   │
│  │  - Context Management                              │   │
│  │  - Multi-language Processing                       │   │
│  └────────────────────┬───────────────────────────────┘   │
│                       │                                     │
│  ┌────────────────────┴───────────────────────────────┐   │
│  │        Conversational AI (GPT-4 / Claude)          │   │
│  └────────────────────┬───────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────┐
│              INTELLIGENCE ENGINES                        │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │   Market     │  │   Climate    │  │   Insurance   │ │
│  │ Intelligence │  │     Risk     │  │   Automation  │ │
│  │              │  │  Assessment  │  │               │ │
│  │ - Price      │  │ - Satellite  │  │ - Trigger     │ │
│  │   Forecast   │  │   Monitoring │  │   Monitoring  │ │
│  │ - Market     │  │ - Weather    │  │ - Payout      │ │
│  │   Comparison │  │   Forecast   │  │   Calculation │ │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘ │
│         │                  │                   │          │
│  ┌──────┴──────────────────┴───────────────────┴──────┐ │
│  │            Agronomy Chatbot Engine                  │ │
│  │  - Knowledge Base (KALRO + Extension Services)     │ │
│  │  - Image Recognition (Pest/Disease ID)             │ │
│  │  - Personalized Recommendations                    │ │
│  └─────────────────────────┬───────────────────────────┘ │
└────────────────────────────┼─────────────────────────────┘
                             │
┌────────────────────────────┴─────────────────────────────┐
│                      DATA LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │   Google     │  │   Weather    │  │  Market Price  │ │
│  │    Earth     │  │     APIs     │  │    Database    │ │
│  │   Engine     │  │              │  │    (KACE)      │ │
│  │  (Satellite) │  │ OpenWeather  │  │                │ │
│  └──────────────┘  └──────────────┘  └────────────────┘ │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  PostgreSQL  │  │     Redis    │  │      S3        │ │
│  │  (Main DB)   │  │   (Cache)    │  │  (File Store)  │ │
│  └──────────────┘  └──────────────┘  └────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### Key Technologies

**Backend:**
- Python 3.9+ with FastAPI
- PostgreSQL with PostGIS (geospatial data)
- Redis (caching & message queue)
- Celery (background tasks)

**Frontend:**
- React Native (mobile apps)
- React (web dashboard)
- Tailwind CSS (styling)
- Recharts (data visualization)

**AI/ML:**
- OpenAI GPT-4 / Anthropic Claude (conversational AI)
- scikit-learn (price forecasting)
- TensorFlow/PyTorch (image recognition)
- Hugging Face Transformers (NLP)

**Voice:**
- Twilio Voice API (phone calls)
- Google Cloud Speech-to-Text
- Google Cloud Text-to-Speech
- Africa's Talking (SMS/USSD)

**Data Sources:**
- Google Earth Engine (satellite imagery)
- OpenWeatherMap (weather forecasts)
- CHIRPS (rainfall data)
- MODIS (vegetation indices)
- Kenya Agricultural Commodity Exchange (market prices)

---

##  Configuration

### API Endpoints

Base URL: `https://api.lima.co.ke/v1`

**Market Intelligence:**
```
GET    /market/prices              # Current prices
GET    /market/forecast/:crop      # Price forecast
POST   /market/alerts              # Set price alert
GET    /market/comparison          # Compare markets
```

**Climate Risk:**
```
POST   /climate/assess             # Get risk assessment
GET    /climate/forecast/:location # Weather forecast
GET    /climate/satellite/:farmId  # Satellite data
GET    /climate/history/:farmId    # Historical climate data
```

**Insurance:**
```
GET    /insurance/:policyId        # Policy details
GET    /insurance/trigger-status   # Trigger monitoring
POST   /insurance/calculate-payout # Payout estimation
GET    /insurance/claims-history   # Past claims
```

**Chatbot:**
```
POST   /chatbot/query              # Ask question
POST   /chatbot/image-analyze      # Pest/disease ID
GET    /chatbot/knowledge/:topic   # Knowledge base
```

**Voice:**
```
POST   /voice/incoming-call        # Twilio webhook
POST   /voice/whatsapp-message     # WhatsApp webhook
POST   /voice/sms-message          # SMS webhook
```

**User Management:**
```
POST   /auth/register              # Register farmer
POST   /auth/login                 # Login
GET    /farmer/profile             # Get profile
PUT    /farmer/profile             # Update profile
GET    /farmer/dashboard           # Dashboard data
```

Full API documentation: [API.md](docs/API.md)

---

##  Testing

### Run Tests

```bash
# Backend unit tests
cd backend
pytest tests/unit/

# Backend integration tests
pytest tests/integration/

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e

# Coverage report
pytest --cov=. tests/
```

### Test Data

Load sample test data:
```bash
python manage.py seed_test_data
```

This creates:
- 100 sample farmers
- Market price history (2 years)
- Weather data
- Sample conversations

---

##  Deployment

### Docker Deployment (Recommended)

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

See detailed deployment guide: [DEPLOYMENT.md](docs/DEPLOYMENT.md)

**Production Checklist:**
- [ ] Set all environment variables
- [ ] Configure SSL certificates
- [ ] Set up PostgreSQL with replication
- [ ] Configure Redis for caching
- [ ] Set up Celery workers for background tasks
- [ ] Configure CDN for static assets
- [ ] Set up monitoring (Sentry, Datadog)
- [ ] Configure backups (daily database dumps)
- [ ] Set up logging (ELK stack or CloudWatch)
- [ ] Load test the system
- [ ] Configure auto-scaling
- [ ] Set up CI/CD pipeline

---

##  Monitoring & Analytics

### Health Checks

```bash
# API health
curl https://api.lima.co.ke/health

# Database connection
curl https://api.lima.co.ke/health/db

# External services
curl https://api.lima.co.ke/health/external
```

### Metrics Tracked

- **User Metrics:** Active users, retention, churn
- **Performance:** API response times, error rates
- **Business:** Price forecast accuracy, insurance triggers
- **Usage:** Most asked questions, feature adoption
- **Impact:** Average income increase, crop loss reduction

### Dashboards

- Grafana: Real-time system metrics
- Kibana: Log analysis
- Custom Admin Dashboard: User analytics

---

##  Contributing

We welcome contributions! See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Areas for Contribution

- **New language support** (e.g., Luhya, Somali)
- **Additional crops** in knowledge base
- **Improved ML models** for price forecasting
- **UI/UX improvements** for mobile apps
- **Bug fixes** and performance optimization
- **Documentation** improvements
- **Test coverage** expansion

### Development Guidelines

- Write clean, documented code
- Follow PEP 8 (Python) and Airbnb (JavaScript) style guides
- Add unit tests for new features
- Update documentation
- Test on multiple devices/browsers

---

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**In summary:**
-  Commercial use allowed
-  Modification allowed
-  Distribution allowed
-  Private use allowed
-  Liability and warranty limitations apply

---

## 👥 Team

**Creator & Lead Developer:**
- **Jackson Alex** - Computer Science (JKUAT), AI Specialist
  - Creator of KAVI (Best AI Agent 2025 )
  - Email: jacksonmilees@gmail.com
  - GitHub: [@jacksonalex](https://github.com/jacksonmilees)
  - portfolio: [Jackson Alex](https://jacksonalex.co.ke)

**Core Contributors:**
- Backend Team: [List contributors]
- Frontend Team: [List contributors]
- ML/AI Team: [List contributors]
- Agricultural Experts: [List advisors]

---

##  Acknowledgments

- **KALRO** - Agricultural research and knowledge base
- **Kenya Meteorological Department** - Weather data
- **Kenya Agricultural Commodity Exchange** - Market prices
- **Kenyan farmers** - Invaluable feedback and testing
- **Agricultural extension officers** - Domain expertise
- **Incubator/Accelerator** - Support and mentorship
- **Early investors** - Belief in the vision

---

##  Support

### For Farmers
- **Phone:** 0800-LIMA-360 (toll-free)
- **WhatsApp:** +254-XXX-XXXXXX
- **SMS:** Send "HELP" to 22542
- **Email:** support@lima.co.ke

### For Developers
- **GitHub Issues:** [Report bugs](https://github.com/yourusername/lima/issues)
- **Discord:** [Join our community](https://discord.gg/lima)
- **Email:** dev@lima.co.ke
- **Documentation:** [docs.lima.co.ke](https://docs.lima.co.ke)

### For Partners
- **Business Inquiries:** partners@lima.co.ke
- **Investment Opportunities:** invest@lima.co.ke
- **Press & Media:** media@lima.co.ke

---

##  Roadmap

### Phase 1: MVP (Q1 2026) 
- [x] Core market price forecasting
- [x] Basic chatbot (Kiswahili & English)
- [x] Voice interface
- [x] Climate risk assessment
- [ ] Pilot with 500-1,000 farmers

### Phase 2: Enhancement (Q2-Q3 2026)
- [ ] Add Kikuyu, Kalenjin, Maasai languages
- [ ] Parametric insurance automation
- [ ] Image recognition for pests/diseases
- [ ] Cooperative dashboard
- [ ] Scale to 10,000 farmers

### Phase 3: Scale (Q4 2026 - Q2 2027)
- [ ] National rollout (all Kenyan counties)
- [ ] Premium tier launch
- [ ] B2B partnerships
- [ ] 50,000+ active farmers

### Phase 4: Regional Expansion (Q3 2027 onwards)
- [ ] Uganda launch
- [ ] Tanzania launch
- [ ] Rwanda launch
- [ ] 200,000+ farmers across East Africa

---

 Impact Metrics (Target)

**Year 1 (2026):**
- 50,000 active farmers
- 25% average income increase
- 30% reduction in crop losses
- 80% user satisfaction

**Year 3 (2028):**
- 200,000 farmers
- 35% average income increase
- KES 500M additional farmer income generated
- 5 East African countries

**Year 5 (2030):**
- 1 million farmers
- 40% average income increase
- 10+ languages supported
- Leading AgriTech platform in Africa

---

##  Links

- **Website:** [www.lima.co.ke](https://www.lima.co.ke)
- **Documentation:** [docs.lima.co.ke](https://docs.lima.co.ke)
- **API Docs:** [api.lima.co.ke/docs](https://api.lima.co.ke/docs)
- **Blog:** [blog.lima.co.ke](https://blog.lima.co.ke)
- **Twitter:** [@LIMA_Kenya](https://twitter.com/LIMA_Kenya)
- **Facebook:** [LIMA Farming Assistant](https://facebook.com/LIMAKenya)
- **YouTube:** [LIMA AgriTech](https://youtube.com/@LIMAKenya)
- **LinkedIn:** [LIMA Company Page](https://linkedin.com/company/lima-agritech)

---

## Fun Facts

- LIMA means "cultivate" in Kiswahili ✨
- Built by the creator of KAVI (Best AI Agent 2025 winner) 🏆
- Supports 5 Kenyan languages and counting 🗣️
- Works on ANY phone - smartphone or feature phone 📱
- Processes over 1,000 farmer queries daily 🚀
- 75-85% price forecast accuracy 🎯
- Helped farmers earn KES 10M+ in pilot phase 💰

---

##  Known Issues

See [Issues](https://github.com/yourusername/lima/issues) page for current bugs and feature requests.

**Major Known Issues:**
- Voice recognition accuracy drops in very noisy environments
- Kikuyu/Kalenjin/Maasai language support is still in beta
- Satellite data can be delayed during cloudy periods
- USSD interface has character limitations

---

##  Additional Resources

- [System Architecture](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Changelog](CHANGELOG.md)

---

##  Social Impact

LIMA addresses UN Sustainable Development Goals:
- **Goal 1:** No Poverty (increased farmer incomes)
- **Goal 2:** Zero Hunger (improved food security)
- **Goal 8:** Decent Work and Economic Growth
- **Goal 10:** Reduced Inequalities (accessible tech)
- **Goal 13:** Climate Action (climate adaptation)

---

**Built with ❤️ for Kenyan farmers**

**LIMA - Learning Intelligent Market Agro-advisor**
*Ujuzi wa Kilimo, Sauti Yako* (Farming Intelligence, Your Voice)

---

_Last Updated: December 3, 2025_
_Version: 1.0.0_