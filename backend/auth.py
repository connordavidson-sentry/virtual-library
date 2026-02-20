from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from models import User
import sentry_sdk


def get_current_user():
    """Get the current authenticated user from the JWT token"""
    user_id = get_jwt_identity()
    if user_id:
        return User.query.get(int(user_id))
    return None


def token_required(fn):
    """Decorator that requires a valid JWT token"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user = get_current_user()

            if not current_user:
                print("ERROR: User not found in database")
                return jsonify({'error': 'User not found'}), 401

            if not current_user.active:
                print("ERROR: User account is inactive")
                return jsonify({'error': 'User account is inactive'}), 401

            return fn(*args, **kwargs)
        except Exception as e:
            print(f"ERROR in token_required: {type(e).__name__}: {str(e)}")
            # Capture exception in Sentry
            sentry_sdk.capture_exception(e)
            return jsonify({'error': f'Authentication required: {str(e)}'}), 401

    return wrapper


def teacher_required(fn):
    """Decorator that requires a teacher role"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user = get_current_user()

            if not current_user:
                print("ERROR: User not found in database")
                return jsonify({'error': 'User not found'}), 401

            if not current_user.active:
                print("ERROR: User account is inactive")
                return jsonify({'error': 'User account is inactive'}), 401

            if current_user.role != 'teacher':
                print(f"ERROR: User role is {current_user.role}, not teacher")
                return jsonify({'error': 'Teacher access required'}), 403

            return fn(*args, **kwargs)
        except Exception as e:
            print(f"ERROR in teacher_required: {type(e).__name__}: {str(e)}")
            # Capture exception in Sentry
            sentry_sdk.capture_exception(e)
            return jsonify({'error': f'Authentication required: {str(e)}'}), 401

    return wrapper


def student_or_teacher_required(fn):
    """Decorator that requires either student or teacher role (any authenticated user)"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user = get_current_user()

            if not current_user:
                print("ERROR: User not found in database")
                return jsonify({'error': 'User not found'}), 401

            if not current_user.active:
                print("ERROR: User account is inactive")
                return jsonify({'error': 'User account is inactive'}), 401

            if current_user.role not in ['student', 'teacher']:
                print(f"ERROR: User role is {current_user.role}, not student or teacher")
                return jsonify({'error': 'Student or teacher access required'}), 403

            return fn(*args, **kwargs)
        except Exception as e:
            print(f"ERROR in student_or_teacher_required: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            # Capture exception in Sentry
            sentry_sdk.capture_exception(e)
            return jsonify({'error': f'Authentication required: {str(e)}'}), 401

    return wrapper
