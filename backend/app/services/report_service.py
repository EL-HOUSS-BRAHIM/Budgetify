from ..models import Expense, Budget, Goal
from datetime import datetime, timedelta

def generate_monthly_report(user_id):
    today = datetime.utcnow()
    start_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    end_of_month = (start_of_month + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)

    expenses = Expense.query.filter(
        Expense.user_id == user_id,
        Expense.date.between(start_of_month, end_of_month)
    ).all()

    budgets = Budget.query.filter_by(user_id=user_id).all()
    goals = Goal.query.filter_by(user_id=user_id).all()

    total_expenses = sum(expense.amount for expense in expenses)
    expenses_by_category = {}
    for expense in expenses:
        if expense.category not in expenses_by_category:
            expenses_by_category[expense.category] = 0
        expenses_by_category[expense.category] += expense.amount

    budget_progress = {}
    for budget in budgets:
        spent = expenses_by_category.get(budget.category, 0)
        budget_progress[budget.category] = {
            'budgeted': budget.amount,
            'spent': spent,
            'remaining': budget.amount - spent
        }

    goal_progress = []
    for goal in goals:
        progress = (goal.current_amount / goal.target_amount) * 100
        goal_progress.append({
            'name': goal.name,
            'target': goal.target_amount,
            'current': goal.current_amount,
            'progress': progress,
            'deadline': goal.deadline.isoformat()
        })

    report = {
        'total_expenses': total_expenses,
        'expenses_by_category': expenses_by_category,
        'budget_progress': budget_progress,
        'goal_progress': goal_progress
    }

    return report