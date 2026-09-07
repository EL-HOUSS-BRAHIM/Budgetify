from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import settings_bp
from ..services.settings_service import get_settings, update_settings
from ..utils.validation_utils import validate_json

@settings_bp.route('', methods=['GET'])
@jwt_required()
def get_user_settings():
    user_id = get_jwt_identity()
    settings = get_settings(user_id)
    return jsonify(settings), 200

@settings_bp.route('', methods=['PUT'])
@jwt_required()
@validate_json('notification_enabled', 'theme')
def update_user_settings():
    user_id = get_jwt_identity()
    data = request.get_json()
    result = update_settings(user_id, data)
    return jsonify(result), 200 if result['success'] else 400