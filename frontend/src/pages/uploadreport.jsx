import { useState, useCallback } from "react";
import { ArrowLeft, Upload, FileText, X, CheckCircle, Loader2, Image, File, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 🔧 CONFIG
const API_BASE = "http://localhost:5050/api";
const DEMO_PATIENT_ID = "507f1f77bcf86cd799439011";

const Button = ({ children, variant = "default", size = "default", className = "", onClick, disabled }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors";
  const variants = {
    default: "bg-gray-200 hover:bg-gray-300 text-gray-900",
    ghost: "hover:bg-gray-100",
    hero: "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30",
  };
  const sizes = {
    default: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
    icon: "p-2",
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Progress = ({ value }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all"
      style={{ width: `${value}%` }}
    />
  </div>
);

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
          autoSummarize: true,
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
      }, 1500);
      
    } catch (err) {
      console.error(err);
      alert(`Upload failed: ${err.message}`);
      setUploadState("idle");
      setProgress(0);
    }
  };

  const getFileIcon = (type) =>
    type?.startsWith("image/") ? <Image className="w-6 h-6 text-teal-500" /> : <File className="w-6 h-6 text-teal-500" />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <a href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </a>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Upload Report</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <AnimatePresence mode="wait">
          {/* Upload State */}
          {uploadState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Upload Medical Report</h1>
                <p className="text-gray-600">Upload your report to analyze and get detailed insights</p>
              </div>

              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 transition-all ${
                  dragActive ? "border-teal-500 bg-teal-50" : "border-gray-300 bg-white"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileInput}
                  accept=".pdf,.jpg,.jpeg,.png,.heic"
                />

                <div className="text-center pointer-events-none">
                  <Upload className="mx-auto mb-4 text-teal-500" size={48} />
                  <p className="text-xl font-medium mb-2">Drag & drop or click to upload</p>
                  <p className="text-gray-500">PDF, JPEG, PNG, HEIC supported</p>
                </div>
              </div>

              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center gap-4 p-4 border rounded-xl bg-white"
                >
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={removeFile}>
                    <X className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}

              {file && (
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full mt-6"
                  onClick={handleUpload}
                >
                  <FileText className="mr-2 w-5 h-5" />
                  Analyze Report
                </Button>
              )}
            </motion.div>
          )}

          {/* Uploading/Processing State */}
          {(uploadState === "uploading" || uploadState === "processing") && (
            <motion.div
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center border rounded-2xl bg-white"
            >
              <Loader2 className="mx-auto animate-spin mb-4 text-teal-500" size={48} />
              <p className="text-xl font-medium mb-4">
                {uploadState === "uploading"
                  ? "Extracting text..."
                  : "Analyzing report..."}
              </p>
              <Progress value={progress} />
              <p className="mt-2 text-gray-600">{progress}%</p>
            </motion.div>
          )}

          {/* Complete State */}
          {uploadState === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center border rounded-2xl bg-green-50"
            >
              <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
              <p className="text-xl font-medium">Analysis complete!</p>
              <p className="text-sm text-gray-600 mt-2">Redirecting...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default UploadReport;