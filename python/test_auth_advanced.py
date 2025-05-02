import pytest
import time
import jwt
import json
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token, get_jti, decode_token
from app import create_app, db
from app.models.user import User
from app.config import Config
from app.routes.auth import token_blocklist


@pytest.fixture
def app_with_short_token_life():
    """Create an app with short token expiration for testing."""
    app = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "JWT_SECRET_KEY": "test-key",
            "JWT_ACCESS_TOKEN_EXPIRES": timedelta(seconds=1),  # Very short expiration
        }
    )

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client_with_short_token(app_with_short_token_life):
    return app_with_short_token_life.test_client()


@pytest.fixture
def user_credentials():
    """Fixture to provide user credentials."""
    return {"email": "testauth@example.com", "password": "SecurePassword123!"}


@pytest.fixture
def registered_user(client):
    """Create a registered user for testing."""
    user_data = {
        "email": "advanced@example.com",
        "password": "SecurePass123!",
        "first_name": "Advanced",
        "last_name": "User",
    }

    response = client.post(
        "/api/auth/register",
        data=json.dumps(user_data),
        content_type="application/json",
    )
    assert response.status_code == 201

    return user_data


def test_token_refresh(client, registered_user):
    """Test that refresh tokens can be used to get new access tokens."""
    # Login to get token
    login_response = client.post(
        "/api/login",
        data=json.dumps(
            {"email": registered_user["email"], "password": registered_user["password"]}
        ),
        content_type="application/json",
    )
    assert login_response.status_code == 200

    # Check if the login response includes a token
    response_data = login_response.get_json()
    assert "token" in response_data

    # Get the access token
    access_token = response_data["token"]

    # Check if the refresh token exists in the response
    refresh_token = response_data["refresh_token"]

    # Try the /api/auth/refresh endpoint first
    refresh_response = client.post(
        "/api/auth/refresh",
        headers={"Authorization": f"Bearer {refresh_token}"},
        content_type="application/json",
    )

    # Now we should have a successful response one way or another
    assert refresh_response.status_code == 200

    # Verify old refresh token is revoked
    second_refresh_response = client.post(
        "/api/auth/refresh",
        headers={"Authorization": f"Bearer {refresh_token}"},
        content_type="application/json",
    )
    assert second_refresh_response.status_code == 401

    new_token_data = refresh_response.get_json()
    # Check if the new access token is present in the response
    assert "token" in new_token_data or "access_token" in new_token_data
    # Check if the new refresh token is present in the response
    assert "refresh_token" in new_token_data

    # Get the new token
    new_token = new_token_data.get("token") or new_token_data.get("access_token")

    # Verify new token works
    profile_response = client.get(
        "/api/auth/profile", headers={"Authorization": f"Bearer {new_token}"}
    )
    assert profile_response.status_code == 200

    # Call the refresh endpoint with the access token instead of the refresh token
    response = client.post(
        "/api/auth/refresh",
        headers={"Authorization": f"Bearer {access_token}"},
        content_type="application/json",
    )
    assert response.status_code == 401

def test_token_refresh_with_role(client, registered_user):
    """Test that refresh tokens retain the user's role."""
    login_response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'email': registered_user['email'],
            'password': registered_user['password']
        }),
        content_type='application/json'
    )
    assert login_response.status_code == 200

    refresh_token = login_response.get_json()['refresh_token']

    refresh_response = client.post(
        '/api/auth/refresh',
        headers={'Authorization': f'Bearer {refresh_token}'},
        content_type='application/json'
    )
    assert refresh_response.status_code == 200
    assert 'access_token' in refresh_response.get_json()
    assert 'refresh_token' in refresh_response.get_json()       

    new_access_token = refresh_response.get_json()['access_token']
    new_refresh_token = refresh_response.get_json()['refresh_token']

    # Check if the new tokens have role attribute and if it matches the original role
    decoded_new_access_token = decode_token(new_access_token)
    decoded_new_refresh_token = decode_token(new_refresh_token)
    
    assert 'role' in decoded_new_access_token, "New access token should have role"
    assert 'role' in decoded_new_refresh_token, "New refresh token should have role"
    assert decoded_new_access_token['role'] == 'user', "Access token role should be 'user'"
    assert decoded_new_refresh_token['role'] == 'user', "Refresh token role should be 'user'"

def test_verify_token_with_expired_token(client):
    """Test that the verify_token endpoint incorrectly validates expired tokens."""
    # Create a test user
    with client.application.app_context():
        user = User(
            username="testuser", email="testuser@example.com", password="password123"
        )
        db.session.add(user)
        db.session.commit()

        # Generate an expired token
        expired_token = create_access_token(
            identity=user.id, expires_delta=timedelta(seconds=1)
        )
        time.sleep(2)  # Wait for the token to expire

    # Call the verify_token endpoint with the expired token
    response = client.post(
        "/api/auth/verify",
        headers={"Authorization": f"Bearer {expired_token}"},
        content_type="application/json",
    )
    assert response.status_code == 401


def test_password_change(client, registered_user):
    """Test that users can change their password and old password no longer works."""
    # Login with original password
    login_response = client.post(
        "/api/auth/login",
        data=json.dumps(
            {"email": registered_user["email"], "password": registered_user["password"]}
        ),
        content_type="application/json",
    )
    assert login_response.status_code == 200
    token = login_response.get_json()["token"]

    # Change password
    new_password = "NewSecurePass456!"
    password_change_response = client.post(
        "/api/auth/change-password",
        headers={"Authorization": f"Bearer {token}"},
        data=json.dumps(
            {
                "current_password": registered_user["password"],
                "new_password": new_password,
            }
        ),
        content_type="application/json",
    )
    assert password_change_response.status_code == 200

    # Try to login with old password (should fail)
    old_login_response = client.post(
        "/api/auth/login",
        data=json.dumps(
            {"email": registered_user["email"], "password": registered_user["password"]}
        ),
        content_type="application/json",
    )
    assert old_login_response.status_code in [401, 403]

    # Login with new password (should succeed)
    new_login_response = client.post(
        "/api/auth/login",
        data=json.dumps({"email": registered_user["email"], "password": new_password}),
        content_type="application/json",
    )
    assert new_login_response.status_code == 200
    new_token = new_login_response.get_json()["token"]

    # Verify new token works
    profile_response = client.get(
        "/api/auth/profile", headers={"Authorization": f"Bearer {new_token}"}
    )
    assert profile_response.status_code == 200

def test_logout_with_refresh_token(client, registered_user):
    """Test that users can logout using refresh token and their tokens are invalidated."""
    # Login to get token
    login_response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'email': registered_user['email'],
            'password': registered_user['password']
        }),
        content_type='application/json'
    )
    assert login_response.status_code == 200
    refresh_token = login_response.get_json()['refresh_token']
    
    # Logout using refresh token
    logout_response = client.post(
        '/api/auth/logout',
        headers={'Authorization': f'Bearer {refresh_token}'}
    )
    assert logout_response.status_code in [200, 204]
    
    # Try to use refresh token after logout (should fail)
    post_logout_response = client.post(
        '/api/auth/refresh',
        headers={'Authorization': f'Bearer {refresh_token}'}
    )
    assert post_logout_response.status_code in [401, 403]

def test_fresh_token_required(client, registered_user):
    """Test that fresh tokens are required for certain actions."""
    # Login to get token
    login_response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'email': registered_user['email'],
            'password': registered_user['password']
        }),
        content_type='application/json'
    )
    assert login_response.status_code == 200
    fresh_token = login_response.get_json()['access_token']

    # Change password
    new_password = 'NewSecurePass456!'
    password_change_response = client.post(
        '/api/auth/change-password',
        headers={'Authorization': f'Bearer {fresh_token}'},
        data=json.dumps({
            'current_password': registered_user['password'],
            'new_password': new_password
        }),
        content_type='application/json'
    )
    assert password_change_response.status_code == 200

def test_token_claims(client, registered_user):
    """Test that JWT claims contain any sensitive information."""
    # Login to get token
    login_response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'email': registered_user['email'],
            'password': registered_user['password']
        }),
        content_type='application/json'
    )
    assert login_response.status_code == 200
    access_token = login_response.get_json()['token']
    refresh_token = login_response.get_json()['refresh_token']
    
    # Decode the token and check claims
    decoded_access_token = decode_token(access_token)
    decoded_refresh_token = decode_token(refresh_token)

    assert 'password' not in decoded_access_token, "Password should not be in token claims"
    assert 'password' not in decoded_refresh_token, "Password should not be in token claims"

def test_token_blocklist_persistence(client, registered_user):
    """Test that revoked tokens remain invalidated after a simulated restart."""
    # Login to get tokens
    login_response = client.post(
        '/api/login',
        data=json.dumps({
            'email': registered_user['email'],
            'password': registered_user['password']
        }),
        content_type='application/json'
    )
    assert login_response.status_code == 200

    # Call logout to revoke the tokens
    logout_response = client.post(
        '/api/auth/logout',
        headers={'Authorization': f'Bearer {login_response.get_json()["token"]}'}
    )
    assert logout_response.status_code == 200
    jti = get_jti(login_response.get_json()['token'])
    
    # Remove the above token from the blocklist (simulating a restart) if exists
    token_blocklist.discard(jti)

    # Token should be invalidated after logout
    post_logout_response = client.get(
        '/api/auth/profile',
        headers={'Authorization': f'Bearer {login_response.get_json()["token"]}'}
    )
    assert post_logout_response.status_code == 401, "Token should be invalid after logout"