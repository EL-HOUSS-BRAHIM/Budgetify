from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import expense_bp
from ..services.expense_service import get_expenses, add_expense, update_expense, delete_expense

@expense_bp.route('', methods=['GET'])
@jwt_required()
def get_user_expenses():
    user_id = get_jwt_identity()
    expenses = get_expenses(user_id)
    return jsonify(expenses), 200

@expense_bp.route('', methods=['POST'])
@jwt_required()
def create_expense():
    user_id = get_jwt_identity()
    data = request.get_json()
    result = add_expense(user_id, data)
    return jsonify(result), 201 if result['success'] else 400

@expense_bp.route('/<int:expense_id>', methods=['PUT'])
@jwt_required()
def update_user_expense(expense_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    result = update_expense(user_id, expense_id, data)
    return jsonify(result), 200 if result['success'] else 400

@expense_bp.route('/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_user_expense(expense_id):
    user_id = get_jwt_identity()
    result = delete_expense(user_id, expense_id)
    return jsonify(result), 200 if result['success'] else 400