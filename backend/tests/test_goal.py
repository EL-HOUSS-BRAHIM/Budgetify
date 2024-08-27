import json
from datetime import date, timedelta

def test_add_goal(client, user):
    # Login to get the token
    login_response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = json.loads(login_response.data)['access_token']

    # Add a goal
    deadline = (date.today() + timedelta(days=365)).isoformat()
    response = client.post('/api/goals', json={
        'name': 'Buy a car',
        'target_amount': 20000.00,
        'deadline': deadline
    }, headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 201
    assert 'success' in json.loads(response.data)

def test_get_goals(client, user):
    # Login to get the token
    login_response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = json.loads(login_response.data)['access_token']

    # Get goals
    response = client.get('/api/goals', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_update_goal(client, user):
    # Login to get the token
    login_response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = json.loads(login_response.data)['access_token']

    # First, add a goal
    deadline = (date.today() + timedelta(days=365)).isoformat()
    add_response = client.post('/api/goals', json={
        'name': 'Buy a car',
        'target_amount': 20000.00,
        'deadline': deadline
    }, headers={
        'Authorization': f'Bearer {token}'
    })
    goal_id = json.loads(add_response.data)['id']

    # Now update the goal
    update_response = client.put(f'/api/goals/{goal_id}', json={
        'name': 'Buy a car',
        'target_amount': 25000.00,
        'current_amount': 5000.00,
        'deadline': deadline
    }, headers={
        'Authorization': f'Bearer {token}'
    })
    assert update_response.status_code == 200
    assert 'success' in json.loads(update_response.data)