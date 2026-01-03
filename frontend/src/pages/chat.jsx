import { useState, useRef, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Mic,
  Bot,
  User,
  FileText,
  Pill,
  Sparkles,
  MoreVertical,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const suggestedQuestions = [
  "What does my Vitamin D level mean?",
  "When should I take my medicines?",
  "Can I take these medicines together?",
  "What foods should I avoid?",
];

const Chat = () => {
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('memberId');

  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your MediClear AI assistant. I can help you understand your medical reports and prescriptions. Feel free to ask me anything about your health documents!",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollAreaRef = useRef(null);
  const inputRef = useRef(null);
  const chatEndRef = useRef(null); // ✅ Add this ref

  /* =============================
     AUTO SCROLL CHAT
     ============================= */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5050/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "507f1f77bcf86cd799439011", // replace later with auth user
          message: userMessage.content,
        }),
      });

      const data = await res.json();
      
      console.log("Response:", data);

      if (!res.ok) {
        throw new Error(data.error || "Server error");
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: "error",
          role: "assistant",
          content: `Sorry, I couldn't respond right now. Error: ${err.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold">Health AI Assistant</h1>
              <p className="text-xs text-green-500">Online</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto py-6 space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {message.role === "assistant" ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="max-w-[85%]">
                  <div className="p-4 rounded-xl bg-card border">
                    <p className="text-sm whitespace-pre-line">
                      {message.content}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* ✅ Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="p-4 rounded-xl bg-card border">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </motion.div>
          )}

          {messages.length === 1 && (
            <div>
              <p className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4" /> Try asking:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedQuestion(q)}
                    className="px-4 py-2 rounded-full border hover:bg-muted transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ✅ Scroll anchor */}
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <div className="max-w-3xl mx-auto flex gap-3">

          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your reports..."
          />

          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
          >
            <Send />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;