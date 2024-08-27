from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import report_bp
from ..services.report_service import generate_monthly_report

@report_bp.route('/monthly', methods=['GET'])
@jwt_required()
def get_monthly_report():
    user_id = get_jwt_identity()
    report = generate_monthly_report(user_id)
    return jsonify(report), 200