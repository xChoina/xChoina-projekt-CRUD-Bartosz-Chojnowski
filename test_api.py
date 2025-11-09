import pytest
from app import app
@pytest.fixture
def client():
    app.config['TESTING'] = '1'
    app.config["TESTING"] = True
    client = app.test_client()
    return client

def test_health_endpoint(client):
    response = client.get('/health')
    assert response.status_code == 200

def test_post_endpoint(client):
    response = client.post('/api/patients', json={})
    assert response.status_code == 400

def test_get_endpoint(client):
    response = client.get('/api/patients/9999')
    assert response.status_code == 404

def test_delete_patient_unauthorized(client):
    response = client.delete('/api/patients/1')
    assert response.status_code in [401, 403]
