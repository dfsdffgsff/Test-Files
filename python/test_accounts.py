import pytest
from app.models.account import Account
from app import db

def test_BUG316(client, auth_headers):
    headers, _ = auth_headers
    
    response = client.post('/api/accounts', json={
        'account_type': 'savings'
    }, headers=headers)
    
    assert response.status_code == 201
    assert 'account' in response.get_json()
    assert response.get_json()['account']['account_type'] == 'savings'
    assert response.get_json()['account']['balance'] == 0.0

def test_BUG317(client, auth_headers):
    headers, _ = auth_headers
    
    response = client.post('/api/accounts', json={}, headers=headers)
    assert response.status_code == 400
    
    response = client.post('/api/accounts', json={
        'account_type': 'invalid_type'
    }, headers=headers)
    assert response.status_code == 400

def test_BUG318(client, auth_headers, test_account):
    headers, _ = auth_headers
    
    response = client.get('/api/accounts', headers=headers)
    
    assert response.status_code == 200
    assert 'accounts' in response.get_json()
    assert len(response.get_json()['accounts']) > 0
    
    account_ids = [account['id'] for account in response.get_json()['accounts']]
    assert test_account['id'] in account_ids

def test_BUG319(client, auth_headers, test_account):
    headers, _ = auth_headers
    
    response = client.get(f"/api/accounts/{test_account['id']}", headers=headers)
    
    assert response.status_code == 200
    assert 'account' in response.get_json()
    assert response.get_json()['account']['id'] == test_account['id']

def test_BUG320(client, auth_headers):
    headers, _ = auth_headers
    
    response = client.get('/api/accounts/9999', headers=headers)
    
    assert response.status_code == 404

def test_BUG321(client, auth_headers, test_account):
    headers, _ = auth_headers
    account_id = test_account['id']
    
    update_data = {
        'name': 'Updated Account Name', 
        'description': 'Updated account description'
    }
    
    response = client.put(
        f'/api/accounts/{account_id}',
        headers=headers,
        json=update_data
    )
    
    data = response.get_json()
    assert response.status_code == 200
    assert data['account']['account_name'] == update_data['name'] 
    assert data['account']['description'] == update_data['description']

def test_BUG322(client, auth_headers, test_account):
    headers, _ = auth_headers
    account_id = test_account['id']
    
    response = client.delete(
        f'/api/accounts/{account_id}',
        headers=headers
    )
    
    assert response.status_code == 200
    
    get_response = client.get(
        f'/api/accounts/{account_id}',
        headers=headers
    )
    assert get_response.status_code == 404