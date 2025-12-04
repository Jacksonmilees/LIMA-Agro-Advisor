# LIMA Backend - Quick Command Reference

## 📝 Commands to Run (IN ORDER)

### 1. Create Migrations
```bash
python manage.py makemigrations
```
**What it does:** Creates migration files for database schema changes

### 2. Apply Migrations
```bash
python manage.py migrate
```
**What it does:** Applies migrations to Supabase database

### 3. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```
Fill in:
- Email: admin@lima.com
- Username: admin  
- Password: (your choice)
- First name: Admin
- Last name: User

### 4. Start Server
```bash
python manage.py runserver
```
**Server runs at:** http://127.0.0.1:8000

---

## ✅ What Was Created

### Files Created:
```
backend/
├── users/
│   ├── models.py          ✅ Extended User model
│   ├── serializers.py     ✅ 5 serializers
│   ├── views.py           ✅ 7 API views
│   ├── urls.py            ✅ URL routing
│   └── admin.py           ✅ Admin interface
├── Agri_tech/
│   ├── settings.py        ✅ Updated with REST/JWT/CORS
│   └── urls.py            ✅ Main URL config
├── postman/
│   └── LIMA_Auth_API_Tests.postman_collection.json  ✅ 12 tests
└── API_TESTING_GUIDE.md   ✅ Testing instructions
```

### API Endpoints (8 total):
1. `POST /api/v1/auth/register/` - Register user  
2. `POST /api/v1/auth/login/` - Login  
3. `POST /api/v1/auth/logout/` - Logout  
4. `POST /api/v1/auth/refresh/` - Refresh access token  
5. `GET /api/v1/auth/me/` - Get profile  
6. `PATCH /api/v1/auth/me/` - Update profile  
7. `POST /api/v1/auth/password/change/` - Change password  
8. `POST /api/v1/auth/password/reset/` - Password reset  

---

## 🧪 Testing

### Import Postman Collection:
1. Open Postman
2. Import → File → `backend/postman/LIMA_Auth_API_Tests.postman_collection.json`
3. Run collection (12 tests should PASS)

### Quick Test with cURL:
```bash
# Register
curl -X POST http://127.0.0.1:8000/api/v1/auth/register/ \
-H "Content-Type: application/json" \
-d '{
  "email": "test@lima.com",
  "username": "testuser",
  "password": "TestPass123!",
  "password_confirm": "TestPass123!",
  "first_name": "Test",
  "last_name": "User"
}'
```

---

## 🎯 Next Steps

Once authentication works:
1. ✅ Test all 12 Postman tests
2. ✅ Verify in Django admin: http://127.0.0.1:8000/admin/
3. ✅ Check Swagger docs: http://127.0.0.1:8000/api/docs/
4. Then we'll build **Farms Module** next!

---

## ⚠️ Common Errors & Fixes

### Error: "No such table: users_user"
**Fix:** Run migrations
```bash
python manage.py migrate
```

### Error: "duplicate key value violates unique constraint"
**Fix:** Email already exists. Use different email or delete user in admin.

### Error: "Invalid token"
**Fix:** Token expired (1 hour). Refresh it:
```bash
POST /api/v1/auth/refresh/
Body: {"refresh": "your_refresh_token"}
```

### Error: CORS blocked
**Fix:** Check `CORS_ALLOWED_ORIGINS` in `settings.py` includes your frontend URL.

---

## 🔗 Useful Links

- **API Docs:** http://127.0.0.1:8000/api/docs/
- **Admin:** http://127.0.0.1:8000/admin/
- **Testing Guide:** `backend/API_TESTING_GUIDE.md`
