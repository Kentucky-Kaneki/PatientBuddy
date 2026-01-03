import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import PrescriptionReader from "./components/PrescriptionReader.jsx";
// import './index.css'
// import App from './App.jsx'
import MedicalRAGClient from "./Components/MedicalRAGClient";

createRoot(document.getElementById('root')).render(
    <PrescriptionReader />
)