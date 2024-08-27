from flask import Blueprint, Flask

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
expense_bp = Blueprint('expense', __name__, url_prefix='/api/expenses')
budget_bp = Blueprint('budget', __name__, url_prefix='/api/budget')
goal_bp = Blueprint('goal', __name__, url_prefix='/api/goals')
report_bp = Blueprint('report', __name__, url_prefix='/api/reports')
profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')
settings_bp = Blueprint('settings', __name__, url_prefix='/api/settings')
testmail_bp = Blueprint('testmail', __name__, url_prefix='/api/testmail')

from . import auth_routes, expense_routes, budget_routes, goal_routes, report_routes, profile_routes, settings_routes, test_email