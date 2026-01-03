// import React, { useState } from "react";

// function App() {
//   const [file, setFile] = useState(null);
//   const [ocrText, setOcrText] = useState("");
//   const [medicines, setMedicines] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [expandedIndex, setExpandedIndex] = useState(null);
//   const [medicineInfo, setMedicineInfo] = useState({});
//   const [infoLoading, setInfoLoading] = useState(false);

//   const uploadImage = async () => {
//     if (!file) {
//       alert("Please select an image first");
//       return;
//     }

//     setLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       console.log("Uploading to backend...");

//       const res = await fetch("http://127.0.0.1:8000/upload", {
//         method: "POST",
//         body: formData,
//       });

//       console.log("Response status:", res.status);

//       // ✅ Check if response is OK before parsing JSON
//       if (!res.ok) {
//         throw new Error(`HTTP error! status: ${res.status}`);
//       }

//       const data = await res.json();
//       console.log("Received data:", data);

//       setOcrText(data.ocr_text || "");
//       setMedicines(data.parsed_medicines || []);
//       setExpandedIndex(null);
//       setMedicineInfo({});
//     } catch (err) {
//       console.error("UPLOAD ERROR:", err);
//       alert(`Upload failed: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleMedicineInfo = async (index, medicineName) => {
//     if (expandedIndex === index) {
//       setExpandedIndex(null);
//       return;
//     }

//     setExpandedIndex(index);
//     setInfoLoading(true);

//     try {
//       console.log("Fetching info for:", medicineName);

//       const res = await fetch(
//         `http://127.0.0.1:8000/medicine/${encodeURIComponent(medicineName)}`
//       );

//       console.log("Medicine info response status:", res.status);

//       // ✅ Check if response is OK before parsing JSON
//       if (!res.ok) {
//         throw new Error(`HTTP error! status: ${res.status}`);
//       }

//       const data = await res.json();
//       console.log("Medicine info data:", data);

//       setMedicineInfo((prev) => ({
//         ...prev,
//         [index]: data.info,
//       }));
//     } catch (err) {
//       console.error("Medicine info error:", err);
//       setMedicineInfo((prev) => ({
//         ...prev,
//         [index]: `Failed to load medicine information: ${err.message}`,
//       }));
//     } finally {
//       setInfoLoading(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "#f4f6f8",
//         padding: "40px",
//         fontFamily: "Arial",
//       }}
//     >
//       <div
//         style={{
//           maxWidth: "900px",
//           margin: "auto",
//           background: "#fff",
//           padding: "30px",
//           borderRadius: "12px",
//           boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
//         }}
//       >
//         <h2>📸 Prescription Understanding System</h2>

//         {/* Upload */}
//         <div style={{ marginBottom: "20px" }}>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={(e) => setFile(e.target.files[0])}
//           />
//           <br /><br />
//           <button
//             onClick={uploadImage}
//             disabled={loading}
//             style={{
//               padding: "10px 20px",
//               background: loading ? "#9ca3af" : "#4f46e5",
//               color: "#fff",
//               border: "none",
//               borderRadius: "6px",
//               cursor: loading ? "not-allowed" : "pointer",
//             }}
//           >
//             {loading ? "Analyzing..." : "Upload & Analyze"}
//           </button>
//         </div>

//         {/* OCR Text */}
//         {ocrText && (
//           <>
//             <h3>📝 Raw OCR Text</h3>
//             <textarea
//               rows="6"
//               value={ocrText}
//               readOnly
//               style={{
//                 width: "100%",
//                 padding: "10px",
//                 borderRadius: "6px",
//                 border: "1px solid #ccc",
//                 marginBottom: "20px",
//               }}
//             />
//           </>
//         )}

//         {/* Medicines */}
//         {medicines.length > 0 && (
//           <>
//             <h3>💊 Medicines Detected</h3>

//             {medicines.map((med, index) => (
//               <div
//                 key={index}
//                 style={{
//                   border: "1px solid #e5e7eb",
//                   padding: "15px",
//                   borderRadius: "10px",
//                   marginBottom: "15px",
//                   background: "#f9fafb",
//                 }}
//               >
//                 <h4
//                   onClick={() =>
//                     toggleMedicineInfo(index, med.medicine)
//                   }
//                   style={{
//                     color: "#2563eb",
//                     cursor: "pointer",
//                     marginBottom: "6px",
//                   }}
//                 >
//                   {med.medicine}
//                 </h4>

//                 <p><strong>Dosage:</strong> {med.dosage || "—"}</p>
//                 <p><strong>Frequency:</strong> {med.frequency || "—"}</p>
//                 <p><strong>Duration:</strong> {med.duration || "—"}</p>

//                 {/* Animated Info Box */}
//                 {expandedIndex === index && (
//                   <div
//                     style={{
//                       marginTop: "12px",
//                       padding: "12px",
//                       background: "#eef2ff",
//                       borderLeft: "4px solid #4f46e5",
//                       borderRadius: "6px",
//                       animation: "fadeIn 0.3s ease-in-out",
//                     }}
//                   >
//                     {infoLoading ? (
//                       <p>Loading medicine information...</p>
//                     ) : (
//                       <p style={{ whiteSpace: "pre-line" }}>
//                         {medicineInfo[index]}
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </>
//         )}

//         {/* Disclaimer */}
//         <p style={{ marginTop: "30px", color: "#6b7280", fontSize: "14px" }}>
//           ⚠️ This tool is for educational purposes only and does not replace
//           professional medical advice.
//         </p>
//       </div>

//       {/* Animation */}
//       <style>
//         {`
//           @keyframes fadeIn {
//             from { opacity: 0; transform: translateY(-5px); }
//             to { opacity: 1; transform: translateY(0); }
//           }
//         `}
//       </style>
//     </div>
//   );
// }

// export default App;