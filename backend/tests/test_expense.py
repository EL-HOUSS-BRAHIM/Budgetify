import json

def test_add_expense(client, user):
    # First, login to get the token
    login_response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = json.loads(login_response.data)['access_token']

    # Then, add an expense
    response = client.post('/api/expenses', json={
        'amount': 50.00,
        'category': 'Food',
        'date': '2023-07-27',
        'description': 'Groceries'
    }, headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 201
    assert 'success' in json.loads(response.data)

def test_get_expenses(client, user):
    # First, login to get the token
    login_response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = json.loads(login_response.data)['access_token']

    # Then, get expenses
    response = client.get('/api/expenses', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)