import React, { useState } from "react";

function PrescriptionReader() {
  const [file, setFile] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  const [expandedIndex, setExpandedIndex] = useState(null);
  const [medicineInfo, setMedicineInfo] = useState({});
  const [infoLoading, setInfoLoading] = useState(false);

  const uploadImage = async () => {
    if (!file) {
      alert("Please select an image first");
      return;
    }

    setLoading(true);

    try {
      console.log("Selected file:", file);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      console.log(res);
      
        
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      setOcrText(data.extracted_text || data.ocr_text || "");
      setMedicines(data.parsed_medicines || []);
      setExpandedIndex(null);
      setMedicineInfo({});
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMedicineInfo = async (index, medicineName) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
      setMedicineInfo((prev) => {
        const newInfo = { ...prev };
        delete newInfo[index];
        return newInfo;
      });
      return;
    }

    setExpandedIndex(index);
    setInfoLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8000/medicine/${encodeURIComponent(medicineName)}`
      );

      
      if (!res.ok) {
        throw new Error(`Medicine info fetch failed: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (!data.info) {
        throw new Error("No medicine information returned");
      }

      setMedicineInfo((prev) => ({
        ...prev,
        [index]: data.info,
      }));
    } catch (err) {
      console.error("MEDICINE INFO ERROR:", err);
      setMedicineInfo((prev) => ({
        ...prev,
        [index]: `Failed to load medicine information: ${err.message}`,
      }));
    } finally {
      setInfoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-10 font-sans">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          📸 Prescription Understanding System
        </h2>

        {/* Upload Section */}
        <div className="mb-8">
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-4 p-2 border border-gray-300 rounded-lg w-full max-w-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={loading}
          />
          <br />
          <button
            onClick={uploadImage}
            disabled={loading}
            className={`px-6 py-3 text-white font-medium text-lg rounded-xl transition-all duration-200 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transform"
            }`}
          >
            {loading ? "🔄 Analyzing Prescription..." : "📤 Upload & Analyze"}
          </button>
        </div>

        {/* Raw OCR Text */}
        {ocrText && (
          <>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              📝 Extracted Text
            </h3>
            <textarea
              rows="8"
              value={ocrText}
              readOnly
              className="w-full p-4 rounded-xl border border-gray-300 bg-gray-50 text-sm font-mono resize-vertical mb-6 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </>
        )}

        {/* Parsed Medicines */}
        {medicines.length > 0 && (
          <>
            <h3 className="text-xl font-semibold text-gray-700 mb-6">
              💊 Medicines Detected ({medicines.length})
            </h3>

            {medicines.map((med, index) => (
              <div
                key={`${med.medicine}-${index}`} // Fixed unique key
                className="border border-gray-200 p-6 rounded-2xl mb-6 bg-gray-50 hover:shadow-md transition-all duration-200 hover:bg-white"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    toggleMedicineInfo(index, med.medicine);
                  }
                }}
              >
                <h4
                  onClick={() => toggleMedicineInfo(index, med.medicine)}
                  className="text-indigo-600 cursor-pointer mb-4 text-xl font-semibold flex items-center gap-2 hover:text-indigo-700 transition-colors"
                >
                  💊 {med.medicine}
                  <span className="text-xs text-gray-500 font-normal">
                    click for details
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                  <p>
                    <strong className="text-gray-800">📏 Dosage:</strong>{" "}
                    {med.dosage || "—"}
                  </p>
                  <p>
                    <strong className="text-gray-800">⏰ Frequency:</strong>{" "}
                    {med.frequency || "—"}
                  </p>
                  <p>
                    <strong className="text-gray-800">📅 Duration:</strong>{" "}
                    {med.duration || "—"}
                  </p>
                </div>

                {/* Medicine Information Panel */}
                {expandedIndex === index && (
                  <div className="mt-4 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-lg animate-fadeIn">
                    {infoLoading ? (
                      <div className="flex items-center gap-3 text-gray-500">
                        <div className="w-4 h-4 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
                        Loading medicine information...
                      </div>
                    ) : (
                      <div className="whitespace-pre-line leading-relaxed text-gray-800 text-sm">
                        {medicineInfo[index] || "No additional information available."}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Disclaimer */}
        <div className="mt-10 p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
          <strong className="block mb-2">⚠️ Important Notice:</strong>
          This tool is for educational purposes only and does not replace professional medical
          advice. Always consult your healthcare provider.
        </div>
      </div>
    </div>
  );
}

export default PrescriptionReader;
