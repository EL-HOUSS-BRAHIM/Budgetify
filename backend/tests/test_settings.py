import json

def test_get_settings(client, user):
    # Login to get the token
    login_response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = json.loads(login_response.data)['access_token']

    # Get settings
    response = client.get('/api/settings', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'notification_enabled' in data
    assert 'theme' in data

def test_update_settings(client, user):
    # Login to get the token
    login_response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = json.loads(login_response.data)['access_token']

    # Update settings
    response = client.put('/api/settings', json={
        'notification_enabled': False,
        'theme': 'dark'
    }, headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    assert 'success' in json.loads(response.data)

    # Verify the update
    get_response = client.get('/api/settings', headers={
        'Authorization': f'Bearer {token}'
    })
    data = json.loads(get_response.data)
    assert data['notification_enabled'] == False
    assert data['theme'] == 'dark'