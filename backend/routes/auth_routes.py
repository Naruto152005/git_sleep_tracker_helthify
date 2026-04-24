from flask import Blueprint, request, jsonify
from database.db_connection import get_db
from models.models import User
from services.auth_middleware import requires_auth, g

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/sync', methods=['POST'])
@requires_auth
def sync_user():
    """Sync Clerk user to Supabase Users table"""
    try:
        data = request.get_json()
        email = data.get('email')
        name = data.get('name')
        
        db = get_db()
        
        # We must use returning Supabase UUIDs because other tables expect `uuid`
        old_user = db.table('users').select('*').eq('email', email).execute()
        if old_user.data:
            return jsonify({'message': 'Existing user', 'user_id': old_user.data[0]['id'], 'user': old_user.data[0]}), 200
        else:
            # Create new user
            user_doc = User.create_user(email, name)
            # Remove google_id if it's there
            if 'google_id' in user_doc:
                del user_doc['google_id']
                
            result = db.table('users').insert(user_doc).execute()
            if result.data:
                return jsonify({'message': 'User synced successfully', 'user_id': result.data[0]['id'], 'user': result.data[0]}), 201
                
        return jsonify({'error': 'Failed to sync user'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile/<user_id>', methods=['GET'])
@requires_auth
def get_profile(user_id):
    """Get user profile data"""
    try:
        db = get_db()
        
        # User ID is the Supabase UUID
        result = db.table('users').select('*').eq('id', user_id).execute()
        
        if not result.data:
            return jsonify({'error': 'User not found'}), 404
            
        user = result.data[0]
        if 'profile' not in user or not user['profile']:
            user['profile'] = {'allergies': ''}
        elif 'allergies' not in user['profile']:
            user['profile']['allergies'] = ''
            
        return jsonify(user), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile/<user_id>', methods=['PUT'])
@requires_auth
def update_profile(user_id):
    """Update user profile data (e.g., allergies)"""
    try:
        data = request.get_json()
        db = get_db()
        
        update_data = {}
        if 'profile' in data:
            update_data['profile'] = data['profile']
        if 'name' in data:
            update_data['name'] = data['name']
            
        result = db.table('users').update(update_data).eq('id', user_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Failed to update profile'}), 500
            
        return jsonify({'message': 'Profile updated successfully', 'user': result.data[0]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
