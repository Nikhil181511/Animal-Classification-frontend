#🐾 Animal Image Classification with ResNet18

This project is a deep learning-based image classification system that can recognize and categorize 19 different animal classes using a fine-tuned **ResNet18** model in PyTorch.

## 📌 Project Overview

The goal of this project is to build a reliable image classifier that can accurately identify animals from images across 19 different categories.

### Supported Animal Classes:
- Bear  
- Bird  
- Cat  
- Cow  
- Deer  
- Dog  
- Elephant  
- Fish  
- Giraffe  
- Horse  
- Human  
- Insects  
- Kangaroo  
- Lion  
- Panda  
- Reptile  
- Sheep  
- Tiger  
- Zebra  

## 🧠 Model

- **Architecture**: ResNet18 (pretrained on ImageNet)
- **Framework**: PyTorch
- **Transfer Learning**: Last fully connected layer modified to match 19 classes
- **Loss Function**: CrossEntropyLoss
- **Optimizer**: Adam

## 🗂️ Dataset Structure

The dataset is organized in `ImageFolder` format:

```

DataSet/
├── train/
│    ├── Bear/
│    ├── Cat/
│    └── ...
└── val/
├── Bear/
├── Cat/
└── ...

````

## ⚙️ How to Train

```bash
python main.py
````

This will:

* Load the dataset from `DataSet/train` and `DataSet/val`
* Train the model for 5 epochs
* Save the trained model as `animal_classifier.pth`
* Save class names to `classes.txt`

## 🖼️ How to Predict

Use the saved model to classify new animal images. A `Predict.js` component is provided for frontend usage (React-based UI).

## 🔍 Example Prediction

Upload an image of an animal, and the system will return the predicted class name (e.g., `"Prediction: Elephant"`).

## 🧪 Accuracy & Performance

* **Model**: ResNet18 (fine-tuned)
* **Input Size**: 224x224
* **Expected Accuracy**: \~85–95% depending on data quality and class balance

## 🚀 Deployment

* Backend: FastAPI
* Frontend: React
* Model: `animal_classifier.pth` loaded for inference
* You can deploy this project using:

  * **GitHub + Render (for FastAPI)**
  * **Vercel/(for frontend)**

## 📁 Files

* `main.py`: Training script
* `animal_classifier.pth`: Trained model weights
* `classes.txt`: List of 19 class labels
* `src/`: Frontend UI files

  * `Predict.js`
  * `predict.css`
  * `Chatbot.js`
  * `Chatbot.css`

---

## 👨‍💻 Author

**Nikhil Savita**
📧 [nikhilsavita186@gmail.com](mailto:nikhilsavita186@gmail.com)
🔗 [GitHub](https://github.com/Nikhil181511)

