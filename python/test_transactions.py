import pytest
from app.models.transaction import Transaction
from app.models.account import Account
from app import db

def test_deposit(client, auth_headers, test_account):
    """Test depositing funds into an account."""
    headers, _ = auth_headers
    
    response = client.post('/api/transactions/deposit', json={
        'account_id': test_account['id'],
        'amount': 100.0,
        'description': 'Test deposit'
    }, headers=headers)
    
    assert response.status_code == 200
    assert 'transaction' in response.get_json()
    assert response.get_json()['transaction']['amount'] == 100.0
    assert response.get_json()['transaction']['transaction_type'] == 'deposit'
    assert response.get_json()['new_balance'] == 100.0
    
    # Check that the account balance was updated
    with client.application.app_context():
        account = Account.query.get(test_account['id'])
        assert account.balance == 100.0

def test_withdraw(client, auth_headers, test_account):
    """Test withdrawing funds from an account."""
    headers, _ = auth_headers
    
    # First, deposit some funds
    client.post('/api/transactions/deposit', json={
        'account_id': test_account['id'],
        'amount': 200.0
    }, headers=headers)
    
    # Then, withdraw some funds
    response = client.post('/api/transactions/withdraw', json={
        'account_id': test_account['id'],
        'amount': 50.0,
        'description': 'Test withdrawal'
    }, headers=headers)
    
    assert response.status_code == 200
    assert 'transaction' in response.get_json()
    assert response.get_json()['transaction']['amount'] == 50.0
    assert response.get_json()['transaction']['transaction_type'] == 'withdrawal'
    assert response.get_json()['new_balance'] == 150.0
    
    # Check that the account balance was updated
    with client.application.app_context():
        account = Account.query.get(test_account['id'])
        assert account.balance == 150.0

def test_withdraw_insufficient_funds(client, auth_headers, test_account):
    """Test withdrawing more funds than available."""
    headers, _ = auth_headers
    
    # First, deposit some funds
    client.post('/api/transactions/deposit', json={
        'account_id': test_account['id'],
        'amount': 50.0
    }, headers=headers)
    
    # Then, try to withdraw more than available
    response = client.post('/api/transactions/withdraw', json={
        'account_id': test_account['id'],
        'amount': 100.0
    }, headers=headers)
    
    assert response.status_code == 400
    assert 'error' in response.get_json()
    assert 'Insufficient funds' in response.get_json()['error']
    
    # Check that the account balance was not changed
    with client.application.app_context():
        account = Account.query.get(test_account['id'])
        assert account.balance == 50.0

def test_transfer(client, auth_headers, test_account):
    """Test transferring funds between accounts."""
    headers, _ = auth_headers
    
    # First, deposit some funds to the source account
    client.post('/api/transactions/deposit', json={
        'account_id': test_account['id'],
        'amount': 200.0
    }, headers=headers)
    
    # Create a second account for the transfer
    response = client.post('/api/accounts', json={
        'account_type': 'checking'
    }, headers=headers)
    
    second_account = response.get_json()['account']
    
    # Transfer funds between accounts
    response = client.post('/api/transactions/transfer', json={
        'from_account_id': test_account['id'],
        'to_account_id': second_account['id'],
        'amount': 75.0,
        'description': 'Test transfer'
    }, headers=headers)
    
    assert response.status_code == 200
    assert 'transaction' in response.get_json()
    assert response.get_json()['transaction']['amount'] == 75.0
    assert response.get_json()['transaction']['transaction_type'] == 'transfer'
    assert response.get_json()['from_account_balance'] == 125.0
    assert response.get_json()['to_account_balance'] == 75.0
    
    # Check that both account balances were updated
    with client.application.app_context():
        source_account = Account.query.get(test_account['id'])
        dest_account = Account.query.get(second_account['id'])
        assert source_account.balance == 125.0
        assert dest_account.balance == 75.0

def test_get_transactions(client, auth_headers, test_account):
    """Test retrieving transaction history."""
    headers, _ = auth_headers
    
    # Create some transactions
    client.post('/api/transactions/deposit', json={
        'account_id': test_account['id'],
        'amount': 100.0
    }, headers=headers)
    
    client.post('/api/transactions/withdraw', json={
        'account_id': test_account['id'],
        'amount': 25.0
    }, headers=headers)
    
    # Get transaction history
    response = client.get('/api/transactions', headers=headers)
    
    assert response.status_code == 200
    assert 'transactions' in response.get_json()
    assert len(response.get_json()['transactions']) >= 2 