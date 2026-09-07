def calculate_net_worth(assets, liabilities):
    return sum(assets) - sum(liabilities)

def analyze_budget(budget, expenses):
    analysis = {}
    for category, budgeted_amount in budget.items():
        spent = sum(expense['amount'] for expense in expenses if expense['category'] == category)
        remaining = budgeted_amount - spent
        analysis[category] = {
            'budgeted': budgeted_amount,
            'spent': spent,
            'remaining': remaining,
            'percentage_used': (spent / budgeted_amount) * 100 if budgeted_amount > 0 else 0
        }
    return analysis