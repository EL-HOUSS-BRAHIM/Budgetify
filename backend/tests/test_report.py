import json

def test_get_monthly_report(client, user):
    # Login to get the token
    login_response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    token = json.loads(login_response.data)['access_token']

    # Get monthly report
    response = client.get('/api/reports/monthly', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'total_expenses' in data
    assert 'expenses_by_category' in data
    assert 'budget_progress' in data
    assert 'goal_progress' in data