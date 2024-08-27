import json

def test_register(client):
    response = client.post('/api/auth/register', json={
        'username': 'newuser',
        'email': 'newuser@example.com',
        'password': 'password123'
    })
    assert response.status_code == 201
    assert 'success' in json.loads(response.data)

def test_login(client, user):
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    assert response.status_code == 200
    assert 'access_token' in json.loads(response.data)

def test_logout(client, user):
    # First, login to get the token
    login_response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = json.loads(login_response.data)['access_token']

    # Then, use the token to logout
    response = client.post('/api/auth/logout', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    assert 'success' in json.loads(response.data)