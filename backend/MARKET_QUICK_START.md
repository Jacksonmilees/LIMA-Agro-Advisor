# LIMA Market Module - Quick Start

## Setup

```bash
cd d:\2025-Projects\hackathon\LIMA-Agro-Advisor\backend

# Create & apply migrations
python manage.py makemigrations market
python manage.py migrate

# Create dummy data (60 days of prices + alerts)
python manage.py create_market_data

# Restart server
python manage.py runserver
```

## API Endpoints (7)

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/market/prices/` | List market prices with filters |
| `GET /api/v1/market/prices/latest/` | Latest price for each crop |
| `GET /api/v1/market/prices/trend/` | Price trend analysis |
| `GET/POST /api/v1/market/alerts/` | User price alerts |
| `GET/PATCH/DELETE /api/v1/market/alerts/{id}/` | Alert CRUD |
| `GET /api/v1/market/forecast/` | AI price forecast |
| `GET /api/v1/market/best-time-to-sell/` | Sell recommendation |

## Quick Tests

### 1. Get Latest Prices
```
GET http://127.0.0.1:8000/api/v1/market/prices/latest/
Authorization: Bearer <token>
```

### 2. Price Trend (Maize)
```
GET http://127.0.0.1:8000/api/v1/market/prices/trend/?crop=Maize&days=30
Authorization: Bearer <token>
```

### 3. Create Price Alert
```
POST http://127.0.0.1:8000/api/v1/market/alerts/
Authorization: Bearer <token>

{
  "crop": "Maize",
  "target_price": 50,
  "market": "national",
  "notify_email": true
}
```

### 4. Get Forecast
```
GET http://127.0.0.1:8000/api/v1/market/forecast/?crop=Maize&days=7
Authorization: Bearer <token>
```

### 5. Best Time to Sell
```
GET http://127.0.0.1:8000/api/v1/market/best-time-to-sell/?crop=Maize
Authorization: Bearer <token>
```

## Features

✅ 60 days of historical price data  
✅ Price trend analysis (rising/falling/stable)
✅ Moving average forecasting  
✅ User price alerts
✅ Best-time-to-sell recommendations  
✅ Multi-market support  
✅ Confidence scoring for forecasts

All ready to test! 🚀
