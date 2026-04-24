from datetime import datetime

class User:
    """User model for authentication and profile"""
    
    @staticmethod
    def create_user(email, name, google_id=None):
        return {
            'email': email,
            'name': name,
            'google_id': google_id,
            'created_at': datetime.utcnow().isoformat(),
            'preferences': {
                'target_sleep_hours': 8,
                'target_bedtime': '23:00',
                'target_wake_time': '07:00',
                'notifications_enabled': True
            },
            'profile': {
                'age': None,
                'occupation': 'student',
                'accessibility_needs': []
            }
        }

class SleepLog:
    """Sleep log model"""
    
    @staticmethod
    def create_log(user_id, sleep_time, wake_time, mood, sleep_quality, notes=''):
        # Extract the actual sleep date from sleep_time instead of using current date
        try:
            sleep_dt = datetime.fromisoformat(sleep_time)
            log_date = sleep_dt.date().isoformat()
        except:
            log_date = datetime.utcnow().date().isoformat()
        
        return {
            'user_id': user_id,
            'date': log_date,
            'sleep_time': sleep_time,
            'wake_time': wake_time,
            'duration_hours': SleepLog.calculate_duration(sleep_time, wake_time),
            'mood': mood,  # 1-5 scale
            'sleep_quality': sleep_quality,  # 1-5 scale
            'notes': notes,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def calculate_duration(sleep_time, wake_time):
        """Calculate sleep duration in hours"""
        try:
            sleep_dt = datetime.fromisoformat(sleep_time)
            wake_dt = datetime.fromisoformat(wake_time)
            duration = (wake_dt - sleep_dt).total_seconds() / 3600
            return round(duration, 2)
        except:
            return 0

class ProductivityLog:
    """Productivity log model"""
    
    @staticmethod
    def create_log(user_id, productivity_score, focus_level, tasks_completed, energy_level, notes='', diet_notes=''):
        return {
            'user_id': user_id,
            'date': datetime.utcnow().date().isoformat(),
            'productivity_score': productivity_score,  # 1-10 scale
            'focus_level': focus_level,  # 1-5 scale
            'tasks_completed': tasks_completed,
            'energy_level': energy_level,  # 1-5 scale
            'notes': notes,
            'diet_notes': diet_notes,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }

class AIRecommendation:
    """AI-generated recommendations model"""
    
    @staticmethod
    def create_recommendation(user_id, recommendation_type, content, priority='medium'):
        return {
            'user_id': user_id,
            'type': recommendation_type,  # 'sleep', 'productivity', 'general'
            'content': content,
            'priority': priority,  # 'low', 'medium', 'high'
            'read': False,
            'created_at': datetime.utcnow().isoformat(),
            'expires_at': None
        }
