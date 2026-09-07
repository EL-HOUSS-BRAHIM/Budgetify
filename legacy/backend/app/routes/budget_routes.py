from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import budget_bp
from ..services.budget_service import get_budgets, add_budget, update_budget, delete_budget
from ..utils.validation_utils import validate_json

@budget_bp.route('', methods=['GET'])
@jwt_required()
def get_user_budgets():
    user_id = get_jwt_identity()
    budgets = get_budgets(user_id)
    return jsonify(budgets), 200

@budget_bp.route('', methods=['POST'])
@jwt_required()
@validate_json('category', 'amount', 'start_date', 'end_date')
def create_budget():
    user_id = get_jwt_identity()
    data = request.get_json()
    result = add_budget(user_id, data)
    return jsonify(result), 201 if result['success'] else 400

@budget_bp.route('/<int:budget_id>', methods=['PUT'])
@jwt_required()
@validate_json('category', 'amount', 'start_date', 'end_date')
def update_user_budget(budget_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    result = update_budget(user_id, budget_id, data)
    return jsonify(result), 200 if result['success'] else 400

@budget_bp.route('/<int:budget_id>', methods=['DELETE'])
@jwt_required()
def delete_user_budget(budget_id):
    user_id = get_jwt_identity()
    result = delete_budget(user_id, budget_id)
    return jsonify(result), 200 if result['success'] else 400