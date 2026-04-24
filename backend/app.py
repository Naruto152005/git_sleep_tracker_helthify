from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv

# Import routes
from routes.sleep_routes import sleep_bp
from routes.productivity_routes import productivity_bp
from routes.ai_coach_routes import ai_coach_bp
from routes.auth_routes import auth_bp

# Import database
from database.db_connection import init_db

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Initialize database
init_db()

# Register blueprints
app.register_blueprint(sleep_bp, url_prefix='/api/sleep')
app.register_blueprint(productivity_bp, url_prefix='/api/productivity')
app.register_blueprint(ai_coach_bp, url_prefix='/api/coach')
app.register_blueprint(auth_bp, url_prefix='/api/auth')

@app.route('/')
def home():
    return jsonify({
        'message': 'Helthify API',
        'version': '1.0.0',
        'status': 'running'
    })

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
