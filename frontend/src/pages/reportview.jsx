import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState("");

  // QnA state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [streamingMessageIndex, setStreamingMessageIndex] = useState(null);

  const chatEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  /* ============================= UTILITIES ============================= */
  const handlePrint = () => window.print();

  const handleDownload = () => {
    if (!summary) return;
    const element = document.createElement("a");
    const file = new Blob([summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `medical-report-summary-${reportId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  const handleShare = async () => {
    if (!summary) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Medical Report Summary',
          text: summary,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary).then(() => {
      alert('Summary copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  /* ============================= FETCH SUMMARY ============================= */
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/reports/${reportId}/summarize`,
          {
            method: "POST",
            headers: {
              "Accept-Language": i18n.language
            }
          }
        );

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error);
        }

        setSummary(data.summary);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load summary");
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [reportId, i18n.language]);

  /* ============================= AUTO SCROLL ============================= */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ============================= ⚡ OPTIMIZED STREAMING CHAT ============================= */
  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || chatLoading) return;

    const userMessage = input;
    const userMsgIndex = messages.length;
    const assistantMsgIndex = messages.length + 1;

    setMessages((m) => [...m, { role: "user", content: userMessage }]);
    setInput("");
    setChatLoading(true);
    setStreamingMessageIndex(assistantMsgIndex);

    // Add empty assistant message that will be updated
    setMessages((m) => [...m, { role: "assistant", content: "", streaming: true }]);

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // ⚡ Option 1: Server-Sent Events (SSE) - Best for streaming
      const res = await fetch(
        `${API_BASE}/reports/${reportId}/query/stream`, // New streaming endpoint
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: userMessage,
            topK: 5,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!res.ok) throw new Error('Network response was not ok');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.token) {
                accumulatedText += data.token;
                setMessages((m) => {
                  const newMessages = [...m];
                  newMessages[assistantMsgIndex] = {
                    role: "assistant",
                    content: accumulatedText,
                    streaming: true
                  };
                  return newMessages;
                });
              } else if (data.done) {
                setMessages((m) => {
                  const newMessages = [...m];
                  newMessages[assistantMsgIndex] = {
                    role: "assistant",
                    content: accumulatedText,
                    streaming: false
                  };
                  return newMessages;
                });
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }

      // ⚡ Fallback: If streaming endpoint doesn't exist, use regular endpoint
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

        setMessages((m) => {
          const newMessages = [...m];
          newMessages[assistantMsgIndex] = {
            role: "assistant",
            content: data.answer
          };
          return newMessages;
        });
      } catch (fallbackErr) {
        setMessages((m) => {
          const newMessages = [...m];
          newMessages[assistantMsgIndex] = {
            role: "assistant",
            content: "❌ " + (fallbackErr.message || "Failed to get response"),
            isError: true,
          };
          return newMessages;
        });
      }
    } finally {
      setChatLoading(false);
      setStreamingMessageIndex(null);
      abortControllerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /* ============================= UI ============================= */
  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 border-b bg-background z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={handlePrint}
              title={t('report.print')}
            >
              <Printer />
            </Button>
            <Button 
              variant="ghost" 
              size="icon-sm"
              onClick={handleDownload}
              disabled={!summary}
              title={t('report.download')}
            >
              <Download />
            </Button>
            <Button 
              variant="ghost" 
              size="icon-sm"
              onClick={handleShare}
              disabled={!summary}
              title={t('report.share')}
            >
              <Share2 />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
        >

          {/* SUMMARY */}
          <Card>
            <CardHeader>
              <CardTitle>{t('report.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSummary && (
                <div className="text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <p className="font-medium">{t('report.analyzing')}</p>
                  </div>
                  <p className="text-sm">{t('report.wait')}</p>
                </div>
              )}

              {error && (
                <div className="flex gap-2 text-destructive items-start">
                  <AlertCircle className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t('report.errorTitle')}</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {!loadingSummary && !error && summary && (
                <div className="max-w-none bg-muted p-6 rounded-lg text-sm whitespace-pre-wrap">
                  <ReactMarkdown>
                    {summary}
                  </ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QnA CHAT */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="text-primary" />
                {t('report.askQuestions')}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="h-80 overflow-y-auto border rounded-lg p-4 bg-muted/40">
                {messages.length === 0 ? (
                  <div className="text-center mt-16 space-y-2">
                    <Bot className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      {t('report.noMessages')}
                    </p>
                    <p className="text-xs text-muted-foreground/75">
                      {t('report.exampleQuestions')}
                    </p>
                  </div>
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
                            ? "bg-primary text-primary-foreground"
                            : m.isError
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : "bg-background border shadow-sm"
                        }`}
                      >
                        {m.content || "..."}
                        {m.streaming && (
                          <span className="inline-block ml-1 w-2 h-4 bg-primary animate-pulse" />
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                  placeholder={t('report.askPlaceholder')}
                  className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={chatLoading}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={chatLoading || !input.trim()}
                  className="px-4"
                >
                  {chatLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

        </motion.div>
      </main>
    </div>
  );
};

export default ReportView;