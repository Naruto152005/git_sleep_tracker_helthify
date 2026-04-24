from flask import Blueprint, request, jsonify
from database.db_connection import get_db
from models.models import ProductivityLog
from datetime import datetime, timedelta

productivity_bp = Blueprint('productivity', __name__)

@productivity_bp.route('/log', methods=['POST'])
def create_productivity_log():
    """Create a new productivity log entry"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'productivity_score', 'focus_level', 'tasks_completed', 'energy_level']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create productivity log
        prod_log = ProductivityLog.create_log(
            user_id=data['user_id'],
            productivity_score=data['productivity_score'],
            focus_level=data['focus_level'],
            tasks_completed=data['tasks_completed'],
            energy_level=data['energy_level'],
            notes=data.get('notes', ''),
            diet_notes=data.get('diet_notes', '')
        )
        
        # Save to database
        db = get_db()
        result = db.table('productivity_logs').insert(prod_log).execute()
        
        if not result.data:
            return jsonify({'error': 'Failed to save productivity log'}), 500
            
        return jsonify({
            'message': 'Productivity log created successfully',
            'log_id': result.data[0]['id']
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@productivity_bp.route('/logs/<user_id>', methods=['GET'])
def get_productivity_logs(user_id):
    """Get productivity logs for a user"""
    try:
        db = get_db()
        
        days = int(request.args.get('days', 30))
        start_date = (datetime.utcnow() - timedelta(days=days)).date().isoformat()
        
        # Query database using date field for better performance
        result = db.table('productivity_logs')\
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

@productivity_bp.route('/logs/<user_id>', methods=['DELETE'])
def clear_productivity_logs(user_id):
    """Clear all productivity logs for a user"""
    try:
        db = get_db()
        
        # Delete all productivity logs for the user
        result = db.table('productivity_logs').delete().eq('user_id', user_id).execute()
        
        deleted_count = len(result.data) if result.data else 0
        
        return jsonify({
            'message': f'Successfully deleted productivity logs',
            'deleted_count': deleted_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@productivity_bp.route('/correlation/<user_id>', methods=['GET'])
def get_sleep_productivity_correlation(user_id):
    """Analyze correlation between sleep and productivity"""
    try:
        db = get_db()
        
        days = int(request.args.get('days', 30))
        start_date = (datetime.utcnow() - timedelta(days=days)).date().isoformat()
        
        # Get both sleep and productivity data
        sleep_result = db.table('sleep_logs')\
            .select('*')\
            .eq('user_id', user_id)\
            .gte('date', start_date)\
            .execute()
        
        prod_result = db.table('productivity_logs')\
            .select('*')\
            .eq('user_id', user_id)\
            .gte('date', start_date)\
            .execute()
            
        sleep_logs = sleep_result.data if sleep_result.data else []
        prod_logs = prod_result.data if prod_result.data else []
        
        if not sleep_logs or not prod_logs:
            return jsonify({
                'message': 'Insufficient data for correlation analysis',
                'correlation': None
            }), 200
        
        # Create date-based mapping
        sleep_by_date = {log['date']: log for log in sleep_logs}
        prod_by_date = {log['date']: log for log in prod_logs}
        
        # Find matching dates
        matching_dates = set(sleep_by_date.keys()) & set(prod_by_date.keys())
        
        if len(matching_dates) < 3:
            return jsonify({
                'message': 'Need at least 3 matching days for correlation',
                'correlation': None
            }), 200
        
        # Calculate correlation insights
        correlations = []
        for date in matching_dates:
            sleep = sleep_by_date[date]
            prod = prod_by_date[date]
            
            correlations.append({
                'date': date,
                'sleep_quality': sleep['sleep_quality'],
                'sleep_duration': sleep['duration_hours'],
                'productivity_score': prod['productivity_score'],
                'focus_level': prod['focus_level']
            })
        
        # Calculate simple correlation metrics
        avg_sleep_quality = sum(c['sleep_quality'] for c in correlations) / len(correlations)
        avg_productivity = sum(c['productivity_score'] for c in correlations) / len(correlations)
        
        return jsonify({
            'correlation_data': correlations,
            'insights': {
                'average_sleep_quality': round(avg_sleep_quality, 2),
                'average_productivity': round(avg_productivity, 2),
                'data_points': len(correlations)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
