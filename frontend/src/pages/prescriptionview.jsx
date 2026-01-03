import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Pill,
  Download,
  Share2,
  MessageCircle,
  AlertTriangle,
  Clock,
  Coffee,
  Wine,
  Sun,
  Moon,
  ChevronRight,
  Heart,
  Calendar,
  User,
  Info,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const prescriptionData = {
  doctor: "Dr. Michael Chen",
  date: "December 25, 2024",
  clinic: "Family Health Center",
  diagnosis: "Upper Respiratory Infection",
  medicines: [
    {
      id: 1,
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: "3 times daily",
      duration: "7 days",
      timing: ["morning", "afternoon", "evening"],
      withFood: true,
      description:
        "Amoxicillin is an antibiotic that fights bacteria in your body.",
      usage:
        "Used to treat bacterial infections including respiratory infections.",
      howItWorks:
        "Stops the growth of bacteria by interfering with cell wall formation.",
      sideEffects: ["Nausea", "Diarrhea", "Skin rash"],
      warnings: ["Complete the full course", "Tell your doctor about kidney issues"],
      foodInteractions:
        "Can be taken with or without food. Food may reduce stomach upset.",
      alcoholWarning:
        "Avoid alcohol as it may increase side effects.",
    },
  ],
};

const MedicineCard = ({ medicine, onClick }) => {
  const getTimingIcons = (timing) => {
    const icons = {
      morning: <Sun className="w-4 h-4 text-warning" />,
      afternoon: <Sun className="w-4 h-4 text-warning" />,
      evening: <Moon className="w-4 h-4 text-info" />,
      "as-needed": <Clock className="w-4 h-4 text-muted-foreground" />,
    };
    return timing.map((t, i) => <span key={i}>{icons[t]}</span>);
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} onClick={onClick}>
      <Card className="cursor-pointer hover:border-primary/30 transition">
        <CardContent className="p-5">
          <div className="flex justify-between mb-4">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Pill className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{medicine.name}</h3>
                <p className="text-sm text-primary">{medicine.dosage}</p>
              </div>
            </div>
            <ChevronRight className="text-muted-foreground" />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-1">{getTimingIcons(medicine.timing)}</div>
            {medicine.withFood && (
              <Badge variant="outline">
                <Coffee className="w-3 h-3 mr-1" />
                With food
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const PrescriptionView = () => {
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background">
        <div className="container mx-auto p-4 flex justify-between">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Download />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">
          Prescribed Medicines ({prescriptionData.medicines.length})
        </h2>

        <div className="space-y-4">
          {prescriptionData.medicines.map((m) => (
            <MedicineCard
              key={m.id}
              medicine={m}
              onClick={() => setSelectedMedicine(m)}
            />
          ))}
        </div>
      </main>

      {/* Modal */}
      <Dialog open={!!selectedMedicine} onOpenChange={() => setSelectedMedicine(null)}>
        <DialogContent>
          {selectedMedicine && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMedicine.name}</DialogTitle>
                <DialogDescription>{selectedMedicine.dosage}</DialogDescription>
              </DialogHeader>

              <p className="text-sm">{selectedMedicine.description}</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrescriptionView;