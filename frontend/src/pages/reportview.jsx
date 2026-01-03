import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Download,
  Share2,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Heart,
  Calendar,
  Printer,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const reportData = {
  title: "Complete Blood Count (CBC)",
  date: "December 28, 2024",
  lab: "HealthFirst Diagnostics",
  doctor: "Dr. Sarah Johnson",
  summary:
    "Your blood work looks mostly good! Most values are within normal range. However, your Vitamin D levels are below optimal and would benefit from supplementation. Your hemoglobin has improved since your last test.",
  values: [
    {
      name: "Hemoglobin",
      value: "14.2",
      unit: "g/dL",
      range: "12.0-16.0",
      status: "normal",
      explanation: "Hemoglobin carries oxygen in your blood.",
    },
    {
      name: "Vitamin D",
      value: "18",
      unit: "ng/mL",
      range: "30-100",
      status: "low",
      explanation:
        "Vitamin D is important for bones and immunity. Supplementation is recommended.",
    },
  ],
  recommendations: [
    "Discuss Vitamin D supplementation with your doctor",
    "Continue a heart-healthy lifestyle",
    "Retest Vitamin D levels in 3 months",
  ],
  dietSuggestions: [
    "Eat fatty fish and fortified milk",
    "Get 15–20 minutes of sunlight daily",
  ],
  faqs: [
    {
      question: "Why is my Vitamin D low?",
      answer:
        "Low Vitamin D is common and usually related to limited sunlight exposure.",
    },
  ],
};

const ReportView = () => {
  const [expandedValue, setExpandedValue] = useState(null);

  const getStatusIcon = (status) => {
    if (status === "normal")
      return <CheckCircle className="w-5 h-5 text-success" />;
    if (status === "low" || status === "high")
      return <AlertTriangle className="w-5 h-5 text-warning" />;
    if (status === "critical")
      return <AlertCircle className="w-5 h-5 text-danger" />;
    return <Info className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusBadge = (status) => {
    if (status === "normal")
      return (
        <Badge className="bg-success/10 text-success hover:bg-success/20">
          Normal
        </Badge>
      );
    if (status === "low")
      return (
        <Badge className="bg-warning/10 text-warning hover:bg-warning/20">
          Low
        </Badge>
      );
    if (status === "high")
      return (
        <Badge className="bg-warning/10 text-warning hover:bg-warning/20">
          High
        </Badge>
      );
    if (status === "critical")
      return (
        <Badge className="bg-danger/10 text-danger hover:bg-danger/20">
          Critical
        </Badge>
      );
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon-sm">
              <Printer />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <Download />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <Share2 />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Summary */}
          <Card>
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold">{reportData.title}</h1>
              <p className="text-sm text-muted-foreground mt-2">
                {reportData.summary}
              </p>
            </CardContent>
          </Card>

          {/* Values */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Tap a value to expand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportData.values.map((item) => (
                <div
                  key={item.name}
                  className="p-4 border rounded-xl cursor-pointer"
                  onClick={() =>
                    setExpandedValue(
                      expandedValue === item.name ? null : item.name
                    )
                  }
                >
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.range} {item.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <span className="font-semibold">{item.value}</span>
                      {getStatusBadge(item.status)}
                      {expandedValue === item.name ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      )}
                    </div>
                  </div>

                  {expandedValue === item.name && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {item.explanation}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default ReportView;