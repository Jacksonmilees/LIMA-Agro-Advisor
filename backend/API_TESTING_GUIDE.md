# LIMA API Testing Guide - Authentication Module

## 🚀 Setup Instructions

### Step 1: Run Migrations

```bash
cd d:\2025-Projects\hackathon\LIMA-Agro-Advisor\backend

# Create migrations for the custom User model
python manage.py makemigrations

# Apply migrations to database
python manage.py migrate
```

### Step 2: Create Superuser (Optional)

```bash
python manage.py createsuperuser
# Email: admin@lima.com
# Username: admin
# Password: (your choice)
```

### Step 3: Start Development Server

```bash
python manage.py runserver
```

Server will run at: `http://127.0.0.1:8000`

---

## 📚 API Documentation

Open your browser and visit:

- **Swagger UI**: http://127.0.0.1:8000/api/docs/
- **ReDoc**: http://127.0.0.1:8000/api/redoc/
- **Django Admin**: http://127.0.0.1:8000/admin/

---

## 🧪 Postman Testing

### Import Collection

1. **Open Postman**
2. Click **Import** →  **File**
3. Select: `backend/postman/LIMA_Auth_API_Tests.postman_collection.json`
4. Collection will appear in left sidebar

### Run Tests

**Option 1: Run Individual Tests**
- Click on a request (e.g., "1. User Registration")
- Click **Send**
- View response and test results in **Test Results** tab

**Option 2: Run All Tests (Collection Runner)**
1. Click the **arrow** next to collection name
2. Click **Run**
3. Click **Run LIMA API - Authentication Module**
4. All 12 tests will execute in sequence
5. View summary of passed/failed tests

### Expected Results

✅ **All tests should PASS:**

| Test # | Name | Expected Status | Description |
|--------|------|----------------|-------------|
| 1 | User Registration | 201 Created | Register new user, get tokens |
| 2 | User Login | 200 OK | Login with email/password |
| 3 | Get Current User Profile | 200 OK | Fetch authenticated user data |
| 4 | Update User Profile | 200 OK | Update language, preferences |
| 5 | Change Password | 200 OK | Change user password |
| 6 | Refresh Access Token | 200 OK | Refresh expired access token |
| 7 | Password Reset Request | 200 OK | Request password reset email |
| 8 | Password Reset Confirm | 200 OK | Reset password with token |
| 9 | Logout | 200 OK | Blacklist refresh token |
| 10 | ❌ Unauthorized Access | 401 Unauthorized | Access without token |
| 11 | ❌ Invalid Login | 401 Unauthorized | Wrong password |
| 12 | ❌ Duplicate Registration | 400 Bad Request | Email already exists |

---

## 🔍 Manual Testing (cURL Examples)

### 1. Register a New User

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register/ \
-H "Content-Type: application/json" \
-d '{
  "email": "farmer1@lima.com",
  "username": "farmer1",
  "password": "SecurePassword123!",
  "password_confirm": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+254712345678",
  "language": "en"
}'
```

**Expected Response:**
```json
{
  "user": {
    "id": 1,
    "email": "farmer1@lima.com",
    "username": "farmer1",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "phone": "+254712345678",
    "language": "en",
    "notification_enabled": true,
    "sms_alerts_enabled": false
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "message": "User registered successfully"
}
```

### 2. Login

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login/ \
-H "Content-Type: application/json" \
-d '{
  "email": "farmer1@lima.com",
  "password": "SecurePassword123!"
}'
```

**Expected Response:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Save the access token!** You'll need it for authenticated requests.

### 3. Get Current User Profile

```bash
curl -X GET http://127.0.0.1:8000/api/v1/auth/me/ \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

Replace `YOUR_ACCESS_TOKEN_HERE` with the actual token from login.

### 4. Update Profile

```bash
curl -X PATCH http://127.0.0.1:8000/api/v1/auth/me/ \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
-H "Content-Type: application/json" \
-d '{
  "language": "sw",
  "notification_enabled": false
}'
```

### 5. Change Password

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/password/change/ \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
-H "Content-Type: application/json" \
-d '{
  "old_password": "SecurePassword123!",
  "new_password": "NewPassword456!",
  "new_password_confirm": "NewPassword456!"
}'
```

### 6. Refresh Token

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/refresh/ \
-H "Content-Type: application/json" \
-d '{
  "refresh": "YOUR_REFRESH_TOKEN_HERE"
}'
```

### 7. Logout

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/logout/ \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
-H "Content-Type: application/json" \
-d '{
  "refresh": "YOUR_REFRESH_TOKEN_HERE"
}'
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Migration Error - "User model already exists"
**Solution:**
```bash
# Delete existing migrations
rm users/migrations/000*.py

# Delete database (SQLite only)
rm db.sqlite3

# Recreate migrations
python manage.py makemigrations
python manage.py migrate
```

### Issue 2: "UNIQUE constraint failed: users_user.email"
**Solution:** Email already registered. Use a different email or delete the user from Django admin.

### Issue 3: "Invalid token" when accessing `/api/v1/auth/me/`
**Solution:**
- Token may have expired (1 hour lifetime)
- Use refresh token to get a new access token:
  ```
  POST /api/v1/auth/refresh/
  Body: { "refresh": "your_refresh_token" }
  ```

### Issue 4: CORS Error (when testing from frontend)
**Solution:** Add your frontend URL to `CORS_ALLOWED_ORIGINS` in `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Your frontend URL
]
```

---

## ✅ Validation Rules

### Password Requirements:
- Minimum 8 characters
- Cannot bedtoo similar to username/email
- Cannot be entirely numeric
- Cannot be a common password

### Email:
- Must be valid email format
- Must be unique
- Required field

### Phone:
- Optional
- Must be unique if provided

### Language:
- Choices: `en`, `sw`, `ki`, `lu`, `ka`
- Default: `en`

---

## 🔒 Security Features Implemented

✅ **JWT Authentication**
- Access token: 1 hour lifetime
- Refresh token: 7 days lifetime
- Token rotation enabled
- Blacklisting on logout

✅ **Password Security**
- Django password validation
- Passwords hashed with PBKDF2
- Password change requires old password
- Password reset via email token

✅ **Protected Endpoints**
- All profile/password endpoints require authentication
- Bearer token in Authorization header
- 401 response if not authenticated

✅ **Input Validation**
- Email uniqueness check
- Password confirmation matching
- Phone number uniqueness
- Required field validation

---

## 📊 Testing Checklist

Before marking authentication as complete, ensure:

- [ ] User can register with valid data
- [ ] Duplicate email registration is blocked
- [ ] User can login with email/password
- [ ] Invalid credentials are rejected
- [ ] Access token is returned on login
- [ ] Protected endpoints require authentication
- [ ] User can view their profile
- [ ] User can update their profile
- [ ] User can change password
- [ ] Old password is required for password change
- [ ] Refresh token works
- [ ] Logout blacklists refresh token
- [ ] Password reset request works
- [ ] Password reset confirmation works
- [ ] Invalid reset tokens are rejected
- [ ] Email validation works
- [ ] Password validation works

---

## 🚀 Next Steps

Once authentication tests pass:

1. **Create Farm Profile Module** (models, serializers, views, tests)
2. **Create Climate Module** (Google Earth Engine integration)
3. **Create Market Module** (price forecasts, alerts)
4. **Create Insurance Module** (parametric insurance logic)

Each module will follow the same pattern:
- Models → Serializers → Views → URLs → Tests

---

## 📞 Support

If you encounter issues:
1. Check Django server console for errors
2. Check Postman console for request/response details
3. Verify database migrations are applied
4. Check that all required packages are installed

Happy Testing! 🎉
