from ..models import Goal
from .. import db
from datetime import datetime

def get_goals(user_id):
    goals = Goal.query.filter_by(user_id=user_id).all()
    return [{'id': g.id, 'name': g.name, 'target_amount': g.target_amount, 'current_amount': g.current_amount, 'deadline': g.deadline.isoformat()} for g in goals]

def add_goal(user_id, data):
    new_goal = Goal(
        name=data['name'],
        target_amount=data['target_amount'],
        current_amount=data.get('current_amount', 0),
        deadline=datetime.fromisoformat(data['deadline']),
        user_id=user_id
    )
    db.session.add(new_goal)
    db.session.commit()
    return {'success': True, 'message': 'Goal added successfully', 'id': new_goal.id}

def update_goal(user_id, goal_id, data):
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return {'success': False, 'message': 'Goal not found'}
    
    goal.name = data['name']
    goal.target_amount = data['target_amount']
    goal.current_amount = data['current_amount']
    goal.deadline = datetime.fromisoformat(data['deadline'])
    
    db.session.commit()
    return {'success': True, 'message': 'Goal updated successfully'}

def delete_goal(user_id, goal_id):
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return {'success': False, 'message': 'Goal not found'}
    
    db.session.delete(goal)
    db.session.commit()
    return {'success': True, 'message': 'Goal deleted successfully'}