from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import goal_bp
from ..services.goal_service import get_goals, add_goal, update_goal, delete_goal
from ..utils.validation_utils import validate_json

@goal_bp.route('', methods=['GET'])
@jwt_required()
def get_user_goals():
    user_id = get_jwt_identity()
    goals = get_goals(user_id)
    return jsonify(goals), 200

@goal_bp.route('', methods=['POST'])
@jwt_required()
@validate_json('name', 'target_amount', 'deadline')
def create_goal():
    user_id = get_jwt_identity()
    data = request.get_json()
    result = add_goal(user_id, data)
    return jsonify(result), 201 if result['success'] else 400

@goal_bp.route('/<int:goal_id>', methods=['PUT'])
@jwt_required()
@validate_json('name', 'target_amount', 'current_amount', 'deadline')
def update_user_goal(goal_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    result = update_goal(user_id, goal_id, data)
    return jsonify(result), 200 if result['success'] else 400

@goal_bp.route('/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_user_goal(goal_id):
    user_id = get_jwt_identity()
    result = delete_goal(user_id, goal_id)
    return jsonify(result), 200 if result['success'] else 400