import json
from datetime import date, timedelta

def test_add_budget(client, user):
    # Login to get the token
    login_response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = json.loads(login_response.data)['access_token']

    # Add a budget
    start_date = date.today().isoformat()
    end_date = (date.today() + timedelta(days=30)).isoformat()
    response = client.post('/api/budgets', json={
        'category': 'Food',
        'amount': 500.00,
        'start_date': start_date,
        'end_date': end_date
    }, headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 201
    assert 'success' in json.loads(response.data)

def test_get_budgets(client, user):
    # Login to get the token
    login_response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = json.loads(login_response.data)['access_token']

    # Get budgets
    response = client.get('/api/budgets', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_update_budget(client, user):
    # Login to get the token
    login_response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = json.loads(login_response.data)['access_token']

    # First, add a budget
    start_date = date.today().isoformat()
    end_date = (date.today() + timedelta(days=30)).isoformat()
    add_response = client.post('/api/budgets', json={
        'category': 'Food',
        'amount': 500.00,
        'start_date': start_date,
        'end_date': end_date
    }, headers={
        'Authorization': f'Bearer {token}'
    })
    budget_id = json.loads(add_response.data)['id']

    # Now update the budget
    update_response = client.put(f'/api/budgets/{budget_id}', json={
        'category': 'Food',
        'amount': 600.00,
        'start_date': start_date,
        'end_date': end_date
    }, headers={
        'Authorization': f'Bearer {token}'
    })
    assert update_response.status_code == 200
    assert 'success' in json.loads(update_response.data)