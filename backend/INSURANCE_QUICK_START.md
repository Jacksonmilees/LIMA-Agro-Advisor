# LIMA Insurance Module - Quick Start

## 🚀 Setup

```bash
cd d:\2025-Projects\hackathon\LIMA-Agro-Advisor\backend

# Create & apply migrations
python manage.py makemigrations insurance
python manage.py migrate

# Create dummy data
python manage.py create_insurance_data

# Restart server
python manage.py runserver
```

## 📊 API Endpoints (8)

| Endpoint | Description |
|----------|-------------|
| `GET/POST /api/v1/insurance/policies/` | List/create policies |
| `GET/PATCH/DELETE /api/v1/insurance/policies/{id}/` | Policy CRUD |
| `POST /api/v1/insurance/policies/{id}/evaluate/` | Evaluate triggers |
| `GET/POST /api/v1/insurance/claims/` | List/create claims |
| `GET/PATCH /api/v1/insurance/claims/{id}/` | Claim details |
| `POST /api/v1/insurance/payments/` | Record payment |
| `GET /api/v1/insurance/recommendations/` | Get AI recommendations |
| `GET /api/v1/insurance/analytics/` | Insurance statistics |

## ✨ Features

✅ **Parametric Insurance**
- Drought, flood, multi-peril policies
- Automatic payouts based on weather triggers
- No manual claim verification needed

✅ **Automatic Trigger Evaluation**
- Checks weather data against thresholds
- Auto-creates claims when triggered
- Calculates payouts automatically

✅ **AI Recommendations**
- Analyzes climate risk
- Recommends appropriate policies
- Calculates coverage & premiums

✅ **Payment Tracking**
- M-Pesa, bank, mobile money
- Transaction references
- Payment confirmation

## 🧪 Quick Tests

### 1. Create Insurance Policy
```bash
POST http://127.0.0.1:8000/api/v1/insurance/policies/
Authorization: Bearer <token>

{
  "policy_type": "drought",
  "coverage_amount": 250000,
  "premium_amount": 12500,
  "payment_frequency": "quarterly",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31"
}
```

### 2. Evaluate Triggers (Check for Claims)
```bash
POST http://127.0.0.1:8000/api/v1/insurance/policies/1/evaluate/
Authorization: Bearer <token>
```

**Response** if triggered:
```json
{
  "message": "1 trigger(s) activated",
  "triggers_activated": [
    {
      "trigger_type": "Rainfall Below Threshold",
      "measured_value": 35.5,
      "threshold": 50.0,
      "payout_percentage": 80.0,
      "claim_amount": 200000.0,
      "claim_number": "CLM202412041"
    }
  ],
  "policy_status": "claimed"
}
```

### 3. Get Policy Recommendations
```bash
GET http://127.0.0.1:8000/api/v1/insurance/recommendations/
Authorization: Bearer <token>
```

### 4. Get Insurance Analytics
```bash
GET http://127.0.0.1:8000/api/v1/insurance/analytics/
Authorization: Bearer <token>
```

## 🎯 Trigger Types

| Trigger Type | Description | Example |
|--------------|-------------|---------|
| `rainfall_deficit` | Rainfall below threshold | < 50mm in 30 days |
| `rainfall_excess` | Rainfall above threshold | > 250mm in 30 days |
| `temperature_high` | Avg temp above threshold | > 35°C for 30 days |
| `temperature_low` | Avg temp below threshold | < 10°C for 30 days |
| `consecutive_dry_days` | Dry days in a row | ≥ 15 consecutive days |

## 💡 How Parametric Insurance Works

1. **Farmer Buys Policy** → Choose coverage amount
2. **Set Triggers** → Define weather conditions (e.g., rainfall < 50mm)
3. **Monitor Weather** → System checks weather data automatically
4. **Trigger Activated** → If condition met → Automatic claim created
5. **Instant Payout** → No manual verification, immediate processing

## 📈 Example Scenario

**Farmer has drought insurance:**
- Coverage: KES 200,000
- Trigger: Rainfall < 50mm in 30 days
- Payout: 80% of coverage

**Weather data shows:**
- Last 30 days: Only 35mm rainfall
- Trigger activated! ✅

**System automatically:**
1. Marks trigger as activated
2. Creates claim for KES 160,000 (80% × 200,000)
3. Approves claim (parametric = instant)
4. Updates policy status to "claimed"

## ✅ Ready to Test!

Run the setup commands and test in Postman! 🚀
