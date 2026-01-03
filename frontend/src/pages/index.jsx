import { Link } from "react-router-dom";
import { Heart, FileText, Pill, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center space-y-6"
      >
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-foreground">
          Welcome to <span className="text-primary">MediClear</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-muted-foreground">
          Upload medical reports, understand prescriptions, and track your health —
          all explained in simple, human language.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link to="/dashboard">
            <Button variant="hero" size="lg" className="w-full sm:w-auto">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <Link to="/upload/report">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Upload Report
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-sm">
          <div className="p-4 rounded-xl border bg-card">
            <FileText className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="font-medium">Understand Reports</p>
          </div>
          <div className="p-4 rounded-xl border bg-card">
            <Pill className="w-5 h-5 mx-auto mb-2 text-success" />
            <p className="font-medium">Decode Prescriptions</p>
          </div>
          <div className="p-4 rounded-xl border bg-card">
            <MessageCircle className="w-5 h-5 mx-auto mb-2 text-info" />
            <p className="font-medium">Ask AI Questions</p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-muted-foreground pt-6">
          MediClear provides informational insights only. Always consult a healthcare professional.
        </p>
      </motion.div>
    </div>
  );
};

export default Index;