# LIMA Climate Module - Quick Start

## 🚀 Setup

```bash
cd d:\2025-Projects\hackathon\LIMA-Agro-Advisor\backend

# Create & apply migrations
python manage.py makemigrations climate
python manage.py migrate

# Create dummy data (weather, NDVI, risks, alerts)
python manage.py create_climate_data

# Restart server
python manage.py runserver
```

## 📊 API Endpoints (8)

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/climate/weather/` | Weather data (historical + forecast) |
| `GET /api/v1/climate/weather/forecast/` | 7-day forecast for farm |
| `GET/POST /api/v1/climate/ndvi/` | NDVI crop health data |
| `GET/PATCH/DELETE /api/v1/climate/ndvi/{id}/` | NDVI CRUD |
| `GET /api/v1/climate/risk-assessment/` | Generate risk assessment |
| `GET /api/v1/climate/risks/` | List risk assessments |
| `GET /api/v1/climate/alerts/` | Weather alerts |
| `GET /api/v1/climate/analytics/` | Climate analytics |

## ✨ Features

✅ **Weather Data**
- 30 days historical weather
- 7-day forecast
- Temperature, rainfall, wind, humidity
- Automatically fetches farm location

✅ **NDVI Monitoring**
- Satellite crop health (0-1 scale)
- Auto health status (poor/fair/good/excellent)
- 6 months of data
- Cloud cover tracking

✅ **Climate Risk Assessment**
- Automated drought risk calculation
- Flood risk assessment
- Extreme temperature risk
- Personalized recommendations
- Confidence scoring

✅ **Weather Alerts**
- Heavy rain warnings
- Drought alerts
- Storm notifications
- Read/unread status

## 🧪 Quick Tests

### 1. Get Weather Forecast
```bash
GET http://127.0.0.1:8000/api/v1/climate/weather/forecast/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "location": "Nakuru Town",
  "latitude": "-0.3031",
  "longitude": "36.0800",
  "forecast_days": 7,
  "forecasts": [
    {
      "date": "2025-12-04",
      "forecast_date": "2025-12-05",
      "temp_avg": "23.45",
      "rainfall": "3.20",
      "condition": "partly_cloudy"
    }
  ]
}
```

### 2. Get NDVI Crop Health
```bash
GET http://127.0.0.1:8000/api/v1/climate/ndvi/
Authorization: Bearer <token>
```

### 3. Generate Risk Assessment
```bash
GET http://127.0.0.1:8000/api/v1/climate/risk-assessment/?days_ahead=30
Authorization: Bearer <token>
```

**Response:**
```json
{
  "farm_name": "Sunshine Farms",
  "assessment_date": "2025-12-04",
  "drought_risk": 35,
  "flood_risk": 25,
  "extreme_temp_risk": 20,
  "overall_risk_level": "medium",
  "recommendations": "Monitor rainfall patterns\\nEnsure adequate irrigation",
  "confidence": 75
}
```

### 4. Add NDVI Measurement
```bash
POST http://127.0.0.1:8000/api/v1/climate/ndvi/
Authorization: Bearer <token>

{
  "ndvi_value": 0.65,
  "image_date": "2025-12-01",
  "source": "sentinel",
  "cloud_cover_percent": 5
}
```

### 5. Get Climate Analytics
```bash
GET http://127.0.0.1:8000/api/v1/climate/analytics/?days=30
Authorization: Bearer <token>
```

**Response:**
```json
{
  "farm_name": "Sunshine Farms",
  "period_start": "2025-11-04",
  "period_end": "2025-12-04",
  "avg_temperature": 22.5,
  "total_rainfall": 156.3,
  "rainy_days": 12,
  "avg_ndvi": 0.542,
  "latest_health_status": "Good",
  "current_risk_level": "Medium Risk",
  "risk_factors": {
    "drought": 35,
    "flood": 25,
    "extreme_temp": 20
  }
}
```

### 6. Get Weather Alerts
```bash
GET http://127.0.0.1:8000/api/v1/climate/alerts/?is_read=false
Authorization: Bearer <token>
```

## 🎯 Risk Calculation Logic

### Drought Risk (0-100)
- **High (80-100)**: Rainfall < 20mm in 30 days
- **Medium (40-79)**: Rainfall 20-50mm  
- **Low (0-39)**: Rainfall > 50mm

### Flood Risk (0-100)
- **High (70-100)**: Rainfall > 200mm in 30 days
- **Medium (40-69)**: Rainfall 150-200mm
- **Low (0-39)**: Rainfall < 150mm

### Temperature Risk (0-100)
- **High (60-100)**: Temp > 35°C or < 10°C
- **Low (0-59)**: Temp 10-35°C (normal range)

### Overall Risk Level
- **Critical**: Max risk ≥ 75
- **High**: Max risk ≥ 50
- **Medium**: Max risk ≥ 25
- **Low**: Max risk < 25

## 📈 NDVI Health Status

| NDVI Range | Health Status | Description |
|------------|---------------|-------------|
| < 0.2 | Poor | Stressed/bare soil |
| 0.2 - 0.4 | Fair | Early growth |
| 0.4 - 0.6 | Good | Healthy vegetation |
| > 0.6 | Excellent | Dense, vigorous crops |

## 🔧 Data Sources

- **Weather**: Manual/OpenWeatherMap (can integrate API)
- **NDVI**: Manual/Sentinel-2/Google Earth Engine
- **Risk**: Calculated from historical patterns

## ✅ Testing Checklist

- [ ] Weather forecast endpoint works
- [ ] NDVI data can be created
- [ ] Risk assessment generates correctly
- [ ] Climate analytics shows all metrics
- [ ] Weather alerts are listed
- [ ] Risk levels auto-calculate properly
- [ ] NDVI health status auto-assigns

All ready! 🚀
