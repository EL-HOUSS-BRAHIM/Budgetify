from ..models import Expense
from .. import db

def get_expenses(user_id):
    expenses = Expense.query.filter_by(user_id=user_id).all()
    return [{'id': e.id, 'amount': e.amount, 'category': e.category, 'date': e.date.isoformat(), 'description': e.description} for e in expenses]

def add_expense(user_id, data):
    new_expense = Expense(
        amount=data['amount'],
        category=data['category'],
        date=data['date'],
        description=data.get('description', ''),
        user_id=user_id
    )
    db.session.add(new_expense)
    db.session.commit()
    return {'success': True, 'message': 'Expense added successfully', 'id': new_expense.id}

def update_expense(user_id, expense_id, data):
    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()
    if not expense:
        return {'success': False, 'message': 'Expense not found'}
    
    expense.amount = data.get('amount', expense.amount)
    expense.category = data.get('category', expense.category)
    expense.date = data.get('date', expense.date)
    expense.description = data.get('description', expense.description)
    
    db.session.commit()
    return {'success': True, 'message': 'Expense updated successfully'}

def delete_expense(user_id, expense_id):
    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()
    if not expense:
        return {'success': False, 'message': 'Expense not found'}
    
    db.session.delete(expense)
    db.session.commit()
    return {'success': True, 'message': 'Expense deleted successfully'}