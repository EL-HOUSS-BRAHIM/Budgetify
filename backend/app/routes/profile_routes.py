from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import profile_bp
from ..services.profile_service import create_profile, get_profile, update_profile, delete_profile, update_profile_avatar, delete_profile_avatar
from ..utils.validation_utils import validate_json

@profile_bp.route('', methods=['POST'])
@jwt_required()
@validate_json('first_name', 'last_name', 'email')
def create_user_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    profile = create_profile(user_id, **data)
    return jsonify(profile), 201

@profile_bp.route('', methods=['GET'])
@jwt_required()
def get_user_profile():
    user_id = get_jwt_identity()
    profile = get_profile(user_id)
    return jsonify(profile), 200

@profile_bp.route('', methods=['PUT'])
@jwt_required()
@validate_json('first_name', 'last_name', 'currency', 'language', 'timezone', 'two_factor_auth', 'login_alerts', 'password_expiry')
def update_user_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    result = update_profile(user_id, data)
    return jsonify(result), 200 if 'error' not in result else 404

@profile_bp.route('', methods=['DELETE'])
@jwt_required()
def remove_user_profile():
    user_id = get_jwt_identity()
    result = delete_profile(user_id)
    return jsonify(result), 200 if 'success' in result else 404

@profile_bp.route('/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    user_id = get_jwt_identity()
    avatar_file = request.files.get('avatar')
    avatar_url = update_profile_avatar(user_id, avatar_file)
    return jsonify({'avatar_url': avatar_url}), 200

@profile_bp.route('/avatar', methods=['DELETE'])
@jwt_required()
def remove_avatar():
    user_id = get_jwt_identity()
    result = delete_profile_avatar(user_id)
    return jsonify(result), 200
