# LIMA Architecture Diagram - Image Generation Prompt

## Prompt for Image Generation Model

Create a professional, modern system architecture diagram for LIMA (Learning Intelligent Market Agro-advisor) with the following components and specifications:

---

## Visual Style Requirements

- **Style**: Modern, clean, technical architecture diagram
- **Color Scheme**: 
  - Primary: Emerald green (#10b981) for agricultural/LIMA branding
  - Accent: Blue (#3b82f6) for data flow
  - Neutral: Gray (#6b7280) for infrastructure
  - Background: White or light gray (#f9fafb)
- **Layout**: Vertical flow from top (user layer) to bottom (data layer)
- **Icons**: Use simple, rounded icons for each component
- **Arrows**: Bidirectional arrows with labels showing data flow
- **Font**: Sans-serif, clean, professional (similar to Inter or Roboto)

---

## Architecture Layers (Top to Bottom)

### Layer 1: USER INTERFACE LAYER
**Position**: Top of diagram

**Components** (arrange horizontally):
1. **Feature Phone** (icon: old mobile phone)
   - Label: "SMS/USSD"
   - Color: Gray
   
2. **Smartphone** (icon: modern smartphone)
   - Label: "PWA (React)"
   - Color: Emerald green
   
3. **Web Browser** (icon: browser window)
   - Label: "Web Dashboard"
   - Color: Emerald green

**Arrow down to**: API Gateway

---

### Layer 2: COMMUNICATION LAYER
**Position**: Below User Interface

**Components** (arrange horizontally):
1. **Twilio** (icon: communication/phone)
   - Label: "Voice & SMS"
   - Color: Red accent
   
2. **WhatsApp Business** (icon: WhatsApp logo)
   - Label: "Chatbot"
   - Color: Green accent
   
3. **USSD Gateway** (icon: signal tower)
   - Label: "*384*LIMA#"
   - Color: Blue accent

**Arrow down to**: API Gateway

---

### Layer 3: API GATEWAY
**Position**: Center of diagram

**Component**: Large rounded rectangle
- Label: "**API Gateway**"
- Sub-label: "FastAPI (Python)"
- Icon: Server/gateway icon
- Color: Blue
- Show endpoints: `/api/v1/*`

**Arrows**:
- **Up**: To User Interface & Communication layers
- **Down**: To Application Services
- **Right**: To External Services (side panel)

---

### Layer 4: APPLICATION SERVICES LAYER
**Position**: Below API Gateway

**Components** (arrange in 3 columns):

**Column 1: Climate Services**
1. **Climate Risk Engine** (icon: cloud with data)
   - Label: "Climate Risk Assessment"
   - Technologies: "Python, NumPy, scikit-learn"
   - Color: Emerald green

2. **Insurance Automation** (icon: shield)
   - Label: "Parametric Insurance"
   - Technologies: "Trigger Monitoring"
   - Color: Emerald green

**Column 2: Market Services**
1. **Market Intelligence** (icon: chart trending up)
   - Label: "Price Forecasting"
   - Technologies: "LSTM, Time Series"
   - Color: Blue

2. **Recommendation Engine** (icon: lightbulb)
   - Label: "Smart Recommendations"
   - Technologies: "ML Models"
   - Color: Blue

**Column 3: Agronomy Services**
1. **Chatbot Service** (icon: chat bubble)
   - Label: "AI Agronomy Advisor"
   - Technologies: "Google Gemini"
   - Color: Purple

2. **Voice Assistant** (icon: microphone)
   - Label: "Voice Interface"
   - Technologies: "Speech-to-Text"
   - Color: Purple

**Arrows down to**: Database Layer

---

### Layer 5: AI/ML PROCESSING LAYER
**Position**: Below Application Services (slightly offset to right)

**Component**: Rounded rectangle with gradient
- Label: "**Google Gemini AI**"
- Sub-label: "Language Model Processing"
- Icon: Brain/AI icon
- Color: Purple to pink gradient
- Functions shown:
  - Natural Language Understanding
  - Multi-language Translation
  - Knowledge Base Query

**Arrows**:
- **Left**: Bidirectional to Chatbot & Voice Assistant
- **Down**: To External Data Sources

---

### Layer 6: DATABASE LAYER
**Position**: Below Application Services

**Component**: Large database icon
- Label: "**Supabase PostgreSQL**"
- Icon: Cylinder/database icon
- Color: Green accent
- Show tables (small boxes inside):
  - `farmers` (user profiles)
  - `farms` (farm data)
  - `climate_data` (risk scores)
  - `market_prices` (price history)
  - `insurance_policies` (coverage)
  - `transactions` (expenses/revenue)

**Features** (small badges):
- "Real-time subscriptions"
- "Row-level security"
- "PostGIS (geospatial)"

**Arrows**:
- **Up**: Bidirectional to all Application Services
- **Right**: To Caching Layer

---

### Layer 7: CACHING LAYER
**Position**: Right side, aligned with Database

**Component**: Rounded rectangle
- Label: "**Redis Cache**"
- Icon: Lightning bolt
- Color: Red accent
- Functions:
  - 24-hour climate data cache
  - Session management
  - Rate limiting

**Arrows**:
- **Left**: To Database
- **Up**: To API Gateway

---

### SIDE PANEL: EXTERNAL DATA SOURCES
**Position**: Right side of diagram

**Components** (stacked vertically):

1. **Google Earth Engine** (icon: satellite)
   - Label: "Satellite Imagery"
   - Data: "NDVI, Soil Moisture"
   - Color: Blue
   
2. **OpenWeatherMap** (icon: weather cloud)
   - Label: "Weather Forecasts"
   - Data: "7-day predictions"
   - Color: Blue

3. **KACE API** (icon: market/building)
   - Label: "Market Prices"
   - Data: "Daily crop prices"
   - Color: Green

4. **KALRO Database** (icon: document/research)
   - Label: "Agronomic Knowledge"
   - Data: "Best practices"
   - Color: Purple

**Arrows**: All arrow left into AI/ML Processing Layer and Application Services

---

### BOTTOM: INFRASTRUCTURE LAYER
**Position**: Bottom of diagram

**Components** (arrange horizontally):

1. **Vercel** (icon: triangle)
   - Label: "Frontend Hosting"
   - Color: Black
   
2. **Railway/Render** (icon: server)
   - Label: "Backend Hosting"
   - Sub-label: "Python FastAPI"
   - Color: Purple

3. **Supabase Cloud** (icon: database with cloud)
   - Label: "Database Hosting"
   - Sub-label: "PostgreSQL + Auth"
   - Color: Green

4. **Firebase Storage** (icon: folder)
   - Label: "File Storage"
   - Sub-label: "Images, Reports"
   - Color: Orange

---

## Data Flow Annotations

Add these labeled arrows showing key data flows:

1. **Farmer Query** (green arrow):
   - From Smartphone → API Gateway → Chatbot Service → Google Gemini → Database
   
2. **Climate Alert** (orange arrow):
   - From Google Earth Engine → Climate Risk Engine → Database → API Gateway → SMS (Twilio)

3. **Market Price Update** (blue arrow):
   - From KACE API → Market Intelligence → Database → API Gateway → PWA

4. **Insurance Payout** (red arrow):
   - From Google Earth Engine → Insurance Automation → Database → API Gateway → WhatsApp

---

## Additional Visual Elements

1. **Legend** (bottom right corner):
   - Data flow (solid arrow)
   - API call (dashed arrow)
   - Real-time sync (double arrow)
   - External service (dotted border)

2. **Security Badge** (top right):
   - Icon: Lock/shield
   - Text: "End-to-end encryption, GDPR compliant"

3. **Offline Mode Badge** (top left):
   - Icon: Download cloud
   - Text: "PWA - Works offline"

4. **Scale Indicator** (bottom left):
   - Text: "Scalable to 1M+ users"
   - Icon: Horizontal scaling arrows

---

## Technical Specifications for Image Generator

- **Dimensions**: 1920x1080 pixels (landscape) or 1200x1600 (portrait)
- **Resolution**: High DPI (300 dpi) for print quality
- **File Format**: PNG with transparent background (or white)
- **Component Spacing**: Consistent 40-60px padding between elements
- **Arrow Style**: Rounded corners, 3px width, with direction indicators
- **Font Sizes**: 
  - Layer titles: 18pt bold
  - Component labels: 14pt semi-bold
  - Sub-labels: 10pt regular
  - Annotations: 9pt italic

---

## Alternative Prompt (Simplified Version)

If the above is too complex, use this condensed prompt:

**"Create a modern system architecture diagram for an agricultural AI platform called LIMA. Show:**

**- Top layer: Mobile phones and web browsers (users)**
**- Communication layer: Twilio, WhatsApp, USSD**
**- Middle layer: FastAPI Python backend with 6 microservices (Climate Risk, Insurance, Market Intelligence, Recommendations, Chatbot, Voice Assistant)**
**- AI layer: Google Gemini for natural language processing**
**- Database layer: Supabase PostgreSQL with 6 tables**
**- Right side panel: External data sources (Google Earth Engine satellite data, OpenWeatherMap, Market Price APIs)**
**- Bottom layer: Cloud infrastructure (Vercel, Railway, Supabase Cloud)**

**Use emerald green as primary color, modern rounded rectangles for components, bidirectional arrows showing data flow. Style: Clean, professional, technical diagram similar to AWS architecture diagrams. Include icons for each component."**

---

## Example Tools to Use This Prompt With

1. **DALL-E 3**: Copy the simplified prompt directly
2. **Midjourney**: Use with `--style technical --ar 16:9` flags
3. **Stable Diffusion**: Add "technical architecture diagram, clean design, isometric view" to prompt
4. **Figma**: Use as a specification guide for manual design
5. **Lucidchart/Draw.io**: Use as a component checklist

---

## Python Code to Generate Programmatically (Alternative)

If you prefer to generate the diagram programmatically instead of using an image AI, here's a Python script using diagrams library:

```python
from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import Client, Users
from diagrams.onprem.database import PostgreSQL
from diagrams.onprem.inmemory import Redis
from diagrams.programming.framework import FastAPI
from diagrams.saas.communication import Twilio
from diagrams.custom import Custom

with Diagram("LIMA Architecture", show=False, direction="TB"):
    # User Layer
    with Cluster("Users"):
        users = [Client("Feature Phone"), Client("Smartphone"), Client("Web")]
    
    # Communication Layer
    with Cluster("Communication"):
        twilio = Twilio("Voice/SMS")
        whatsapp = Custom("WhatsApp", "./whatsapp_icon.png")
    
    # API Gateway
    api = FastAPI("API Gateway")
    
    # Application Services
    with Cluster("Services"):
        climate = Custom("Climate Risk", "./service_icon.png")
        market = Custom("Market Intel", "./service_icon.png")
        insurance = Custom("Insurance", "./service_icon.png")
        chatbot = Custom("Chatbot", "./service_icon.png")
    
    # AI Layer
    gemini = Custom("Google Gemini", "./gemini_icon.png")
    
    # Database Layer
    with Cluster("Data"):
        db = PostgreSQL("Supabase")
        cache = Redis("Cache")
    
    # External Sources
    with Cluster("External Data"):
        gee = Custom("Google Earth Engine", "./satellite_icon.png")
        weather = Custom("OpenWeather", "./weather_icon.png")
    
    # Connections
    users >> api
    [twilio, whatsapp] >> api
    api >> [climate, market, insurance, chatbot]
    chatbot >> gemini
    [climate, market, insurance, chatbot] >> db
    db >> cache
    [gee, weather] >> [climate, market]
```

Install: `pip install diagrams`
Run: `python architecture_diagram.py`

---

**Generated by**: LIMA Development Team  
**Date**: December 2025  
**Purpose**: Hackathon presentation and technical documentation
