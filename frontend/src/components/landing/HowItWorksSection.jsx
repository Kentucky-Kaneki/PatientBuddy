import { motion } from "framer-motion";
import { Upload, Cpu, FileCheck, MessageCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Document",
    description:
      "Simply upload a photo or PDF of your medical report or prescription. We support all common formats.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Analysis",
    description:
      "Our advanced AI scans and analyzes your document, extracting key information and interpreting medical terms.",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Get Clear Results",
    description:
      "Receive a beautifully organized summary with highlighted values, explanations, and actionable insights.",
  },
  {
    number: "04",
    icon: MessageCircle,
    title: "Ask Questions",
    description:
      "Use our AI chat to ask follow-up questions about anything in your report. Get answers in plain language.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            How It Works
          </span>

          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            From Upload to Understanding in Minutes
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our streamlined process makes it easy to understand your medical
            documents without the confusion of complex medical terminology.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-card rounded-2xl p-6 border border-border relative z-10 h-full">
                  {/* Step number */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl font-bold text-primary/20">
                      {step.number}
                    </span>

                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>

                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Connector dot - desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-4 rounded-full bg-primary z-20 -translate-y-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
