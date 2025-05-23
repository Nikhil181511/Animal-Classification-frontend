import React, { useState, useRef, useEffect } from 'react';
import './predict.css';
import Chatbot from "./Chatbot";

const Predict = () => {
    const [imagePreview, setImagePreview] = useState(null);
    const [confidence] = useState('');
    const [prediction, setPrediction] = useState('');
    const [error, setError] = useState('');
    const [useWebcam, setUseWebcam] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const videoElement = videoRef.current; // ✅ Capture ref locally

        const getCameraStream = async () => {
            try {
                const constraints = {
                    video: useWebcam
                        ? { facingMode: { ideal: "environment" } }
                        : false
                };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                if (videoElement) {
                    videoElement.srcObject = stream;
                    videoElement.play();
                }
            } catch (err) {
                console.error(err);
                setError('Error accessing webcam: ' + err.message);
            }
        };

        if (useWebcam) {
            getCameraStream();
        } else {
            if (videoElement && videoElement.srcObject) {
                const tracks = videoElement.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
                videoElement.srcObject = null;
            }
        }

        return () => {
            if (videoElement && videoElement.srcObject) {
                const tracks = videoElement.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
            }
        };
    }, [useWebcam]);


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target.result);
                setPrediction('');
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const captureFromWebcam = () => {
        if (!videoRef.current || !videoRef.current.srcObject) {
            setError('Webcam not available');
            return;
        }

        setIsLoading(true);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            setImagePreview(URL.createObjectURL(blob));
            handleSubmit(blob);
        }, 'image/jpeg');
    };

    const handleSubmit = async (imageBlob = null) => {
        setPrediction('');
        setError('');
        setIsLoading(true);

        const formData = new FormData();
        if (imageBlob) {
            formData.append('file', imageBlob, 'webcam.jpg');
        } else {
            if (!selectedFile) {
                setError('Please select an image file');
                setIsLoading(false);
                return;
            }
            formData.append('file', selectedFile);
        }

        try {
            const response = await fetch('https://animal-classification-backend.onrender.com/predict/', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                if (data.prediction && data.confidence) {
                    setPrediction(`${data.prediction} (Confidence: ${data.confidence})`);
                } else {
                    setError('No prediction returned. Please try again.');
                }
            } else {
                setError('Server error: Unable to get prediction.');
            }
        } catch (error) {
            setError('An error occurred: ' + (error.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabClick = (useWebcamValue) => {
        setPrediction('');
        setError('');
        setImagePreview(null);
        setSelectedFile(null);
        setUseWebcam(useWebcamValue);
    };

    return (
        <div>
            <div className="predict-container">
                <h2>Animal Classifier</h2>

                <div className="toggle-buttons">
                    <button
                        className={!useWebcam ? "active" : ""}
                        onClick={() => handleTabClick(false)}
                    >
                        <i className="fas fa-upload"></i> Upload Image
                    </button>
                    <button
                        className={useWebcam ? "active" : ""}
                        onClick={() => handleTabClick(true)}
                    >
                        <i className="fas fa-camera"></i> Use Webcam
                    </button>
                </div>

                {!useWebcam ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <label className="file-upload-label">
                            <div className="upload-icon">
                                <i className="fas fa-cloud-upload-alt"></i>
                            </div>
                            <div className="upload-text">
                                <p>Drop your animal image here</p>
                                <p className="upload-subtext">or click to browse files</p>
                            </div>
                            <input
                                type="file"
                                name="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </label>

                        {selectedFile && (
                            <input
                                type="submit"
                                value={isLoading ? "Processing..." : "Identify Animal"}
                                disabled={isLoading}
                            />
                        )}
                    </form>
                ) : (
                    <div className="webcam-container">
                        <video ref={videoRef} width="400" height="300" />
                        <canvas ref={canvasRef} width="400" height="300" style={{ display: 'none' }} />
                        <button
                            onClick={captureFromWebcam}
                            disabled={isLoading}
                        >
                            <i className="fas fa-camera"></i> {isLoading ? "Processing..." : "Capture & Identify"}
                        </button>
                    </div>
                )}

                {imagePreview && (
                    <div className="image-preview-container">
                        <img src={imagePreview} alt="Preview" className="image-preview" />
                    </div>
                )}

                {isLoading && (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>Analyzing image...</p>
                    </div>
                )}

                {prediction && (
                    <div className="prediction-result">
                        <i className="fas fa-paw"></i> Prediction: <span className="prediction-text">{prediction}</span>
                        {confidence && (
                            <div className="confidence-score">
                                <i className="fas fa-chart-line"></i> Confidence: <span>{confidence}</span>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="prediction-error">
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                )}
            </div>

            {/* Chatbot Component */}
            <Chatbot animalName={prediction} />
        </div>
    );
};

export default Predict;
