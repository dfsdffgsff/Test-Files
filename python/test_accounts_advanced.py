import pytest
import json
import random
import string
from app import db
from app.models.account import Account
from app.models.user import User
from sqlalchemy import text

@pytest.fixture
def authenticated_user(client):
    """Create and authenticate a user."""
    # Register user
    user_data = {
        'email': f'account_test_{random.randint(1000, 9999)}@example.com',
        'password': 'SecurePass123!',
        'first_name': 'Account',
        'last_name': 'Tester'
    }
    
    response = client.post(
        '/api/auth/register',
        data=json.dumps(user_data),
        content_type='application/json'
    )
    assert response.status_code == 201
    
    # Login
    login_response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'email': user_data['email'],
            'password': user_data['password']
        }),
        content_type='application/json'
    )
    assert login_response.status_code == 200
    token = login_response.get_json()['token']
    
    return {
        'user_data': user_data,
        'token': token
    }

def test_account_type_validation(client, authenticated_user):
    """Test validation of account types during account creation."""
    token = authenticated_user['token']
    
    # Test invalid account type
    invalid_type_response = client.post(
        '/api/accounts',
        headers={'Authorization': f'Bearer {token}'},
        data=json.dumps({
            'type': 'INVALID_TYPE',
            'name': 'Invalid Account',
            'balance': 1000
        }),
        content_type='application/json'
    )
    assert invalid_type_response.status_code == 400
    
    # Test with valid account types (assuming checking and savings are valid)
    valid_checking_response = client.post(
        '/api/accounts',
        headers={'Authorization': f'Bearer {token}'},
        data=json.dumps({
            'type': 'checking',  # changed to lowercase
            'name': 'Valid Checking Account',
            'balance': 1000
        }),
        content_type='application/json'
    )
    assert valid_checking_response.status_code == 201
    
    valid_savings_response = client.post(
        '/api/accounts',
        headers={'Authorization': f'Bearer {token}'},
        data=json.dumps({
            'type': 'savings',  # changed to lowercase
            'name': 'Valid Savings Account',
            'balance': 2000
        }),
        content_type='application/json'
    )
    assert valid_savings_response.status_code == 201

def test_account_name_validation(client, authenticated_user):
    """Test validation of account names during account creation."""
    token = authenticated_user['token']
    
    # Test with empty name
    empty_name_response = client.post(
        '/api/accounts',
        headers={'Authorization': f'Bearer {token}'},
        data=json.dumps({
            'type': 'checking',
            'name': '',
            'balance': 1000
        }),
        content_type='application/json'
    )
    assert empty_name_response.status_code == 400
    
    # Test with very long name (assuming there's a length limit)
    long_name = ''.join(random.choice(string.ascii_letters) for _ in range(256))
    long_name_response = client.post(
        '/api/accounts',
        headers={'Authorization': f'Bearer {token}'},
        data=json.dumps({
            'type': 'checking',
            'name': long_name,
            'balance': 1000
        }),
        content_type='application/json'
    )
    assert long_name_response.status_code == 400
    
    # Test with special characters (should be allowed)
    special_chars_response = client.post(
        '/api/accounts',
        headers={'Authorization': f'Bearer {token}'},
        data=json.dumps({
            'type': 'checking',
            'name': 'Account with $pecial Ch@racters!',
            'balance': 1000
        }),
        content_type='application/json'
    )
    assert special_chars_response.status_code == 201

def test_account_update(client, auth_headers, test_account):
    """Test updating account information."""
    headers, _ = auth_headers
    account_id = test_account['id']

    # Update account
    new_details = {
        'account_name': 'Vacation Savings',
        'description': 'Saving for summer vacation'
    }

    response = client.put(
        f'/api/accounts/{account_id}',
        headers=headers,
        json=new_details
    )
    
    assert response.status_code == 200
    updated_account = response.get_json()['account']
    
    # Verify the account was updated
    assert updated_account['account_name'] == new_details['account_name']
    assert updated_account['description'] == new_details['description']

def test_account_deletion(client, authenticated_user):
    """Test deleting an account."""
    token = authenticated_user['token']
    
    # Create an account to delete
    create_response = client.post(
        '/api/accounts',
        headers={'Authorization': f'Bearer {token}'},
        data=json.dumps({
            'type': 'checking',
            'name': 'Account to Delete',
            'balance': 1000
        }),
        content_type='application/json'
    )
    assert create_response.status_code == 201
    account = create_response.get_json()
    account_id = account['id']
    
    # Delete the account
    delete_response = client.delete(
        f'/api/accounts/{account_id}',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert delete_response.status_code in [200, 204]
    
    # Verify account no longer exists
    get_response = client.get(
        f'/api/accounts/{account_id}',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert get_response.status_code == 404

def test_account_listing(client, authenticated_user):
    """Test listing all accounts for a user."""
    token = authenticated_user['token']
    
    # Create multiple accounts
    for i in range(3):
        response = client.post(
            '/api/accounts',
            headers={'Authorization': f'Bearer {token}'},
            data=json.dumps({
                'type': 'checking' if i % 2 == 0 else 'savings',
                'name': f'Test Account {i}',
                'balance': 1000 * (i + 1)
            }),
            content_type='application/json'
        )
        assert response.status_code == 201
    
    # List all accounts
    list_response = client.get(
        '/api/accounts',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert list_response.status_code == 200
    response_data = list_response.get_json()
    
    # Verify we have the accounts
    assert 'accounts' in response_data
    accounts = response_data['accounts']
    assert len(accounts) >= 3
    
    # Check if we can filter by account type
    checking_filter_response = client.get(
        '/api/accounts?type=checking',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert checking_filter_response.status_code == 200
    checking_data = checking_filter_response.get_json()
    checking_accounts = checking_data['accounts']
    
    # Verify all returned accounts are of type checking
    assert all(account['type'] == 'checking' for account in checking_accounts)

def test_account_access_control(client):
    """Test that users cannot access other users' accounts."""
    # Create first user
    user1_data = {
        'email': f'user1_{random.randint(1000, 9999)}@example.com',
        'password': 'SecurePass123!',
        'first_name': 'User',
        'last_name': 'One'
    }
    
    client.post(
        '/api/auth/register',
        data=json.dumps(user1_data),
        content_type='application/json'
    )
    
    login1_response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'email': user1_data['email'],
            'password': user1_data['password']
        }),
        content_type='application/json'
    )
    token1 = login1_response.get_json()['token']
    
    # Create an account for user1
    create_response = client.post(
        '/api/accounts',
        headers={'Authorization': f'Bearer {token1}'},
        data=json.dumps({
            'type': 'checking',
            'name': 'User 1 Account',
            'balance': 1000
        }),
        content_type='application/json'
    )
    account = create_response.get_json()
    account_id = account['id']
    
    # Create second user
    user2_data = {
        'email': f'user2_{random.randint(1000, 9999)}@example.com',
        'password': 'SecurePass123!',
        'first_name': 'User',
        'last_name': 'Two'
    }
    
    client.post(
        '/api/auth/register',
        data=json.dumps(user2_data),
        content_type='application/json'
    )
    
    login2_response = client.post(
        '/api/auth/login',
        data=json.dumps({
            'email': user2_data['email'],
            'password': user2_data['password']
        }),
        content_type='application/json'
    )
    token2 = login2_response.get_json()['token']
    
    # Try to access user1's account with user2's token
    get_response = client.get(
        f'/api/accounts/{account_id}',
        headers={'Authorization': f'Bearer {token2}'}
    )
    assert get_response.status_code in [403, 404]  # Either forbidden or not found
    
    # Try to update user1's account with user2's token
    update_response = client.put(
        f'/api/accounts/{account_id}',
        headers={'Authorization': f'Bearer {token2}'},
        data=json.dumps({
            'account_name': 'Hacked Account'
        }),
        content_type='application/json'
    )
    assert update_response.status_code in [403, 404]
    
    # Try to delete user1's account with user2's token
    delete_response = client.delete(
        f'/api/accounts/{account_id}',
        headers={'Authorization': f'Bearer {token2}'}
    )
    assert delete_response.status_code in [403, 404]

def test_account_limit(client, auth_headers):
    """Test limit on number of accounts per user."""
    headers, user = auth_headers
    max_accounts = 5  # Maximum number of accounts defined in the app
    
    # Create accounts up to the limit
    for i in range(max_accounts):
        response = client.post('/api/accounts', json={
            'account_type': 'savings' if i % 2 == 0 else 'checking'
        }, headers=headers)
        assert response.status_code == 201
    
    # Check the number of accounts created
    with client.application.app_context():
        account_count = Account.query.filter_by(user_id=user.id, is_active=True).count()
        assert account_count == max_accounts
    
    # Verify we can see all accounts via API
    response = client.get('/api/accounts', headers=headers)
    accounts = response.get_json()['accounts']
    assert len(accounts) == max_accounts
    
    # Check that accounts have different account numbers
    account_numbers = [account['account_number'] for account in accounts]
    assert len(account_numbers) == len(set(account_numbers))  # No duplicates
    
    # Try to create one more account (should fail)
    response = client.post('/api/accounts', json={
        'account_type': 'checking'
    }, headers=headers)
    assert response.status_code == 400