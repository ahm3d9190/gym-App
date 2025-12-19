from fastapi.testclient import TestClient
from api.index import app

client = TestClient(app)

def test_encrypt_decrypt_success():
    """Tests successful encryption and decryption."""
    password = "testpassword"
    original_text = "This is a secret message."

    # Encrypt
    response = client.post("/api/encrypt", json={"text": original_text, "password": password})
    assert response.status_code == 200
    encrypted_text = response.json()["encrypted_text"]
    assert encrypted_text != original_text

    # Decrypt
    response = client.post("/api/decrypt", json={"encrypted_text": encrypted_text, "password": password})
    assert response.status_code == 200
    decrypted_text = response.json()["decrypted_text"]
    assert decrypted_text == original_text

def test_decrypt_wrong_password():
    """Tests decryption with the wrong password."""
    password = "testpassword"
    wrong_password = "wrongpassword"
    original_text = "This is a secret message."

    # Encrypt
    response = client.post("/api/encrypt", json={"text": original_text, "password": password})
    assert response.status_code == 200
    encrypted_text = response.json()["encrypted_text"]

    # Decrypt with wrong password
    response = client.post("/api/decrypt", json={"encrypted_text": encrypted_text, "password": wrong_password})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid encrypted text or password."

def test_decrypt_invalid_text():
    """Tests decryption with invalid encrypted text."""
    password = "testpassword"
    invalid_text = "this is not encrypted text"

    response = client.post("/api/decrypt", json={"encrypted_text": invalid_text, "password": password})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid encrypted text or password."
