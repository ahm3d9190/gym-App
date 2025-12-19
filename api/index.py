from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import base64
import requests
import os
from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend

app = FastAPI()

class EncryptRequest(BaseModel):
    text: str
    password: str

class DecryptRequest(BaseModel):
    encrypted_text: str
    password: str

def get_key(password: str, salt: bytes) -> bytes:
    """Derives a key from a password and salt."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    return base64.urlsafe_b64encode(kdf.derive(password.encode()))

# IMPORTANT: Set these environment variables with your Fatsecret API credentials
FATSECRET_CLIENT_ID = os.environ.get("FATSECRET_CLIENT_ID")
FATSECRET_CLIENT_SECRET = os.environ.get("FATSECRET_CLIENT_SECRET")
FATSECRET_TOKEN_URL = "https://oauth.fatsecret.com/connect/token"
FATSECRET_API_URL = "https://platform.fatsecret.com/rest/image-recognition/v1"

def get_access_token():
    """Gets an access token from the Fatsecret API."""
    if not FATSECRET_CLIENT_ID or not FATSECRET_CLIENT_SECRET:
        raise ValueError("FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET must be set.")

    data = {
        "grant_type": "client_credentials",
        "client_id": FATSECRET_CLIENT_ID,
        "client_secret": FATSECRET_CLIENT_SECRET,
        "scope": "image-recognition"
    }
    response = requests.post(FATSECRET_TOKEN_URL, data=data)
    response.raise_for_status()
    return response.json()["access_token"]


@app.get("/api")
def read_root():
    return {"message": "Welcome to the Calorie Counter AI API!"}


@app.post("/api/encrypt")
def encrypt_message(request: EncryptRequest):
    """Encrypts a message with a password."""
    salt = os.urandom(16)
    key = get_key(request.password, salt)
    fernet = Fernet(key)
    encrypted_text = fernet.encrypt(request.text.encode())
    return {"encrypted_text": base64.urlsafe_b64encode(salt + encrypted_text).decode()}

@app.post("/api/decrypt")
def decrypt_message(request: DecryptRequest):
    """Decrypts a message with a password."""
    try:
        decoded_data = base64.urlsafe_b64decode(request.encrypted_text)
        salt = decoded_data[:16]
        encrypted_text = decoded_data[16:]
        key = get_key(request.password, salt)
        fernet = Fernet(key)
        decrypted_text = fernet.decrypt(encrypted_text).decode()
        return {"decrypted_text": decrypted_text}
    except (InvalidToken, TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid encrypted text or password.")


@app.post("/api/analyze")
async def analyze_image(image: UploadFile = File(...)):
    """
    Analyzes an image of food to determine its nutritional content.
    """
    try:
        access_token = get_access_token()
    except (ValueError, requests.exceptions.RequestException) as e:
        raise HTTPException(status_code=500, detail=f"Could not authenticate with Fatsecret API: {e}")


    contents = await image.read()
    image_b64 = base64.b64encode(contents).decode("utf-8")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    data = {
        "image_b64": image_b64,
        "include_food_data": True
    }

    try:
        response = requests.post(FATSECRET_API_URL, headers=headers, json=data)
        response.raise_for_status()  # Raise an exception for bad status codes

        # Process the response to extract relevant information
        food_data = response.json()
        if "error" in food_data:
            raise HTTPException(status_code=400, detail=food_data["error"]["message"])

        if "food_response" not in food_data or not food_data["food_response"]:
            return {"message": "No food detected in the image."}

        # For simplicity, returning the first detected food item's nutritional content
        first_food = food_data["food_response"][0]
        nutritional_content = first_food.get("eaten", {}).get("total_nutritional_content", {})

        return {
            "food_name": first_food.get("food_entry_name"),
            "calories": nutritional_content.get("calories"),
            "protein": nutritional_content.get("protein"),
            "fat": nutritional_content.get("fat"),
            "carbs": nutritional_content.get("carbohydrate"),
        }

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect to Fatsecret API: {e}")
