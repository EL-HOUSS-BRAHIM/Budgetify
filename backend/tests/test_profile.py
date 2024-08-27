import json

def test_get_profile(client, user):
    # Login to get the token
    login_response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = json.loads(login_response.data)['access_token']

    # Get profile
    response = client.get('/api/profile', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'first_name' in data
    assert 'last_name' in data
    assert 'currency' in data

def test_update_profile(client, user):
    # Login to get the token
    login_response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = json.loads(login_response.data)['access_token']

    # Update profile
    response = client.put('/api/profile', json={
        'first_name': 'John',
        'last_name': 'Doe',
        'currency': 'EUR'
    }, headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    assert 'success' in json.loads(response.data)

    # Verify the update
    get_response = client.get('/api/profile', headers={
        'Authorization': f'Bearer {token}'
    })
    data = json.loads(get_response.data)
    assert data['first_name'] == 'John'
    assert data['last_name'] == 'Doe'
    assert data['currency'] == 'EUR'