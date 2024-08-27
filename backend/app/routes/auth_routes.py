from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from . import auth_bp
from ..services.auth_service import register_user, login_user, logout_user
from ..services.mail_service import send_email
from ..utils.otp_utils import generate_otp, store_otp, validate_otp

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    result = register_user(data)
    return jsonify(result), 201 if result['success'] else 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    result = login_user(data)
    if result['success']:
        access_token = create_access_token(identity=result['user_id'])
        return jsonify(access_token=access_token), 200
    return jsonify(result), 401

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    user_id = get_jwt_identity()
    result = logout_user(user_id)
    return jsonify(result), 200
auth_bp.route('/request-otp', methods=['POST'])
def request_otp():
    email = request.json.get('email')
    otp = generate_otp()
    store_otp(email, otp)
    subject = 'Your OTP Code'
    body = f'Your OTP code is {otp}. It will expire in 10 minutes.'
    if send_email(subject, email, body):
        return jsonify({'message': 'OTP sent successfully'}), 200
    return jsonify({'error': 'Failed to send OTP'}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    email = request.json.get('email')
    otp = request.json.get('otp')
    if validate_otp(email, otp):
        return jsonify({'message': 'OTP validated successfully'}), 200
    return jsonify({'error': 'Invalid or expired OTP'}), 400