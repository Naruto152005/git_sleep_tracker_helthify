from flask import Blueprint, request, jsonify
from database.db_connection import get_db
from models.models import AIRecommendation
from services.ai_service import AIService
from datetime import datetime, timedelta

ai_coach_bp = Blueprint('ai_coach', __name__)
ai_service = AIService()

@ai_coach_bp.route('/recommendation/<user_id>', methods=['GET'])
def get_daily_recommendation(user_id):
    """Get daily AI-generated recommendation"""
    try:
        db = get_db()
        
        # Get user's recent data (limit to 7 days for performance)
        sleep_result = db.table('sleep_logs')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('date', desc=True)\
            .limit(7)\
            .execute()
            
        prod_result = db.table('productivity_logs')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('date', desc=True)\
            .limit(7)\
            .execute()
            
        sleep_logs = sleep_result.data if sleep_result.data else []
        prod_logs = prod_result.data if prod_result.data else []
        
        # Generate AI recommendation
        recommendation = ai_service.generate_daily_advice(sleep_logs, prod_logs, user_id)
        
        # Save recommendation
        rec_doc = AIRecommendation.create_recommendation(
            user_id=user_id,
            recommendation_type='daily',
            content=recommendation,
            priority='medium'
        )
        db.table('ai_recommendations').insert(rec_doc).execute()
        
        return jsonify({
            'recommendation': recommendation,
            'generated_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        print(f"Error in AI recommendation: {str(e)}")
        # Return a fallback response instead of error
        return jsonify({
            'recommendation': 'Welcome! Start tracking your sleep to get personalized recommendations.',
            'generated_at': datetime.utcnow().isoformat()
        }), 200

@ai_coach_bp.route('/chat', methods=['POST'])
def chat_assistant():
    """Quick-tip chat assistant"""
    try:
        data = request.get_json()
        user_query = data.get('query', '')
        user_id = data.get('user_id')
        
        if not user_query:
            return jsonify({'error': 'Query is required'}), 400
        
        print(f"Chat query received: {user_query}")
        
        # Get AI response
        response = ai_service.chat_response(user_query, user_id)
        
        print(f"Chat response: {response}")
        
        return jsonify({
            'response': response,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        print(f"Error in chat: {str(e)}")
        # Return fallback response
        fallback = ai_service._fallback_chat_response(user_query if 'user_query' in locals() else '')
        return jsonify({
            'response': fallback,
            'timestamp': datetime.utcnow().isoformat()
        }), 200

@ai_coach_bp.route('/insights/<user_id>', methods=['GET'])
def get_predictive_insights(user_id):
    """Get predictive insights about low-focus days"""
    try:
        db = get_db()
        
        # Get historical data (limit to 30 days for performance)
        sleep_result = db.table('sleep_logs')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('date', desc=True)\
            .limit(30)\
            .execute()
        
        prod_result = db.table('productivity_logs')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('date', desc=True)\
            .limit(30)\
            .execute()
            
        sleep_logs = sleep_result.data if sleep_result.data else []
        prod_logs = prod_result.data if prod_result.data else []
        
        # Generate predictive insights
        insights = ai_service.predict_low_focus_days(sleep_logs, prod_logs)
        
        return jsonify({
            'insights': insights,
            'generated_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_coach_bp.route('/recommendations/<user_id>', methods=['GET'])
def get_all_recommendations(user_id):
    """Get all recommendations for a user"""
    try:
        db = get_db()
        
        days = int(request.args.get('days', 7))
        # Handle datetime comparison for Supabase
        start_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        result = db.table('ai_recommendations')\
            .select('*')\
            .eq('user_id', user_id)\
            .gte('created_at', start_date)\
            .order('created_at', desc=True)\
            .execute()
        
        recommendations = result.data if result.data else []
        
        return jsonify({
            'count': len(recommendations),
            'recommendations': recommendations
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_coach_bp.route('/diet/<user_id>', methods=['GET'])
def get_daily_diet_plan(user_id):
    """Get personalized AI-generated diet plan"""
    try:
        db = get_db()
        
        # Get user's recent data
        sleep_result = db.table('sleep_logs').select('*').eq('user_id', user_id).order('date', desc=True).limit(7).execute()
        prod_result = db.table('productivity_logs').select('*').eq('user_id', user_id).order('date', desc=True).limit(7).execute()
        user_result = db.table('users').select('profile').eq('id', user_id).execute()
        
        sleep_logs = sleep_result.data if sleep_result.data else []
        prod_logs = prod_result.data if prod_result.data else []
        
        # Get allergies and diet type from user profile
        allergies = ""
        diet_type = "non-vegetarian"
        if user_result.data and user_result.data[0].get('profile'):
            profile = user_result.data[0]['profile']
            if isinstance(profile, str):
                import json
                try:
                    profile = json.loads(profile)
                except:
                    profile = {}
            if isinstance(profile, dict):
                allergies = profile.get('allergies', "")
                diet_type = profile.get('diet_type', "non-vegetarian")
            
        # Generate AI diet plan
        diet_plan = ai_service.generate_diet_advice(sleep_logs, prod_logs, allergies, diet_type, user_id)
        
        # Save recommendation
        rec_doc = AIRecommendation.create_recommendation(
            user_id=user_id,
            recommendation_type='diet',
            content=diet_plan,
            priority='medium'
        )
        db.table('ai_recommendations').insert(rec_doc).execute()
        
        return jsonify({
            'diet_plan': diet_plan,
            'generated_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        print(f"Error in diet recommendation: {str(e)}")
        return jsonify({
            'diet_plan': "Balanced nutrition is key! Try tracking more data to get personalized AI advice.",
            'generated_at': datetime.utcnow().isoformat()
        }), 200
