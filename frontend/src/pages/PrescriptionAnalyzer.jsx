import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  X,
  CheckCircle,
  Loader2,
  Image,
  File,
  Heart,
  Pill,
  Sun,
  Moon,
  Coffee,
  AlertTriangle,
  ChevronRight,
  Info,
} from "lucide-react";

const Button = ({ children, variant = "default", size = "default", className = "", onClick, disabled }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors";
  const variants = {
    default: "bg-gray-200 hover:bg-gray-300 text-gray-900",
    ghost: "hover:bg-gray-100",
    hero: "bg-primary hover:bg-primary/90 text-primary-foreground",
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
      className="bg-primary h-2 rounded-full transition-all"
      style={{ width: `${value}%` }}
    />
  </div>
);

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const MedicineCard = ({ medicine, onClick }) => {
  const getTimingIcons = (timing) => {
    const icons = {
      morning: <Sun className="w-4 h-4" />,
      afternoon: <Coffee className="w-4 h-4" />,
      evening: <Moon className="w-4 h-4" />,
    };
    return timing?.map((t, i) => (
      <span key={i} className="text-primary">
        {icons[t] || icons.morning}
      </span>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer bg-white"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">{medicine.medicine}</h3>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Dosage:</strong> {medicine.dosage || "As prescribed"}</p>
            <p><strong>Frequency:</strong> {medicine.frequency || "—"}</p>
            <p><strong>Duration:</strong> {medicine.duration || "—"}</p>
          </div>

          {medicine.timing && (
            <div className="flex gap-2 mt-3">
              {getTimingIcons(medicine.timing)}
            </div>
          )}
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </motion.div>
  );
};

const PrescriptionAnalyzer = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadState, setUploadState] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [ocrText, setOcrText] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [medicineInfo, setMedicineInfo] = useState("");
  const [infoLoading, setInfoLoading] = useState(false);

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
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      alert("Please upload an image file (JPEG, PNG)");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadState("uploading");
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(uploadInterval);
      setProgress(100);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      setOcrText(data.ocr_text || "");
      setMedicines(data.parsed_medicines || []);
      setUploadState("complete");

      setTimeout(() => {
        setUploadState("results");
      }, 1500);

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert(`Upload failed: ${err.message}`);
      setUploadState("idle");
      setProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadState("idle");
    setProgress(0);
  };

  const resetAnalysis = () => {
    setFile(null);
    setUploadState("idle");
    setProgress(0);
    setOcrText("");
    setMedicines([]);
    setSelectedMedicine(null);
  };

  const fetchMedicineInfo = async (medicineName) => {
    setInfoLoading(true);
    setMedicineInfo("");

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/medicine/${encodeURIComponent(medicineName)}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setMedicineInfo(data.info || "No information available");
    } catch (err) {
      console.error("Medicine info error:", err);
      setMedicineInfo(`Failed to load medicine information: ${err.message}`);
    } finally {
      setInfoLoading(false);
    }
  };

  const handleMedicineClick = (medicine) => {
    setSelectedMedicine(medicine);
    fetchMedicineInfo(medicine.medicine);
  };

  const getFileIcon = (type) => {
    if (type?.startsWith("image/")) {
      return <Image className="w-6 h-6 text-primary" />;
    }
    return <File className="w-6 h-6 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Prescription Analyzer</span>
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
                <h1 className="text-3xl font-bold mb-2">Upload Prescription</h1>
                <p className="text-gray-600">Upload an image to analyze and get detailed medicine information</p>
              </div>

              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 transition-all ${
                  dragActive ? "border-primary bg-primary/5" : "border-gray-300 bg-white"
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
                  accept="image/*"
                />

                <div className="text-center">
                  <Upload className="mx-auto mb-4 text-primary" size={48} />
                  <p className="text-xl font-medium mb-2">Drag & drop or click to upload</p>
                  <p className="text-gray-500">JPEG, PNG images supported</p>
                </div>
              </div>

              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center gap-4 p-4 border rounded-xl bg-white"
                >
                  {getFileIcon(file.type)}
                  <div className="flex-1">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button variant="ghost" onClick={removeFile}>
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
                  <Pill className="mr-2 w-5 h-5" />
                  Analyze Prescription
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
              <Loader2 className="mx-auto animate-spin mb-4 text-primary" size={48} />
              <p className="text-xl font-medium mb-4">
                {uploadState === "uploading"
                  ? "Uploading..."
                  : "Analyzing prescription..."}
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
            </motion.div>
          )}

          {/* Results State */}
          {uploadState === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Analysis Results</h2>
                <Button onClick={resetAnalysis}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  New Upload
                </Button>
              </div>



              {/* Medicines */}
              {medicines.length > 0 ? (
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-primary" />
                    Medicines Detected ({medicines.length})
                  </h3>
                  <div className="space-y-4">
                    {medicines.map((medicine, index) => (
                      <MedicineCard
                        key={index}
                        medicine={medicine}
                        onClick={() => handleMedicineClick(medicine)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-white border rounded-xl">
                  <AlertTriangle className="mx-auto mb-3 text-yellow-600" size={32} />
                  <p className="text-gray-600">No medicines detected in the prescription</p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  This tool is for educational purposes only and does not replace professional medical advice.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Medicine Detail Dialog */}
        <Dialog
          open={selectedMedicine !== null}
          onOpenChange={() => setSelectedMedicine(null)}
        >
          {selectedMedicine && (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Pill className="w-6 h-6 text-primary" />
                    {selectedMedicine.medicine}
                  </h2>
                  <p className="text-gray-600 mt-1">{selectedMedicine.dosage}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedMedicine(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Frequency</p>
                    <p className="font-medium">{selectedMedicine.frequency || "—"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{selectedMedicine.duration || "—"}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Medicine Information</h3>
                  {infoLoading ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading information...
                    </div>
                  ) : (
                    <p className="text-gray-700 whitespace-pre-line">{medicineInfo}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </Dialog>
      </main>
    </div>
  );
};

export default PrescriptionAnalyzer;