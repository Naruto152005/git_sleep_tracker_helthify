from functools import wraps
from flask import request, jsonify, g
import os
import jwt
from jwt import PyJWKClient

CLERK_PUBLISHABLE_KEY = os.getenv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', '') # The one in your .env
# We can construct the JWKS URL from the publishable key or environment variable
DOMAIN = "clerk.com" # fallback
if CLERK_PUBLISHABLE_KEY.startswith("pk_test_"):
    import base64
    # decode the base64 part to get the domain
    try:
        encoded = CLERK_PUBLISHABLE_KEY.split("_")[2]
        decoded = base64.b64decode(encoded + "==").decode('utf-8')
        DOMAIN = decoded.replace('$', '')
    except:
        pass

JWKS_URL = f"https://{DOMAIN}/.well-known/jwks.json"

jwks_client = PyJWKClient(JWKS_URL)

def get_clerk_user_id(token):
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        data = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        return data.get('sub') # Clerk user ID
    except Exception as e:
        print(f"Token verification failed: {str(e)}")
        return None

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid authorization header"}), 401
            
        token = auth_header.split(" ")[1]
        clerk_id = get_clerk_user_id(token)
        
        if not clerk_id:
            return jsonify({"error": "Invalid token"}), 401
            
        # Store clerk_id in flask.g for the request
        g.clerk_id = clerk_id
        
        return f(*args, **kwargs)
    return decorated
