// MedicalRAGClient.jsx

import React, { useState, useEffect, useRef } from "react";
import { Upload, FileText, Bot, Send, Trash2, AlertCircle } from "lucide-react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";


GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function MedicalRAGClient () {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [patient, setPatient] = useState(null);
  const [currentReport, setCurrentReport] = useState(null);
  const [reports, setReports] = useState([]);

  const [summary, setSummary] = useState("");

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const chatEndRef = useRef(null);
  const API_BASE = "http://localhost:5000/api";

  const GROQ_API_KEY = "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" // Replace with your actual GROQ API key

  useEffect(() => {
    const mockPatient = {
      _id: "507f1f77bcf86cd799439011",
      name: "Demo Patient",
      email: "demo@example.com",
    };
    setPatient(mockPatient);
    loadReports(mockPatient._id);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const loadReports = async (patientId) => {
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/reports`);
      const data = await res.json();
      if (data.success) setReports(data.reports);
    } catch (err) {
      console.error("Load reports error:", err);
    }
  };

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

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setFileName(selected?.name || "");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleUpload = async () => {
    if (!file) return setErrorMsg("Please select a PDF file.");

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setSummary("");
    setCurrentReport(null);
    setChatMessages([]);

    try {
      setSuccessMsg("📄 Extracting text from PDF...");
      const fullText = await extractTextFromPDF(file);

      if (!fullText.trim()) {
        throw new Error("No text extracted from PDF");
      }

      setSuccessMsg("🔄 Uploading & processing...");
      const res = await fetch(`${API_BASE}/reports/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient._id,
          fullText,
          fileName,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setCurrentReport(data);
      setSuccessMsg("🤖 Generating summary...");

      const summaryRes = await fetch(
        `${API_BASE}/reports/${data.reportId}/summarize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groqApiKey: GROQ_API_KEY }),
        }
      );

      const summaryData = await summaryRes.json();
      if (summaryData.success) {
        setSummary(summaryData.summary);
        setSuccessMsg("✅ Report analyzed successfully!");
        setShowChat(true);
      } else {
        throw new Error(summaryData.error);
      }

      loadReports(patient._id);
    } catch (err) {
      console.error(err);
      setErrorMsg("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || !currentReport || chatLoading) return;

    const userMsg = { role: "user", content: chatInput };
    setChatMessages((p) => [...p, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const reportId = currentReport.reportId || currentReport._id;

      const res = await fetch(`${API_BASE}/reports/${reportId}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg.content, topK: 5 }),
      });

      const data = await res.json();

      if (!data.success) {
        // Handle rate limiting specifically
        if (res.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a few seconds and try again.");
        }
        throw new Error(data.error || "Query failed");
      }

      const assistantMsg = {
        role: "assistant",
        content: data.answer,
        sources: data.sources || [],
      };

      setChatMessages((p) => [...p, assistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorContent = err.message.includes("Rate limit") 
        ? "⏳ " + err.message 
        : "❌ Error: " + err.message;
      
      setChatMessages((p) => [
        ...p,
        { role: "assistant", content: errorContent, isError: true },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-2 text-indigo-900">
          🏥 Medical RAG System
        </h1>
        <p className="text-center text-gray-600 mb-8">
          AI-Powered Medical Report Analysis
        </p>

        {/* Upload Section */}
        <div className="bg-white p-8 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-6 h-6 text-indigo-600" />
            Upload Medical Report
          </h2>
          
          <div className="flex flex-col gap-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload & Analyze
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="text-green-700">{successMsg}</p>
            </div>
          )}
        </div>

        {/* Summary Section */}
        {summary && (
          <div className="bg-white p-8 rounded-lg shadow-lg mb-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              Medical Report Summary
            </h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 font-sans bg-gray-50 p-4 rounded">
                {summary}
              </pre>
            </div>
          </div>
        )}

        {/* Chat Section */}
        {showChat && currentReport && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-indigo-600 text-white p-4 flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Ask Questions About the Report</h2>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 bg-gray-50">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Ask me anything about the medical report!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white"
                            : msg.isError
                            ? "bg-red-50 border border-red-200 text-red-700"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="border-t p-4 bg-white">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="Ask a question about the report..."
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRAGClient;