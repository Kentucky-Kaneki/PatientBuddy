import { useState, useCallback } from "react";
import { useSearchParams } from 'react-router-dom';
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  FileText,
  X,
  CheckCircle,
  Loader2,
  Image,
  File,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// PDF worker
GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// 🔧 CONFIG
const API_BASE = "http://localhost:5050/api";
const DEMO_PATIENT_ID = "507f1f77bcf86cd799439011";

const UploadReport = () => {
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('memberId');
  
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadState, setUploadState] = useState("idle"); // idle | uploading | processing | complete
  const [progress, setProgress] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();

  /* ----------------------------------
     Helpers
  -----------------------------------*/

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }
    return text;
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/heic",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setUploadState("idle");
    setProgress(0);
  };

  const getFileIcon = (type) =>
    type.startsWith("image/")
      ? <Image className="w-6 h-6 text-primary" />
      : <File className="w-6 h-6 text-primary" />;

  /* ----------------------------------
     REAL UPLOAD + AI PIPELINE
  -----------------------------------*/

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploadState("uploading");
      setProgress(20);

      // 1️⃣ Extract text
      if (file.type !== "application/pdf") {
        toast({
          title: "Image OCR coming soon",
          description: "Please upload a PDF for now",
          variant: "destructive",
        });
        return;
      }

      const extractedText = await extractTextFromPDF(file);
      if (!extractedText.trim()) {
        throw new Error("No readable text found in PDF");
      }

      setUploadState("processing");
      setProgress(50);

      // 2️⃣ Upload report
      const uploadRes = await fetch(`${API_BASE}/reports/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: DEMO_PATIENT_ID,
          fullText: extractedText,
          fileName: file.name,
        }),
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        throw new Error(uploadData.error);
      }

      setProgress(75);

      // 3️⃣ Summarize
      const summaryRes = await fetch(
        `${API_BASE}/reports/${uploadData.reportId}/summarize`,
        { method: "POST" }
      );

      const summaryData = await summaryRes.json();
      if (!summaryData.success) {
        throw new Error(summaryData.error);
      }

      setProgress(100);
      setUploadState("complete");

      toast({
        title: "Report analyzed",
        description: "AI summary generated successfully",
      });

      // 4️⃣ Redirect
      setTimeout(() => {
        navigate(`/report/${uploadData.reportId}`);
      }, 1200);

    } catch (err) {
      console.error(err);
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
      setUploadState("idle");
      setProgress(0);
    }
  };

  /* ----------------------------------
     UI
  -----------------------------------*/

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Upload Medical Report</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <AnimatePresence mode="wait">

            {uploadState === "idle" && (
              <motion.div key="idle">
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-8 ${
                    dragActive ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileInput}
                    accept=".pdf,.jpg,.jpeg,.png,.heic"
                  />

                  <div className="text-center">
                    <Upload className="mx-auto mb-4 text-primary" size={32} />
                    <p className="font-medium">Drag & drop or click to upload</p>
                    <p className="text-sm text-muted-foreground">
                      PDF, JPEG, PNG, HEIC
                    </p>
                  </div>
                </div>

                {file && (
                  <div className="mt-4 flex items-center gap-4 p-4 border rounded-xl">
                    {getFileIcon(file.type)}
                    <div className="flex-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button size="icon-sm" variant="ghost" onClick={removeFile}>
                      <X />
                    </Button>
                  </div>
                )}

                {file && (
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full mt-6"
                    onClick={handleUpload}
                  >
                    <FileText className="mr-2" />
                    Analyze Report
                  </Button>
                )}
              </motion.div>
            )}

            {(uploadState === "uploading" || uploadState === "processing") && (
              <motion.div key="progress" className="p-8 text-center border rounded-2xl">
                <Loader2 className="mx-auto animate-spin mb-4 text-primary" />
                <p className="mb-4">
                  {uploadState === "uploading" ? "Uploading..." : "Analyzing report..."}
                </p>
                <Progress value={progress} />
                <p className="mt-2 text-sm">{progress}%</p>
              </motion.div>
            )}

            {uploadState === "complete" && (
              <motion.div key="complete" className="p-8 text-center border rounded-2xl bg-success/10">
                <CheckCircle className="mx-auto text-success mb-4" size={32} />
                <p>Analysis complete. Redirecting…</p>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default UploadReport;
