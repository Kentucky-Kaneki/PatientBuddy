import { useState, useCallback } from "react";
import { ArrowLeft, Upload, FileText, X, CheckCircle, Loader2, Image, File, Heart } from "lucide-react";

// 🔧 CONFIG
const API_BASE = "http://localhost:5050/api";
const DEMO_PATIENT_ID = "507f1f77bcf86cd799439011";

const UploadReport = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadState, setUploadState] = useState("idle");
  const [progress, setProgress] = useState(0);

  /* ---------------------------------- ⚡ OPTIMIZED PDF EXTRACTION -----------------------------------*/
  const loadPdfJs = async () => {
    if (window.pdfjsLib) return window.pdfjsLib;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const extractTextFromPDF = async (file) => {
    const pdfjsLib = await loadPdfJs();
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    // ⚡ Process pages in parallel batches
    const batchSize = 5;
    const totalPages = pdf.numPages;
    let allText = [];
    
    for (let i = 1; i <= totalPages; i += batchSize) {
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, totalPages + 1); j++) {
        batch.push(
          pdf.getPage(j).then(page => 
            page.getTextContent().then(content =>
              content.items.map(item => item.str).join(" ")
            )
          )
        );
      }
      const batchResults = await Promise.all(batch);
      allText.push(...batchResults);
      setProgress(Math.floor((i / totalPages) * 30)); // 0-30%
    }
    
    return allText.join("\n");
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (selectedFile) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/heic"];
    if (!validTypes.includes(selectedFile.type)) {
      alert("Please upload a PDF or image file");
      return;
    }
    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setUploadState("idle");
    setProgress(0);
  };

  /* ---------------------------------- ⚡ OPTIMIZED UPLOAD PIPELINE -----------------------------------*/
  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploadState("uploading");
      setProgress(5);

      if (file.type !== "application/pdf") {
        alert("Image OCR coming soon. Please upload a PDF for now.");
        return;
      }

      // 1️⃣ ⚡ Extract text with parallel processing
      const extractedText = await extractTextFromPDF(file);
      
      if (!extractedText.trim()) throw new Error("No readable text found in PDF");

      setProgress(40);

      // 2️⃣ ⚡ Single optimized API call
      const uploadRes = await fetch(`${API_BASE}/reports/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: DEMO_PATIENT_ID,
          fullText: extractedText,
          fileName: file.name,
          autoSummarize: true, // Let backend handle summarization
        }),
      });

      setProgress(60);
      const uploadData = await uploadRes.json();
      
      if (!uploadData.success) throw new Error(uploadData.error);

      setProgress(80);
      setUploadState("processing");

      // 3️⃣ Fallback: If backend doesn't support autoSummarize
      if (!uploadData.summary) {
        const summaryRes = await fetch(
          `${API_BASE}/reports/${uploadData.reportId}/summarize`,
          { method: "POST" }
        );
        const summaryData = await summaryRes.json();
        if (!summaryData.success) throw new Error(summaryData.error);
      }

      setProgress(100);
      setUploadState("complete");

      // 4️⃣ ⚡ Quick redirect
      setTimeout(() => {
        window.location.href = `/report/${uploadData.reportId}`;
      }, 800);
      
    } catch (err) {
      console.error(err);
      alert(`Upload failed: ${err.message}`);
      setUploadState("idle");
      setProgress(0);
    }
  };

  /* ---------------------------------- UI -----------------------------------*/
  const getFileIcon = (type) =>
    type?.startsWith("image/") ? <Image className="w-6 h-6" /> : <File className="w-6 h-6" />;

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #e5e7eb", padding: "1rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem" }}>
          <a href="/dashboard" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.5rem", border: "none", background: "none", cursor: "pointer" }}>
              <ArrowLeft size={20} />
            </button>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart size={16} color="white" />
            </div>
            <span style={{ fontWeight: 600 }}>Upload Report</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "768px", margin: "0 auto", padding: "2rem 1rem" }}>
        {uploadState === "idle" && (
          <>
            <div
              style={{
                position: "relative",
                border: dragActive ? "2px dashed #3b82f6" : "2px dashed #d1d5db",
                borderRadius: "1rem",
                padding: "3rem",
                background: dragActive ? "rgba(59, 130, 246, 0.05)" : "transparent",
                transition: "all 0.2s"
              }}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                onChange={handleFileInput}
                accept=".pdf,.jpg,.jpeg,.png,.heic"
              />
              <div style={{ textAlign: "center", pointerEvents: "none" }}>
                <Upload size={32} style={{ margin: "0 auto 1rem", color: "#3b82f6" }} />
                <p style={{ fontWeight: 500, marginBottom: "0.5rem" }}>Drag & drop or click to upload</p>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>PDF, JPEG, PNG, HEIC</p>
              </div>
            </div>

            {file && (
              <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "0.75rem" }}>
                {getFileIcon(file.type)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={removeFile} style={{ padding: "0.5rem", border: "none", background: "none", cursor: "pointer" }}>
                  <X size={16} />
                </button>
              </div>
            )}

            {file && (
              <button
                onClick={handleUpload}
                style={{
                  width: "100%",
                  marginTop: "1.5rem",
                  padding: "0.75rem 1.5rem",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem"
                }}
              >
                <FileText size={16} />
                Analyze Report
              </button>
            )}
          </>
        )}

        {(uploadState === "uploading" || uploadState === "processing") && (
          <div style={{ padding: "3rem", textAlign: "center", border: "1px solid #e5e7eb", borderRadius: "1rem" }}>
            <Loader2 size={32} style={{ margin: "0 auto 1rem", animation: "spin 1s linear infinite", color: "#3b82f6" }} />
            <p style={{ marginBottom: "1rem", fontWeight: 500 }}>
              {uploadState === "uploading" ? "Extracting text..." : "Analyzing report..."}
            </p>
            <div style={{ width: "100%", height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden", marginBottom: "0.5rem" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "#3b82f6", transition: "width 0.3s" }} />
            </div>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{progress}%</p>
          </div>
        )}

        {uploadState === "complete" && (
          <div style={{ padding: "3rem", textAlign: "center", border: "1px solid #e5e7eb", borderRadius: "1rem", background: "rgba(34, 197, 94, 0.1)" }}>
            <CheckCircle size={48} style={{ margin: "0 auto 1rem", color: "#22c55e" }} />
            <p style={{ fontSize: "1.125rem", fontWeight: 500 }}>Analysis complete!</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>Redirecting…</p>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UploadReport;