import React, { useState, useRef, useEffect } from 'react';
import './predict.css';
// Make sure to add Font Awesome to your project:
// Either in public/index.html or by installing: npm install @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons

const Predict = () => {
    const [imagePreview, setImagePreview] = useState(null);
    const [prediction, setPrediction] = useState('');
    const [error, setError] = useState('');
    const [useWebcam, setUseWebcam] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (useWebcam) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                    }
                })
                .catch((err) => {
                    setError('Error accessing webcam: ' + err.message);
                });
        } else {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
                videoRef.current.srcObject = null;
            }
        }

        // Cleanup function to ensure camera is turned off when component unmounts
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
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
                // Reset prediction and error
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
            const response = await fetch('http://127.0.0.1:8000/predict/', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                if (data.prediction) {
                    setPrediction(`${data.prediction}`);
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
        // Clear previous results when switching tabs
        setPrediction('');
        setError('');
        setImagePreview(null);
        setSelectedFile(null);
        setUseWebcam(useWebcamValue);
    };

    return (
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
                </div>
            )}
            
            {error && (
                <div className="prediction-error">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </div>
            )}
        </div>
    );
};

export default Predict;