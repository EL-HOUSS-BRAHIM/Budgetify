from ..models import User
from .. import db, bcrypt

def register_user(data):
    username = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return {'success': False, 'message': 'Username or email already exists'}

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password_hash=hashed_password)
    
    db.session.add(new_user)
    db.session.commit()

    return {'success': True, 'message': 'User registered successfully'}

def login_user(data):
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        return {'success': True, 'user_id': user.id}
    
    return {'success': False, 'message': 'Invalid username or password'}

def logout_user(user_id):
    # In a real-world scenario, you might want to invalidate the token here
    return {'success': True, 'message': 'Logged out successfully'}
