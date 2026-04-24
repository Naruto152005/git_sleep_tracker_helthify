import os
import google.generativeai as genai
from datetime import datetime, timedelta
import json
import hashlib

class AIService:
    """AI service for generating recommendations and insights using Gemini API"""
    
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-3-flash-preview')
        else:
            self.model = None
            
        # Simple in-memory cache
        self.cache = {}
        self.cache_timeout = timedelta(minutes=5)
    
    def _get_cache_key(self, *args):
        """Generate a cache key from function arguments"""
        # Create a hash of the arguments
        key_string = json.dumps(args, sort_keys=True, default=str)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def _get_from_cache(self, key):
        """Get value from cache if not expired"""
        if key in self.cache:
            cached_item = self.cache[key]
            if datetime.utcnow() - cached_item['timestamp'] < self.cache_timeout:
                return cached_item['value']
            else:
                # Remove expired item
                self.cache.pop(key, None)
        return None
    
    def _set_cache(self, key, value):
        """Set value in cache with timestamp"""
        self.cache[key] = {
            'value': value,
            'timestamp': datetime.utcnow()
        }
    
    def generate_daily_advice(self, sleep_logs, productivity_logs, user_id):
        """Generate personalized daily advice based on sleep, productivity, and diet data"""
        
        # Create cache key
        cache_key = self._get_cache_key('daily_advice', user_id, len(sleep_logs), len(productivity_logs))
        
        # Try to get from cache first
        cached_result = self._get_from_cache(cache_key)
        if cached_result:
            print("Returning cached daily advice")
            return cached_result
        
        if not self.model:
            result = self._fallback_advice(sleep_logs, productivity_logs)
            self._set_cache(cache_key, result)
            return result
        
        # Prepare context from user data
        context = self._prepare_context(sleep_logs, productivity_logs)
        
        prompt = f"""You are a compassionate AI wellness coach for students. Based on the user's recent data:

{context}

Provide an extremely brief, 1 to 2 line personalized recommendation.
Do not use bullet points, bold text, or long paragraphs. Just 1 or 2 sentences of actionable advice focusing on improving their sleep or productivity."""
        
        try:
            response = self.model.generate_content(prompt)
            result = response.text.strip()
            self._set_cache(cache_key, result)
            return result
        
        except Exception as e:
            print(f"Gemini API error: {str(e)}")
            result = self._fallback_advice(sleep_logs, productivity_logs)
            self._set_cache(cache_key, result)
            return result
            
    def generate_diet_advice(self, sleep_logs, productivity_logs, allergies, diet_type, user_id):
        """Generate personalized diet plan based on user data, allergies and diet type"""
        
        # Create cache key
        cache_key = self._get_cache_key('diet_advice', user_id, len(sleep_logs), len(productivity_logs), allergies, diet_type)
        
        # Try to get from cache first
        cached_result = self._get_from_cache(cache_key)
        if cached_result:
            print("Returning cached diet advice")
            return cached_result
        
        if not self.model:
            result = "Gemini AI is not configured. Please add your GEMINI_API_KEY to get personalized diet advice."
            return result
        
        # Prepare context from user data
        context = self._prepare_context(sleep_logs, productivity_logs)
        allergy_context = f"User Allergies/Restrictions: {allergies}" if allergies else "User has no known food allergies."
        
        prompt = f"""You are an expert AI Nutritionist and Wellness Coach. 
Analyze the user's data to provide a personalized daily diet plan.

{context}
{allergy_context}
Dietary Preference: {diet_type}

**IMPORTANT RESTRICTION**: Never suggest any meals or products containing beef or beef-derived ingredients. This is a strict internal requirement.

Based on their sleep patterns and productivity/energy levels, provide a structured plan following this exact format:

**🍳 Breakfast**
- List items here...

**🍱 Lunch**
- List items here...

**🍽️ Dinner**
- List items here...

**🍎 Snacks & Hydration**
- List items here...

**⚠️ Special Considerations & Avoidance**
- Mention their specific allergies and why some foods should be avoided based on their recent energy levels.

Keep the advice practical for a student. Use clear bullet points and bold headings. Be concise but structured. """
        
        try:
            response = self.model.generate_content(prompt)
            result = response.text.strip()
            self._set_cache(cache_key, result)
            return result
        
        except Exception as e:
            print(f"Gemini API error in diet advice: {str(e)}")
            return "I'm having trouble connecting to my AI nutritionist brain right now. Please try again later!"
    
    def chat_response(self, user_query, user_id):
        """Generate chat response for quick tips"""
        
        # Create cache key
        cache_key = self._get_cache_key('chat_response', user_query, user_id)
        
        # Try to get from cache first
        cached_result = self._get_from_cache(cache_key)
        if cached_result:
            print("Returning cached chat response")
            return cached_result
        
        if not self.model:
            result = self._fallback_chat_response(user_query)
            self._set_cache(cache_key, result)
            return result
        
        prompt = f"""You are a friendly AI assistant specializing in sleep hygiene, diet, and productivity tips for students. 
        
User question: {user_query}

Provide a helpful, concise response (2-3 sentences) with actionable advice."""
        
        try:
            response = self.model.generate_content(prompt)
            result = response.text.strip()
            self._set_cache(cache_key, result)
            return result
        
        except Exception as e:
            print(f"Gemini API error: {str(e)}")
            result = self._fallback_chat_response(user_query)
            self._set_cache(cache_key, result)
            return result
    
    def predict_low_focus_days(self, sleep_logs, productivity_logs):
        """Predict potential low-focus days based on patterns"""
        
        if len(sleep_logs) < 1:
            return {
                'prediction': 'insufficient_data',
                'message': 'Start tracking your sleep to receive personalized insights',
                'preventive_strategies': [
                    'Begin by logging at least 3 nights of sleep data',
                    'Track your daily productivity levels',
                    'Check back here for AI-powered predictions'
                ]
            }
        
        # Handle limited data (1-2 entries) with a disclaimer
        if len(sleep_logs) < 3:
            limited_avg_quality = sum(log['sleep_quality'] for log in sleep_logs) / len(sleep_logs)
            limited_avg_duration = sum(log['duration_hours'] for log in sleep_logs) / len(sleep_logs)
            
            strategies = [
                f'Currently analyzing {len(sleep_logs)} sleep log(s). Add more data for better insights.',
            ]
            
            if limited_avg_quality < 3:
                strategies.append('Early data suggests lower sleep quality. Focus on consistent sleep schedule.')
            if limited_avg_duration < 7:
                strategies.append('Consider aiming for 7-9 hours of sleep per night.')
            
            return {
                'prediction': 'preliminary',
                'recent_sleep_quality': round(float(limited_avg_quality), 2),
                'recent_sleep_duration': round(float(limited_avg_duration), 2),
                'preventive_strategies': strategies,
                'message': 'Preliminary analysis available. Add more sleep logs for accurate predictions.'
            }
        
        # Analyze recent sleep quality
        recent_avg_quality = sum(log['sleep_quality'] for log in sleep_logs[:3]) / 3
        recent_avg_duration = sum(log['duration_hours'] for log in sleep_logs[:3]) / 3
        
        # Determine risk level
        risk_level = 'low'
        strategies = []
        
        if recent_avg_quality < 3:
            risk_level = 'high'
            strategies.append("Your recent sleep quality is low. Try to maintain a consistent sleep schedule.")
            strategies.append("Consider reducing screen time 1 hour before bed.")
        
        if recent_avg_duration < 6:
            risk_level = 'high' if risk_level == 'high' else 'medium'
            strategies.append("You're not getting enough sleep. Aim for 7-9 hours per night.")
        
        if recent_avg_duration > 9.5:
            strategies.append("Oversleeping detected. Try to maintain a more consistent wake time.")
        
        if risk_level == 'low':
            strategies.append("Your sleep patterns look good! Keep up the healthy habits.")
        
        return {
            'prediction': risk_level,
            'recent_sleep_quality': round(float(recent_avg_quality), 2),
            'recent_sleep_duration': round(float(recent_avg_duration), 2),
            'preventive_strategies': strategies,
            'message': f"Based on recent data, you have a {risk_level} risk of low focus days."
        }
    
    def _prepare_context(self, sleep_logs, productivity_logs):
        """Prepare context string from user data"""
        
        if not sleep_logs:
            return "No recent sleep data available."
        
        recent_sleep = sleep_logs[:3]
        avg_quality = sum(log['sleep_quality'] for log in recent_sleep) / len(recent_sleep)
        avg_duration = sum(log['duration_hours'] for log in recent_sleep) / len(recent_sleep)
        
        context = f"Recent sleep: Average {avg_duration:.1f} hours per night, quality rating {avg_quality:.1f}/5.\n"
        
        if productivity_logs:
            recent_prod = productivity_logs[:3]
            avg_prod = sum(log['productivity_score'] for log in recent_prod) / len(recent_prod)
            # Add diet info if available
            diet_notes = [log.get('diet_notes', '') for log in recent_prod if log.get('diet_notes')]
            diet_str = " Recent diet notes: " + "; ".join(diet_notes[:2]) if diet_notes else " No recent diet logs."
            context += f"Productivity score: {avg_prod:.1f}/10.{diet_str}"
        
        return context
    
    def _fallback_advice(self, sleep_logs, productivity_logs):
        """Fallback advice when Gemini is unavailable"""
        
        if not sleep_logs:
            return "Start tracking your sleep consistently to receive personalized recommendations!"
        
        recent = sleep_logs[0]
        
        if recent['sleep_quality'] < 3:
            return "Your recent sleep quality is low. Try establishing a consistent bedtime routine and reducing screen time before bed."
        elif recent['duration_hours'] < 6:
            return "You're not getting enough sleep. Aim for 7-9 hours per night to improve focus and energy levels."
        elif recent['duration_hours'] > 9:
            return "Oversleeping can reduce productivity. Try setting a consistent wake-up time, even on weekends."
        else:
            return "Your sleep patterns look healthy! Maintain consistency and consider tracking how it affects your daily productivity."
    
    def _fallback_chat_response(self, query):
        """Fallback chat response"""
        
        query_lower = query.lower()
        
        if 'sleep' in query_lower or 'insomnia' in query_lower:
            return "For better sleep: maintain a consistent schedule, avoid caffeine after 2 PM, and create a relaxing bedtime routine. Your bedroom should be cool, dark, and quiet."
        elif 'focus' in query_lower or 'concentrate' in query_lower:
            return "To improve focus: ensure 7-9 hours of quality sleep, take regular breaks using the Pomodoro technique, and minimize distractions during study sessions."
        elif 'stress' in query_lower or 'anxiety' in query_lower:
            return "To manage stress: practice deep breathing exercises, maintain regular sleep patterns, and consider brief meditation sessions. Quality sleep is crucial for emotional regulation."
        elif 'diet' in query_lower or 'food' in query_lower:
            return "A balanced diet with plenty of water, fruits, and vegetables can improve energy levels and sleep quality."
        else:
            return "I'm here to help with sleep, diet, and productivity tips! Ask me about sleep hygiene, focus techniques, diet, or managing stress."
