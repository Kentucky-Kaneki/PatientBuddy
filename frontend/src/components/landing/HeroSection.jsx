import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  MessageCircle,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const floatingItems = [
  { icon: FileText, label: "Reports", delay: 0 },
  { icon: MessageCircle, label: "AI Chat", delay: 0.2 },
  { icon: Shield, label: "Secure", delay: 0.4 },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-24 pb-16 gradient-hero overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[80vh]">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Health Insights</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Understand Your{" "}
              <span className="text-primary">Medical Reports</span>{" "}
              In Simple Words
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Upload your medical reports and prescriptions. Get clear,
              easy-to-understand explanations in plain language. Ask questions
              anytime with our AI assistant.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to="/signup">
                <Button variant="hero" size="xl">
                  Start Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <a href="#how-it-works">
                <Button variant="outline" size="xl">
                  See How It Works
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-8 mt-10 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-success" />
                <span className="text-sm text-muted-foreground">
                  HIPAA Compliant
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  AI Powered
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-card rounded-3xl shadow-elevated p-6 lg:p-8">
              {/* Mock report card */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Blood Test Report
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Analyzed just now
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-sm font-medium text-success">
                        Normal Range
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      Hemoglobin: 14.2 g/dL
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-warning" />
                      <span className="text-sm font-medium text-warning">
                        Needs Attention
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      Vitamin D: 18 ng/mL (Low)
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-accent border border-border">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">AI Summary:</span> Your blood
                    work looks mostly good! Consider discussing Vitamin D
                    supplements with your doctor.
                  </p>
                </div>
              </div>

              {/* Floating badges */}
              {floatingItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + item.delay }}
                  className={`absolute ${
                    index === 0
                      ? "-top-4 -right-4"
                      : index === 1
                      ? "-bottom-4 -left-4"
                      : "top-1/2 -right-8"
                  }`}
                >
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-card shadow-elevated border border-border animate-float"
                    style={{ animationDelay: `${item.delay}s` }}
                  >
                    <item.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
