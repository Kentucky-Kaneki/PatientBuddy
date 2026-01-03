import { useState, useCallback } from "react";
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

GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const API_BASE = "http://localhost:5050/api";

const UploadReport = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadState, setUploadState] = useState("idle");
  const [progress, setProgress] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();

  // 🔹 TEMP patient (same as MedicalRAGClient)
  const patientId = "507f1f77bcf86cd799439011";

  // ---------- Helpers ----------
  const extractTextFromPDF = async (file) => {
    const buffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: buffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((i) => i.str).join(" ") + "\n";
    }
    return text;
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
        description: "Upload a PDF or image",
        variant: "destructive",
      });
      return;
    }
    setFile(selectedFile);
  };

  // ---------- REAL UPLOAD ----------
  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploadState("processing");
      setProgress(20);

      const fullText = await extractTextFromPDF(file);
      if (!fullText.trim()) throw new Error("No text found in document");

      setProgress(50);

      // 🔹 Upload report
      const uploadRes = await fetch(`${API_BASE}/reports/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          fullText,
          fileName: file.name,
        }),
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error(uploadData.error);

      setProgress(75);

      // 🔹 Generate summary
      await fetch(
        `${API_BASE}/reports/${uploadData.reportId}/summarize`,
        { method: "POST" }
      );

      setProgress(100);
      setUploadState("complete");

      toast({
        title: "Report analyzed",
        description: "Redirecting to results…",
      });

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

  const removeFile = () => {
    setFile(null);
    setUploadState("idle");
    setProgress(0);
  };

  const getFileIcon = (type) =>
    type.startsWith("image/")
      ? <Image className="w-6 h-6 text-primary" />
      : <File className="w-6 h-6 text-primary" />;

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
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
              <>
                <div className="border-2 border-dashed rounded-2xl p-8 text-center">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleFile(e.target.files[0])}
                    accept=".pdf,.jpg,.jpeg,.png,.heic"
                  />
                  <Upload className="mx-auto mb-4 text-primary" size={32} />
                  <p className="font-medium">Click to upload</p>
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
              </>
            )}

            {uploadState === "processing" && (
              <div className="p-8 text-center border rounded-2xl">
                <Loader2 className="mx-auto animate-spin mb-4 text-primary" />
                <Progress value={progress} />
                <p className="mt-2 text-sm">{progress}%</p>
              </div>
            )}

            {uploadState === "complete" && (
              <div className="p-8 text-center border rounded-2xl bg-success/10">
                <CheckCircle className="mx-auto text-success mb-4" size={32} />
                <p>Analysis complete</p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default UploadReport;
