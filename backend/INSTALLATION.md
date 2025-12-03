# LIMA Backend - Quick Setup Guide

## Prerequisites
- Python 3.10 or higher
- PostgreSQL (or Supabase account)
- Redis (for caching and Celery)

## Installation Steps

### 1. Create Virtual Environment
```bash
# Navigate to backend directory
cd d:\2025-Projects\hackathon\LIMA-Agro-Advisor\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (CMD)
venv\Scripts\activate

# Windows (PowerShell)
venv\Scripts\Activate.ps1

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies
```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Install all requirements
pip install -r requirements.txt

# If you get errors with specific packages, install core packages first:
pip install Django==5.0.1 djangorestframework==3.14.0
pip install psycopg2-binary==2.9.9
pip install djangorestframework-simplejwt==5.3.1
pip install -r requirements.txt
```

### 3. Common Installation Issues & Fixes

#### Issue: psycopg2-binary fails on Windows
```bash
# Solution 1: Use binary wheel
pip install psycopg2-binary --no-cache-dir

# Solution 2: Use conda (if using Anaconda)
conda install -c conda-forge psycopg2
```

#### Issue: earthengine-api authentication errors
```bash
# Run after installation
earthengine authenticate

# Follow the browser prompts to authenticate
```

#### Issue: TensorFlow (if using LSTM models)
```bash
# For CPU-only (smaller, faster install)
pip install tensorflow-cpu==2.15.0

# For GPU support (requires CUDA)
pip install tensorflow==2.15.0
```

#### Issue: Pillow compilation errors
```bash
# Windows: Install pre-built binary
pip install Pillow --only-binary=Pillow

# Linux: Install system dependencies first
sudo apt-get install libjpeg-dev zlib1g-dev
pip install Pillow
```

### 4. Verify Installation
```bash
python -c "import django; print(django.get_version())"
# Should output: 5.0.1

python -c "import rest_framework; print(rest_framework.VERSION)"
# Should output: 3.14.0

python -c "import ee; print('Google Earth Engine installed')"
# Should output: Google Earth Engine installed
```

### 5. Next Steps
```bash
# Initialize Django project (after requirements are installed)
django-admin startproject lima_backend .

# Create apps
python manage.py startapp authentication
python manage.py startapp farms
python manage.py startapp climate
python manage.py startapp insurance
python manage.py startapp market
python manage.py startapp agronomy
python manage.py startapp communication

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

## Optional: Install Redis (for caching)

### Windows
```bash
# Option 1: Use Windows Subsystem for Linux (WSL)
wsl --install
sudo apt-get install redis-server
sudo service redis-server start

# Option 2: Use Docker
docker run -d -p 6379:6379 redis:latest

# Option 3: Download Windows port
# https://github.com/microsoftarchive/redis/releases
```

### Linux/Mac
```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Mac (Homebrew)
brew install redis
brew services start redis
```

### Verify Redis
```bash
redis-cli ping
# Should output: PONG
```

## Package Categories

### Core (Required)
- Django, DRF, CORS, JWT, PostgreSQL

### External APIs (Choose based on features)
- Google Earth Engine (Climate module)
- OpenWeatherMap (Weather module)
- Twilio (SMS/Voice module)
- Google Gemini AI (Agronomy chatbot)

### Async Tasks (Recommended for production)
- Celery, Redis, Flower

### ML/Data Science (Optional - for advanced features)
- NumPy, Pandas, Scikit-learn
- TensorFlow/Keras (only if building LSTM price forecasting)

### Testing (Development only)
- pytest, pytest-django, factory-boy

## Estimated Installation Time
- Core packages: 5-10 minutes
- All packages: 15-20 minutes
- TensorFlow (if included): +10-30 minutes

## Disk Space Required
- Core packages: ~500 MB
- All packages (without TensorFlow): ~1.5 GB
- With TensorFlow: ~3-4 GB

## Troubleshooting

If installation fails:
1. Check Python version: `python --version` (should be 3.10+)
2. Upgrade pip: `python -m pip install --upgrade pip`
3. Clear pip cache: `pip cache purge`
4. Install packages one by one to identify the failing package
5. Check Windows/Linux-specific package variants

## Contact
If you encounter issues, check package documentation or contact the team.
