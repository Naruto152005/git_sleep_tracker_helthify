from flask import Blueprint, request, jsonify
from database.db_connection import get_db
from models.models import SleepLog
from datetime import datetime, timedelta
import requests
import os

sleep_bp = Blueprint('sleep', __name__)

@sleep_bp.route('/log', methods=['POST'])
def create_sleep_log():
    """Create a new sleep log entry"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'sleep_time', 'wake_time', 'mood', 'sleep_quality']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create sleep log with type conversion
        sleep_log = SleepLog.create_log(
            user_id=data['user_id'],
            sleep_time=data['sleep_time'],
            wake_time=data['wake_time'],
            mood=int(data['mood']),
            sleep_quality=int(data['sleep_quality']),
            notes=data.get('notes', '')
        )
        
        # Save to database
        db = get_db()
        result = db.table('sleep_logs').insert(sleep_log).execute()
        
        if not result.data:
            return jsonify({'error': 'Failed to save sleep log'}), 500
            
        new_log = result.data[0]
        log_id = str(new_log.get('id') or new_log.get('_id'))
        
        # Result saved to database
        
        return jsonify({
            'message': 'Sleep log created successfully',
            'log_id': log_id,
            'data': new_log
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sleep_bp.route('/logs/<user_id>', methods=['GET'])
def get_sleep_logs(user_id):
    """Get sleep logs for a user"""
    try:
        db = get_db()
        
        # Get query parameters
        days = int(request.args.get('days', 30))
        start_date = (datetime.utcnow() - timedelta(days=days)).date().isoformat()
        
        # Query database using date field for better performance
        result = db.table('sleep_logs')\
            .select('*')\
            .eq('user_id', user_id)\
            .gte('date', start_date)\
            .order('date', desc=True)\
            .execute()
        
        logs = result.data if result.data else []
        
        return jsonify({
            'count': len(logs),
            'logs': logs
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sleep_bp.route('/logs/<user_id>', methods=['DELETE'])
def clear_sleep_logs(user_id):
    """Clear all sleep logs for a user"""
    try:
        db = get_db()
        
        # Delete all sleep logs for the user
        result = db.table('sleep_logs').delete().eq('user_id', user_id).execute()
        
        deleted_count = len(result.data) if result.data else 0
        
        return jsonify({
            'message': f'Successfully deleted sleep logs',
            'deleted_count': deleted_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@sleep_bp.route('/analytics/<user_id>', methods=['GET'])
def get_sleep_analytics(user_id):
    """Get sleep analytics and insights"""
    try:
        db = get_db()
        
        # Get last 30 days of data
        days = int(request.args.get('days', 30))
        start_date = (datetime.utcnow() - timedelta(days=days)).date().isoformat()
        
        result = db.table('sleep_logs')\
            .select('*')\
            .eq('user_id', user_id)\
            .gte('date', start_date)\
            .execute()
            
        logs = result.data if result.data else []
        
        if not logs:
            return jsonify({
                'message': 'No sleep data available',
                'analytics': {
                    'period_days': days,
                    'total_entries': 0,
                    'average_duration': 0,
                    'average_quality': 0,
                    'average_mood': 0,
                    'best_sleep_quality': 0,
                    'worst_sleep_quality': 0,
                    'consistency_score': 0
                }
            }), 200
        
        # Calculate analytics with error handling
        total_logs = len(logs)
        
        # Filter logs that have valid data and convert to proper types
        valid_logs = []
        for log in logs:
            if 'duration_hours' in log and 'sleep_quality' in log and 'mood' in log:
                # Ensure numeric types
                try:
                    log['duration_hours'] = float(log['duration_hours'])
                    log['sleep_quality'] = int(log['sleep_quality'])
                    log['mood'] = int(log['mood'])
                    valid_logs.append(log)
                except (ValueError, TypeError):
                    continue
        
        if not valid_logs:
            return jsonify({
                'message': 'No valid sleep data available',
                'analytics': {
                    'period_days': days,
                    'total_entries': 0,
                    'average_duration': 0,
                    'average_quality': 0,
                    'average_mood': 0,
                    'best_sleep_quality': 0,
                    'worst_sleep_quality': 0,
                    'consistency_score': 0
                }
            }), 200
        
        avg_duration = sum(log['duration_hours'] for log in valid_logs) / len(valid_logs)
        avg_quality = sum(log['sleep_quality'] for log in valid_logs) / len(valid_logs)
        avg_mood = sum(log['mood'] for log in valid_logs) / len(valid_logs)
        
        # Find best and worst sleep
        best_sleep = max(valid_logs, key=lambda x: x['sleep_quality'])
        worst_sleep = min(valid_logs, key=lambda x: x['sleep_quality'])
        
        analytics = {
            'period_days': days,
            'total_entries': len(valid_logs),
            'average_duration': round(avg_duration, 2),
            'average_quality': round(avg_quality, 2),
            'average_mood': round(avg_mood, 2),
            'best_sleep_quality': best_sleep['sleep_quality'],
            'worst_sleep_quality': worst_sleep['sleep_quality'],
            'consistency_score': calculate_consistency_score(valid_logs)
        }
        
        return jsonify({'analytics': analytics}), 200
        
    except Exception as e:
        print(f"Error in sleep analytics: {str(e)}")
        return jsonify({'error': str(e)}), 500

def calculate_consistency_score(logs):
    """Calculate sleep consistency score (0-100)"""
    if len(logs) < 2:
        return 0
    
    # Calculate variance in sleep duration
    durations = [log['duration_hours'] for log in logs]
    avg_duration = sum(durations) / len(durations)
    variance = sum((d - avg_duration) ** 2 for d in durations) / len(durations)
    
    # Lower variance = higher consistency
    consistency = max(0, 100 - (variance * 10))
    return round(consistency, 2)

