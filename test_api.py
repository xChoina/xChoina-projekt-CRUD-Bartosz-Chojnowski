import pytest
from app import app
import os
os.environ["TESTING"] = "1"
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
    client.post("/register", json={
        "username": "test_admin",
        "password": "Test1234",
        "role": "admin"
    })
    with client:
        client.post("/login", json={
            "username": "test_admin",
            "password": "Test1234"
    })
        response = client.post('/api/patients', json={
            "name": "Test",
            "surname": "Patient",
            "age": 30,
            "pressure": 120,
            "temperature": 36.6,
            "pulse": 70,
            "pesel": "12345678901"
    })
        assert response.status_code == 201


def test_get_endpoint(client):
    # rejestracja + logowanie admina
    client.post("/register", json={
        "username": "test_admin2",
        "password": "Test1234",
        "role": "admin"
    })
    client.post("/login", json={
        "username": "test_admin2",
        "password": "Test1234"
    })

    # próba pobrania nieistniejącego pacjenta
    response = client.get('/api/patients/9999')
    assert response.status_code == 404


def test_delete_patient_unauthorized(client):
    response = client.delete('/api/patients/1')
    assert response.status_code in [401, 403]

