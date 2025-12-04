# LIMA Farms Module - Testing Guide

## 🚀 Setup

### Step 1: Run Migrations
```bash
cd d:\2025-Projects\hackathon\LIMA-Agro-Advisor\backend

# Create migrations for farms app
python manage.py makemigrations farms

# Apply migrations
python manage.py migrate

# Start server
python manage.py runserver
```

---

## 📋 What Was Created

### Models (3):
1. **FarmProfile** - User's farm details (location, size, crops)
2. **HarvestRecord** - Crop harvest records with auto-calculated values
3. **ExpenseRecord** - Farm expense tracking by category

### API Endpoints (13):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PATCH | `/api/v1/farms/profile/` | Farm profile management |
| GET/POST | `/api/v1/farms/harvests/` | List/create harvests |
| GET/PATCH/DELETE | `/api/v1/farms/harvests/{id}/` | Harvest CRUD |
| GET/POST | `/api/v1/farms/expenses/` | List/create expenses |
| GET/PATCH/DELETE | `/api/v1/farms/expenses/{id}/` | Expense CRUD |
| GET | `/api/v1/farms/analytics/` | Farm analytics (revenue/profit) |

### Features:
✅ Auto-calculate harvest value (quantity × price)  
✅ Farm analytics with profit/loss calculation  
✅ Filter harvests by crop  
✅ Filter expenses by category  
✅ Date range filtering for analytics  
✅ Top crops by quantity  
✅ Expenses breakdown by category  

---

## 🧪 Testing with Postman

### 1. Import Collection
- File: `backend/postman/LIMA_Farms_API_Tests.postman_collection.json`
- Import into Postman

### 2. Update Collection Variables
- `base_url`: `http://127.0.0.1:8000`
- `access_token`: (auto-set after login)

### 3. Run Tests

**Test Flow:**
1. ✅ **Setup - Login** (get access token)
2. ✅ **Create Farm Profile** (farm details)
3. ✅ **Get Farm Profile**
4. ✅ **Update Farm Profile**
5. ✅ **Create Harvest Record** (crop harvest)
6. ✅ **Get All Harvests**
7. ✅ **Get Specific Harvest**
8. ✅ **Update Harvest**
9. ✅ **Create Expense** (farm expense)
10. ✅ **Get All Expenses**
11. ✅ **Update Expense**
12. ✅ **Get Analytics** (revenue, profit, top crops)
13. ✅ **Filter Harvests** (by crop)
14. ✅ **Delete Harvest**
15. ✅ **Delete Expense**

**All 14 tests should PASS** ✅

---

## 🔧 Manual Testing (cURL)

### 1. Create Farm Profile
```bash
curl -X POST http://127.0.0.1:8000/api/v1/farms/profile/ \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "farm_name": "Sunshine Farms",
  "county": "nakuru",
  "location": "Nakuru Town",
  "latitude": -0.3031,
  "longitude": 36.0800,
  "size_acres": 5.5,
  "crops": ["Maize", "Beans", "Potatoes"],
  "farming_type": "mixed"
}'
```

### 2. Create Harvest Record
```bash
curl -X POST http://127.0.0.1:8000/api/v1/farms/harvests/ \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "crop": "Maize",
  "quantity_kg": 500,
  "harvest_date": "2025-11-15",
  "price_per_kg": 45.50,
  "notes": "Good harvest"
}'
```

**Response includes auto-calculated `estimated_value`:**
```json
{
  "id": 1,
  "crop": "Maize",
  "quantity_kg": "500.00",
  "price_per_kg": "45.50",
  "estimated_value": "22750.00",  // Auto-calculated!
  ...
}
```

### 3. Create Expense
```bash
curl -X POST http://127.0.0.1:8000/api/v1/farms/expenses/ \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "category": "fertilizer",
  "amount": 5000,
  "date": "2025-11-01",
  "description": "NPK fertilizer"
}'
```

### 4. Get Farm Analytics
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/farms/analytics/?date_from=2025-11-01&date_to=2025-12-31" \
-H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "total_harvest_value": "22750.00",
  "total_harvest_quantity": "500.00",
  "harvest_count": 1,
  "total_expenses": "5000.00",
  "expense_count": 1,
  "expenses_by_category": {
    "fertilizer": 5000.0
  },
  "gross_profit": "17750.00",
  "profit_margin": "78.02",
  "top_crops": [
    {
      "crop": "Maize",
      "quantity_kg": 500.0,
      "value": 22750.0
    }
  ],
  "date_from": "2025-11-01",
  "date_to": "2025-12-31"
}
```

---

## 📊 Filtering & Querying

### Filter Harvests by Crop
```
GET /api/v1/farms/harvests/?crop=Maize
```

### Filter Harvests by Date Range
```
GET /api/v1/farms/harvests/?date_from=2025-01-01&date_to=2025-12-31
```

### Filter Expenses by Category
```
GET /api/v1/farms/expenses/?category=fertilizer
```

### Analytics for Specific Period
```
GET /api/v1/farms/analytics/?date_from=2025-11-01&date_to=2025-11-30
```

---

## 🎯 Key Features Demonstrated

### 1. Auto-Calculation
- Harvest `estimated_value` = `quantity_kg` × `price_per_kg`
- Calculated automatically on save

### 2. Farm Analytics
- Total revenue (sum of all harvest values)
- Total expenses (sum of all expenses)
- Gross profit (revenue - expenses)
- Profit margin percentage
- Top 5 crops by quantity
- Expenses breakdown by category

### 3. One-to-One Relationship
- Each user can have ONE farm profile
- Creating profile auto-associates with logged-in user

### 4. Foreign Key Filtering
- Harvests/expenses automatically filtered to user's farm
- Cannot access other users' data

---

## ✅ Testing Checklist

Before proceeding to next module:

- [ ] Farm profile can be created
- [ ] Farm profile can be retrieved
- [ ] Farm profile can be updated
- [ ] Harvest records can be created
- [ ] Harvest value is auto-calculated
- [ ] Harvests can be listed
- [ ] Harvests can be filtered by crop
- [ ] Harvest can be updated
- [ ] Harvest can be deleted
- [ ] Expenses can be created
- [ ] Expenses can be listed
- [ ] Expenses can be filtered by category
- [ ] Expense can be updated
- [ ] Expense can be deleted
- [ ] Analytics endpoint works
- [ ] Analytics shows correct profit calculation
- [ ] Date filtering works in analytics

---

## 🔍 Database Check

View farm data in Django Admin:
- http://127.0.0.1:8000/admin/
- Check: `Farm profiles`, `Harvest records`, `Expense records`

---

## 🐛 Common Issues

### Issue: "Farm profile not found"
**Solution:** User needs to create a farm profile first:
```
POST /api/v1/farms/profile/
```

### Issue: "Validation error: size_acres must be greater than 0"
**Solution:** Ensure `size_acres` is a positive number.

### Issue: "Cannot access harvest/expense"
**Solution:** User can only access their own farm's data. Check authentication.

---

## 🚀 Next Module

Once farms tests pass, we'll build:
- **Climate Module** (weather, NDVI, risk assessment)
- **Market Module** (prices, forecasts, alerts)
- **Insurance Module** (parametric insurance, triggers)

Let me know when ready! 🎉
