@echo off
REM LIMA Backend - Create All Django Apps
REM Run this from the backend directory after creating Django project

echo Creating Django apps for LIMA backend...
echo.

python manage.py startapp authentication
echo [OK] authentication created

python manage.py startapp farms
echo [OK] farms created

python manage.py startapp climate
echo [OK] climate created

python manage.py startapp insurance
echo [OK] insurance created

python manage.py startapp market
echo [OK] market created

python manage.py startapp agronomy
echo [OK] agronomy created

python manage.py startapp communication
echo [OK] communication created

python manage.py startapp journal
echo [OK] journal created

python manage.py startapp notifications
echo [OK] notifications created

echo.
echo ============================================
echo All apps created successfully!
echo ============================================
echo.
echo Next: Add these apps to INSTALLED_APPS in settings.py
pause
