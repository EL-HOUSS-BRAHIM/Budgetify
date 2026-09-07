from ..models import Budget
from .. import db
from datetime import datetime

def get_budgets(user_id):
    budgets = Budget.query.filter_by(user_id=user_id).all()
    return [{'id': b.id, 'category': b.category, 'amount': b.amount, 'start_date': b.start_date.isoformat(), 'end_date': b.end_date.isoformat()} for b in budgets]

def add_budget(user_id, data):
    new_budget = Budget(
        category=data['category'],
        amount=data['amount'],
        start_date=datetime.fromisoformat(data['start_date']),
        end_date=datetime.fromisoformat(data['end_date']),
        user_id=user_id
    )
    db.session.add(new_budget)
    db.session.commit()
    return {'success': True, 'message': 'Budget added successfully', 'id': new_budget.id}

def update_budget(user_id, budget_id, data):
    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
    if not budget:
        return {'success': False, 'message': 'Budget not found'}
    
    budget.category = data['category']
    budget.amount = data['amount']
    budget.start_date = datetime.fromisoformat(data['start_date'])
    budget.end_date = datetime.fromisoformat(data['end_date'])
    
    db.session.commit()
    return {'success': True, 'message': 'Budget updated successfully'}

def delete_budget(user_id, budget_id):
    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
    if not budget:
        return {'success': False, 'message': 'Budget not found'}
    
    db.session.delete(budget)
    db.session.commit()
    return {'success': True, 'message': 'Budget deleted successfully'}