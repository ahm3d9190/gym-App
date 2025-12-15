from fastapi.testclient import TestClient
from api.index import app
from unittest.mock import patch, Mock
import io

client = TestClient(app)

def test_read_root():
    response = client.get("/api")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Calorie Counter AI API!"}

@patch('api.index.get_access_token')
@patch('requests.post')
def test_analyze_image_success(mock_post, mock_get_access_token):
    # Mock the access token
    mock_get_access_token.return_value = "fake_access_token"

    # Mock the response from the Fatsecret API
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "food_response": [
            {
                "food_entry_name": "Pizza",
                "eaten": {
                    "total_nutritional_content": {
                        "calories": "270",
                        "protein": "11",
                        "fat": "10",
                        "carbohydrate": "30"
                    }
                }
            }
        ]
    }
    mock_post.return_value = mock_response

    # Create a dummy image file
    dummy_image = io.BytesIO(b"fake_image_data")
    dummy_image.name = "test.jpg"

    # Make the request to the API
    response = client.post(
        "/api/analyze",
        files={"image": ("test.jpg", dummy_image, "image/jpeg")}
    )

    # Assert the response
    assert response.status_code == 200
    assert response.json() == {
        "food_name": "Pizza",
        "calories": "270",
        "protein": "11",
        "fat": "10",
        "carbs": "30"
    }
