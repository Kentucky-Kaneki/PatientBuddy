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

const UploadReport = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadState, setUploadState] = useState("idle");
  const [progress, setProgress] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
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
        description: "Please upload a PDF or image file (JPEG, PNG, HEIC)",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadState("uploading");

    // Simulate upload
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 100));
      setProgress(i);
    }

    setUploadState("processing");
    setProgress(0);

    // Simulate processing
    for (let i = 0; i <= 100; i += 5) {
      await new Promise((r) => setTimeout(r, 100));
      setProgress(i);
    }

    setUploadState("complete");

    toast({
      title: "Report Analyzed!",
      description: "Your medical report has been successfully analyzed.",
    });

    setTimeout(() => {
      navigate("/report/1");
    }, 1500);
  };

  const removeFile = () => {
    setFile(null);
    setUploadState("idle");
    setProgress(0);
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) {
      return <Image className="w-6 h-6 text-primary" />;
    }
    return <File className="w-6 h-6 text-primary" />;
  };

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
                  className={`border-2 border-dashed rounded-2xl p-8 ${
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

            {(uploadState === "uploading" ||
              uploadState === "processing") && (
              <motion.div
                key="progress"
                className="p-8 text-center border rounded-2xl"
              >
                <Loader2 className="mx-auto animate-spin mb-4 text-primary" />
                <p className="mb-4">
                  {uploadState === "uploading"
                    ? "Uploading..."
                    : "Analyzing report..."}
                </p>
                <Progress value={progress} />
                <p className="mt-2 text-sm">{progress}%</p>
              </motion.div>
            )}

            {uploadState === "complete" && (
              <motion.div
                key="complete"
                className="p-8 text-center border rounded-2xl bg-success/10"
              >
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