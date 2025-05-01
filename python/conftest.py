import os
import pytest
import tempfile
from app import create_app, db
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction

@pytest.fixture
def app():
    """Create and configure a Flask app for testing."""
    # Use in-memory SQLite database instead of a file
    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'JWT_SECRET_KEY': 'test-key'
    })
    
    # Create the database
    with app.app_context():
        db.create_all()
        yield app

@pytest.fixture
def client(app):
    """Test client for the Flask app."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """CLI test runner for the Flask app."""
    return app.test_cli_runner()

@pytest.fixture
def auth_headers(client):
    """Authentication headers with JWT token for a test user."""
    with client.application.app_context():
        # Create a test user
        user = User(username='testuser', email='test@example.com', password='password123')
        db.session.add(user)
        db.session.commit()
        
        # Get JWT token - try both endpoints
        try:
            response = client.post('/api/login', json={
                'username': 'testuser',
                'password': 'password123'
            })
            json_data = response.get_json()
            
            if json_data and ('access_token' in json_data or 'token' in json_data):
                token = json_data.get('access_token') or json_data.get('token')
            else:
                # Try alternative endpoint
                response = client.post('/api/auth/login', json={
                    'username': 'testuser',
                    'password': 'password123'
                })
                json_data = response.get_json()
                token = json_data.get('access_token') or json_data.get('token')
        except Exception:
            # Fallback if everything fails - create a token directly
            from flask_jwt_extended import create_access_token
            with client.application.app_context():
                token = create_access_token(identity=user.id)
        
        headers = {'Authorization': f'Bearer {token}'}
        
        return headers, user

@pytest.fixture
def test_account(client, auth_headers):
    """Create a test account for the authenticated user."""
    headers, user = auth_headers
    
    with client.application.app_context():
        # Create an account directly in DB
        account = Account(
            account_number='ACCT-TEST',
            account_type='savings',
            user_id=user.id
        )
        db.session.add(account)
        db.session.commit()
        
        return account.to_dict() 