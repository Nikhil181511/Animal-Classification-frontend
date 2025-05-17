from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from PIL import Image
import torch
from torchvision import models, transforms
import io
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

# Set up Gemini API
GEMINI_KEY = "AIzaSyASuqtC0x-oMcRmmIDwY9h5_K-eDXnAoVI"
genai.configure(api_key=GEMINI_KEY)

# Gemini Pro model
modelchat = genai.GenerativeModel("gemini-1.5-flash")

# FastAPI app instance
app = FastAPI()

# CORS setup for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load ResNet model checkpoint
checkpoint = torch.load("animal_classifier.pth", map_location=device)

# Extract class names from the checkpoint
class_names = checkpoint["class_names"]

# Load model architecture (ResNet18) and replace the final layer
model = models.resnet18(weights=None)
model.fc = torch.nn.Linear(model.fc.in_features, len(class_names))
model.load_state_dict(checkpoint["model_state_dict"])
model.to(device)
model.eval()

# Image transformation pipeline
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# POST endpoint for predicting an animal from an image
@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        # Read and process the uploaded image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        img_tensor = transform(image).unsqueeze(0).to(device)

        # Get the model prediction
        with torch.no_grad():
            output = model(img_tensor)
            _, predicted = torch.max(output, 1)
            class_name = class_names[predicted.item()]

        # Return prediction result
        return JSONResponse({"prediction": class_name})

    except Exception as e:
        # Return error if something goes wrong
        return JSONResponse({"error": str(e)}, status_code=500)

# Function to format Gemini response into bullet points
def format_response_to_bullets(response_text):
    lines = response_text.split("\n")
    bullet_points = "\n".join([f"• {line.strip()}" for line in lines if line.strip()])
    return bullet_points

# Function to get detailed information about the animal from Gemini
def get_info_from_gemini(animal_name):
    try:
        response = modelchat.generate_content(f"Tell me about the animal {animal_name}")
        if response and hasattr(response, 'text'):
            formatted_response = format_response_to_bullets(response.text)
            return formatted_response
        else:
            return "No relevant information found."
    except Exception as e:
        return f"Error retrieving information: {str(e)}"

# POST endpoint for chatting and fetching animal details
@app.post("/chat")
async def chat(data: dict):
    user_message = data.get("text", "")
    predicted_animal = data.get("prediction", "")  # Include the predicted animal

    # Build the assistant's context
    context = (
        f"You are an expert animal assistant AI. The user is inquiring about animals. "
        f"The main animal in focus is: **{predicted_animal}**.\n"
        f"Provide detailed, helpful, and well-structured responses, especially about {predicted_animal}. "
        f"You also have knowledge about all other animals and should include comparative or related insights if relevant.\n\n"
        f"User's message: {user_message}\n\n"
        f"Reply in bullet points where appropriate, and keep the tone helpful and informative."
    )

    try:
        # Get Gemini's response
        response = modelchat.generate_content(context)
        # Limit the response to 5-6 lines
        response_lines = response.text.split("\n")
        limited_response = "\n".join(response_lines[:6])  # Only take the first 6 lines
        formatted_response = format_response_to_bullets(limited_response)
        return {"response": formatted_response}

    except Exception as e:
        # Return error if something goes wrong
        return {"response": f"Error: {str(e)}"}

