import pytest
import time
from datetime import datetime, timedelta
from app import db
from app.models.transaction import Transaction
from app.models.account import Account
import threading

@pytest.fixture
def populate_transactions(client, auth_headers, test_account):
    """Fixture to populate multiple transactions for filtering and pagination tests."""
    headers, _ = auth_headers
    account_id = test_account['id']
    
    # Create 20 transactions with different amounts and timestamps
    transaction_data = []
    
    # Create transactions with different dates and descriptions
    base_date = datetime.now() - timedelta(days=30)
    
    descriptions = [
        "Groceries at Supermart", 
        "Coffee at Starbucks",
        "Gas station refill",
        "Monthly rent payment", 
        "Utility bill",
        "Subscription payment",
        "Restaurant dinner",
        "Online shopping Amazon",
        "Pharmacy purchase",
        "Movie tickets"
    ]
    
    # Insert transactions directly into the database
    with client.application.app_context():
        for i in range(20):
            # Alternate between deposits and withdrawals
            amount = 100 + (i * 25) if i % 2 == 0 else -(50 + (i * 15))
            # Use different dates
            trans_date = base_date + timedelta(days=i)
            # Cycle through descriptions
            description = descriptions[i % len(descriptions)]
            
            # Create transaction directly in DB
            transaction = Transaction(
                transaction_type='deposit' if amount > 0 else 'withdrawal',
                from_account_id=account_id if amount < 0 else None,
                to_account_id=account_id if amount > 0 else None,
                amount=abs(amount),
                description=description,
                timestamp=trans_date
            )
            db.session.add(transaction)
            
            # Store data for validation
            transaction_data.append({
                'amount': amount,
                'description': description,
                'date': trans_date.strftime('%Y-%m-%d')
            })
        
        db.session.commit()
    
    return transaction_data

def test_transaction_filtering(client, auth_headers, test_account, populate_transactions):
    """Test filtering transactions by date range and type."""
    headers, _ = auth_headers
    account_id = test_account['id']
    
    # Test filter by date range (last 15 days)
    today = datetime.now().strftime('%Y-%m-%d')
    fifteen_days_ago = (datetime.now() - timedelta(days=15)).strftime('%Y-%m-%d')
    
    response = client.get(
        f'/api/accounts/{account_id}/transactions?start_date={fifteen_days_ago}&end_date={today}',
        headers=headers
    )
    assert response.status_code == 200
    filtered_transactions = response.get_json()['transactions']
    
    # Should have around 15 transactions (exact number depends on current date)
    assert len(filtered_transactions) >= 5
    
    # Test filter by transaction type (deposits only)
    response = client.get(
        f'/api/accounts/{account_id}/transactions?type=deposit',
        headers=headers
    )
    assert response.status_code == 200
    deposits = response.get_json()['transactions']
    
    # Verify all returned transactions are deposits (positive amounts)
    for transaction in deposits:
        assert float(transaction['amount']) > 0
    
    # Test filter by transaction type (withdrawals only)
    response = client.get(
        f'/api/accounts/{account_id}/transactions?type=withdrawal',
        headers=headers
    )
    assert response.status_code == 200
    withdrawals = response.get_json()['transactions']
    
    # Verify all returned transactions are withdrawals (negative amounts)
    for transaction in withdrawals:
        assert float(transaction['amount']) < 0
