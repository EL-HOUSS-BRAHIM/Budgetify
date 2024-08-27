import pymysql
pymysql.install_as_MySQLdb()
import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from .config import Config
from .utils.response_utils import error_response
import logging

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app)

    from .routes import auth_bp, expense_bp, budget_bp, goal_bp, report_bp, profile_bp, settings_bp, testmail_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(expense_bp)
    app.register_blueprint(budget_bp)
    app.register_blueprint(goal_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(testmail_bp)

    # Set up logging
    if not app.debug:
        if not os.path.exists('logs'):
            os.mkdir('logs')
        file_handler = logging.FileHandler('logs/budgetapp.log')
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Budget app startup')

    # Error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return error_response('Not found', 404)

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        app.logger.error('Server Error: %s', str(error))
        return error_response('Internal server error', 500)

    @app.errorhandler(Exception)
    def unhandled_exception(error):
        app.logger.error('Unhandled Exception: %s', str(error))
        return error_response('An unexpected error occurred', 500)

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"message": "Token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"message": "Invalid token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"message": "Missing authorization token"}), 401

    return app
