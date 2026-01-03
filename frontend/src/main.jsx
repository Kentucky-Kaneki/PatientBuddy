import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
// import './index.css'
// import App from './App.jsx'
import MedicalRAGClient from "./components/MedicalRAGClient";

createRoot(document.getElementById('root')).render(
    <MedicalRAGClient />
)