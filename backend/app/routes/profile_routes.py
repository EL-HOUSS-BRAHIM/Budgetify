from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import profile_bp
from ..services.profile_service import create_profile, get_profile, update_profile, delete_profile, update_profile_avatar, get_profile_avatar
from ..utils.validation_utils import validate_json
import logging

logging.basicConfig(level=logging.INFO)

@profile_bp.route('', methods=['POST'])
@jwt_required()
def create_user_profile():
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        required_fields = ['first_name', 'last_name', 'email']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        profile = create_profile(
            user_id=user_id,
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            email=data.get('email'),
            phone=data.get('phone'),
            currency=data.get('currency'),
            language=data.get('language'),
            timezone=data.get('timezone'),
            two_factor_auth=data.get('two_factor_auth'),
            login_alerts=data.get('login_alerts'),
            password_expiry=data.get('password_expiry'),
            avatar=None
        )
        return jsonify(get_profile(user_id)), 201
    except Exception as e:
        logging.error(f"Error creating profile: {str(e)}")
        return jsonify({'error': 'An error occurred while creating the profile'}), 500

@profile_bp.route('', methods=['GET'])
@jwt_required()
def get_user_profile():
    user_id = get_jwt_identity()
    profile = get_profile(user_id)
    if profile:
        return jsonify(profile), 200
    return jsonify({'error': 'Profile not found'}), 404

@profile_bp.route('', methods=['PUT'])
@jwt_required()
@validate_json('first_name', 'last_name', 'currency', 'language', 'timezone', 'two_factor_auth', 'login_alerts', 'password_expiry')
def update_user_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    result = update_profile(user_id, data)
    if result:
        return jsonify(get_profile(user_id)), 200
    return jsonify({'error': 'Profile not found'}), 404

@profile_bp.route('', methods=['DELETE'])
@jwt_required()
def remove_user_profile():
    user_id = get_jwt_identity()
    result = delete_profile(user_id)
    if result:
        return jsonify({'success': True, 'message': 'Profile deleted successfully'}), 200
    return jsonify({'error': 'Profile not found'}), 404

@profile_bp.route('/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    user_id = get_jwt_identity()
    avatar_file = request.files.get('avatar')
    try:
        avatar = update_profile_avatar(user_id, avatar_file)
        if avatar:
            return jsonify({'avatar': avatar}), 200
        return jsonify({'error': 'Profile not found'}), 404
    except Exception as e:
        logging.error(f"Error uploading avatar: {str(e)}")
        return jsonify({'error': 'An error occurred while uploading the avatar'}), 500

@profile_bp.route('/avatar', methods=['GET'])
@jwt_required()
def get_avatar():
    user_id = get_jwt_identity()
    avatar = get_profile_avatar(user_id)
    if avatar:
        return jsonify({'avatar': avatar}), 200
    return jsonify({'error': 'Avatar not found'}), 404