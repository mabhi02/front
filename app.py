from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from bson import ObjectId
from functools import wraps

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'defense-dashboard-secret-key-2024'
app.config['MONGO_URI'] = 'mongodb://127.0.0.1:27017/defenseDB'  # Include database name in URI
mongo = PyMongo(app)

# Collection names
USERS_COLLECTION = 'users'
THREATS_COLLECTION = 'threats'

# Token decorator for protected routes
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = mongo.db[USERS_COLLECTION].find_one({'_id': ObjectId(data['user_id'])})
        except:
            return jsonify({'message': 'Token is invalid'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing credentials'}), 400
    
    user = mongo.db[USERS_COLLECTION].find_one({'username': data.get('username')})
    
    if user and check_password_hash(user['password'], data.get('password')):
        token = jwt.encode({
            'user_id': str(user['_id']),
            'username': user['username'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'])
        
        return jsonify({
            'token': token,
            'username': user['username']
        })
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing registration data'}), 400
    
    if mongo.db[USERS_COLLECTION].find_one({'username': data.get('username')}):
        return jsonify({'message': 'Username already exists'}), 400
    
    hashed_password = generate_password_hash(data.get('password'))
    
    new_user = {
        'username': data.get('username'),
        'password': hashed_password,
        'created_at': datetime.datetime.utcnow()
    }
    
    mongo.db[USERS_COLLECTION].insert_one(new_user)
    
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/threats', methods=['GET', 'POST'])
@token_required
def handle_threats(current_user):
    if request.method == 'GET':
        threats = list(mongo.db[THREATS_COLLECTION].find({
            'user_id': str(current_user['_id'])
        }))
        
        for threat in threats:
            threat['_id'] = str(threat['_id'])
        
        return jsonify(threats)
    
    if request.method == 'POST':
        threat_data = request.get_json()
        threat_data['user_id'] = str(current_user['_id'])
        threat_data['created_at'] = datetime.datetime.utcnow()
        
        result = mongo.db[THREATS_COLLECTION].insert_one(threat_data)
        return jsonify({
            'message': 'Threat created',
            'id': str(result.inserted_id)
        }), 201

@app.route('/threats/<threat_id>', methods=['PUT'])
@token_required
def update_threat(current_user, threat_id):
    threat_data = request.get_json()
    
    # Ensure user owns this threat
    existing_threat = mongo.db[THREATS_COLLECTION].find_one({
        '_id': ObjectId(threat_id),
        'user_id': str(current_user['_id'])
    })
    
    if not existing_threat:
        return jsonify({'message': 'Threat not found or unauthorized'}), 404
    
    # Update the threat
    mongo.db[THREATS_COLLECTION].update_one(
        {'_id': ObjectId(threat_id)},
        {'$set': {
            'type': threat_data.get('type'),
            'severity': threat_data.get('severity'),
            'description': threat_data.get('description'),
            'resolved': threat_data.get('resolved'),
            'resolutionNotes': threat_data.get('resolutionNotes'),
            'sector': threat_data.get('sector'),
            'assignedDrone': threat_data.get('assignedDrone'),
            'updated_at': datetime.datetime.utcnow()
        }}
    )
    
    return jsonify({'message': 'Threat updated successfully'}), 200

@app.route('/threats/<threat_id>', methods=['DELETE'])
@token_required
def delete_threat(current_user, threat_id):
    # Check if threat exists and belongs to user
    threat = mongo.db[THREATS_COLLECTION].find_one({
        '_id': ObjectId(threat_id),
        'user_id': str(current_user['_id'])
    })
    
    if not threat:
        return jsonify({'message': 'Threat not found or unauthorized'}), 404
    
    # Delete the threat
    mongo.db[THREATS_COLLECTION].delete_one({'_id': ObjectId(threat_id)})
    
    return jsonify({'message': 'Threat deleted successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)