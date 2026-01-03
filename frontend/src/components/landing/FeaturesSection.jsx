import { motion } from "framer-motion";
import {
  FileSearch,
  Pill,
  MessageCircle,
  History,
  Users,
  Globe,
  Shield,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Smart Report Analysis",
    description:
      "Upload any medical report and get a clear, structured breakdown with highlighted important values and what they mean for you.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Pill,
    title: "Prescription Clarity",
    description:
      "Convert hard-to-read prescriptions into clear medicine cards with dosage, timing, and easy-to-understand drug information.",
    color: "bg-success/10 text-success",
  },
  {
    icon: MessageCircle,
    title: "AI Health Assistant",
    description:
      "Ask questions about your reports or medicines anytime. Get helpful, informational answers in simple language.",
    color: "bg-info/10 text-info",
  },
  {
    icon: History,
    title: "Health Timeline",
    description:
      "Track your health over time. See trends, compare reports, and visualize improvements in your health journey.",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: Users,
    title: "Family Profiles",
    description:
      "Manage health records for your entire family. Separate profiles keep everyone's medical history organized.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description:
      "Access reports and AI explanations in your preferred language. Making healthcare accessible to everyone.",
    color: "bg-success/10 text-success",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description:
      "Your health data is encrypted and protected with the same security standards used by major healthcare providers.",
    color: "bg-info/10 text-info",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Get alerts when your reports are ready, reminders for follow-ups, and important health insights delivered to you.",
    color: "bg-warning/10 text-warning",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>

          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Understand Your Health
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From decoding complex medical jargon to tracking your health journey,
            we've got you covered with powerful, easy-to-use tools.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 card-hover"
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>

              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
