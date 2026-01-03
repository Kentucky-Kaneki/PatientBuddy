import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Bot,
  Send,
  Printer,
  Download,
  Share2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API_BASE = "http://localhost:5050/api";

const ReportView = () => {
  const { id: reportId } = useParams();

  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState("");

  // QnA state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const chatEndRef = useRef(null);

  /* =============================
     FETCH SUMMARY ON LOAD
     ============================= */
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/reports/${reportId}/summarize`,
          { method: "POST" }
        );

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        setSummary(data.summary);
      } catch (err) {
        setError(err.message || "Failed to load summary");
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [reportId]);

  /* =============================
     AUTO SCROLL CHAT
     ============================= */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =============================
     HANDLE CHAT QUERY
     ============================= */
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;

    const userMessage = input;
    setMessages((m) => [...m, { role: "user", content: userMessage }]);
    setInput("");
    setChatLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/reports/${reportId}/query`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: userMessage,
            topK: 5,
          }),
        }
      );

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "❌ " + err.message,
          isError: true,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  /* =============================
     UI
     ============================= */
  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 border-b bg-background z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>

          <div className="flex gap-2">
            <Button variant="ghost" size="icon-sm"><Printer /></Button>
            <Button variant="ghost" size="icon-sm"><Download /></Button>
            <Button variant="ghost" size="icon-sm"><Share2 /></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* SUMMARY */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Report Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSummary && (
                <p className="text-muted-foreground">Analyzing report…</p>
              )}

              {error && (
                <div className="flex gap-2 text-danger">
                  <AlertCircle />
                  <p>{error}</p>
                </div>
              )}

              {!loadingSummary && !error && (
                <div className="max-w-none bg-muted p-6 rounded-lg text-sm whitespace-pre-wrap">
  <ReactMarkdown>
    {summary}
  </ReactMarkdown>
</div>

              )}
            </CardContent>
          </Card>

          {/* QnA CHAT */}
          <Card classname = "mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="text-primary" />
                Ask Questions About This Report
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="h-80 overflow-y-auto border rounded-lg p-4 bg-muted/40">
                {messages.length === 0 ? (
                  <p className="text-muted-foreground text-center mt-16">
                    Ask anything about your report.
                  </p>
                ) : (
                  messages.map((m, i) => (
                    <div
                      key={i}
                      className={`mb-3 flex ${
                        m.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          m.role === "user"
                            ? "bg-primary text-white"
                            : m.isError
                            ? "bg-danger/10 text-danger"
                            : "bg-background border"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question…"
                  className="flex-1 border rounded-lg px-3 py-2"
                  disabled={chatLoading}
                />
                <Button disabled={chatLoading || !input.trim()}>
                  <Send />
                </Button>
              </form>
            </CardContent>
          </Card>

        </motion.div>
      </main>
    </div>
  );
};

export default ReportView;
