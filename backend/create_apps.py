#!/usr/bin/env python
"""
Script to create all Django apps for LIMA backend
Run this after creating the Django project
"""

import os
import subprocess

# List of apps to create
APPS = [
    'authentication',  # User auth, JWT, registration
    'farms',           # Farm profiles, records, expenses
    'climate',         # Climate risk, weather, satellite data
    'insurance',       # Parametric insurance, policies, claims
    'market',          # Market prices, forecasts, alerts
    'agronomy',        # AI chatbot, recommendations, knowledge base
    'communication',   # Voice, SMS, WhatsApp integration
    'journal',         # Farm journal, activities, reminders
    'notifications',   # Push notifications, alerts
]

def create_apps():
    """Create all Django apps"""
    print("Creating Django apps for LIMA backend...\n")
    
    for app in APPS:
        print(f"Creating app: {app}")
        try:
            subprocess.run(['python', 'manage.py', 'startapp', app], check=True)
            print(f"✓ {app} created successfully")
        except subprocess.CalledProcessError as e:
            print(f"✗ Error creating {app}: {e}")
        except FileNotFoundError:
            print("Error: manage.py not found. Run this script from the Django project root.")
            return
    
    print("\n" + "="*50)
    print("All apps created successfully!")
    print("="*50)
    print("\nNext steps:")
    print("1. Add apps to INSTALLED_APPS in settings.py")
    print("2. Create models in each app")
    print("3. Run migrations: python manage.py makemigrations")
    print("4. Run migrations: python manage.py migrate")

if __name__ == '__main__':
    create_apps()
