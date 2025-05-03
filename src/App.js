import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Prediction from "./Predict"; 

function App() {
    return (
        <Router>
            <Routes>
                {/* Main route for BarcodeScanner */}
                <Route path="/" element={<Prediction />} />

                {/* Fallback for Undefined Routes */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
