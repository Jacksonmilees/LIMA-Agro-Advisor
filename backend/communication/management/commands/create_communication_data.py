from django.core.management.base import BaseCommand
from communication.models import Notification, NotificationPreference, SMSLog, EmailLog
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
from django.utils import timezone
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    help = 'Create dummy communication data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating communication dummy data...')
        
        # Get test user
        try:
            user = User.objects.get(email='farmer1@lima.com')
        except:
            self.stdout.write(self.style.ERROR('Test user not found. Run create_dummy_data first.'))
            return
        
        # Create notification preferences
        preferences, created = NotificationPreference.objects.get_or_create(
            user=user,
            defaults={
                'sms_enabled': True,
                'email_enabled': True,
                'push_enabled': True,
                'weather_alerts': True,
                'price_alerts': True,
                'insurance_updates': True,
                'harvest_reminders': True,
                'payment_reminders': True,
                'quiet_hours_enabled': True,
                'quiet_hours_start': datetime.strptime('22:00', '%H:%M').time(),
                'quiet_hours_end': datetime.strptime('07:00', '%H:%M').time()
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created notification preferences'))
        else:
            self.stdout.write(self.style.SUCCESS('✓ Notification preferences already exist'))
        
        # Create sample notifications
        notifications_created = 0
        
        # Weather alert
        Notification.objects.get_or_create(
            user=user,
            title='Heavy Rain Expected',
            notification_type='weather_alert',
            defaults={
                'message': 'Heavy rainfall expected in your area over the next 48 hours. Ensure proper drainage.',
                'priority': 'high',
                'is_read': False,
                'sent_via_sms': True,
                'sent_via_email': True,
                'related_module': 'climate'
            }
        )
        notifications_created += 1
        
        # Price alert
        Notification.objects.get_or_create(
            user=user,
            title='Maize Prices Up!',
            notification_type='price_alert',
            defaults={
                'message': 'Maize prices have increased by 15% at Nakuru Market. Good time to sell!',
                'priority': 'medium',
                'is_read': False,
                'sent_via_push': True,
                'related_module': 'market'
            }
        )
        notifications_created += 1
        
        # Insurance claim (older, read)
        notif,_ = Notification.objects.get_or_create(
            user=user,
            title='Insurance Claim Approved',
            notification_type='insurance_claim',
            defaults={
                'message': 'Your drought insurance claim has been approved. Payout: KES 160,000',
                'priority': 'urgent',
                'is_read': True,
                'read_at': timezone.now() - timedelta(days=2),
                'sent_via_sms': True,
                'sent_via_email': True,
                'related_module': 'insurance'
            }
        )
        notifications_created += 1
        
        # Harvest reminder
        Notification.objects.get_or_create(
            user=user,
            title='Harvest Time Approaching',
            notification_type='harvest_reminder',
            defaults={
                'message': 'Your maize planted 90 days ago is ready for harvest soon.',
                'priority': 'medium',
                'is_read': False,
                'sent_via_push': True,
                'related_module': 'farms'
            }
        )
        notifications_created += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {notifications_created} notifications'))
        
        # Create SMS logs
        sms_count = 0
        
        SMSLog.objects.get_or_create(
            user=user,
            phone_number=user.phone or '+254700000000',
            message='Heavy rainfall expected. Ensure proper drainage.',
            defaults={
                'status': 'delivered',
                'provider': 'africas_talking',
                'provider_message_id': 'AT' + str(timezone.now().timestamp())[:10],
                'cost': Decimal('1.50'),
                'delivered_at': timezone.now() - timedelta(hours=1)
            }
        )
        sms_count += 1
        
        SMSLog.objects.get_or_create(
            user=user,
            phone_number=user.phone or '+254700000000',
            message='Insurance claim approved. KES 160,000 payout.',
            defaults={
                'status': 'delivered',
                'provider': 'africas_talking',
                'provider_message_id': 'AT' + str(timezone.now().timestamp()-100)[:10],
                'cost': Decimal('1.50'),
                'delivered_at': timezone.now() - timedelta(days=2)
            }
        )
        sms_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {sms_count} SMS logs'))
        
        # Create email logs
        email_count = 0
        
        EmailLog.objects.get_or_create(
            user=user,
            email_address=user.email,
            subject='Heavy Rain Expected - Weather Alert',
            defaults={
                'body': 'Heavy rainfall expected in your area over the next 48 hours. Ensure proper drainage for your crops.',
                'status': 'sent'
            }
        )
        email_count += 1
        
        EmailLog.objects.get_or_create(
            user=user,
            email_address=user.email,
            subject='Insurance Claim Approved',
            defaults={
                'body': 'Your drought insurance claim has been approved for KES 160,000. The payout will be processed within 3 business days.',
                'status': 'sent'
            }
        )
        email_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {email_count} email logs'))
        
        # Summary
        unread_count = Notification.objects.filter(user=user, is_read=False).count()
        
        self.stdout.write(self.style.SUCCESS('\n📊 Communication Data Summary:'))
        self.stdout.write(self.style.SUCCESS(f'  📬 Total Notifications: {notifications_created}'))
        self.stdout.write(self.style.SUCCESS(f'  📩 Unread: {unread_count}'))
        self.stdout.write(self.style.SUCCESS(f'  📱 SMS Sent: {sms_count}'))
        self.stdout.write(self.style.SUCCESS(f'  📧 Emails Sent: {email_count}'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Communication dummy data created successfully!'))
