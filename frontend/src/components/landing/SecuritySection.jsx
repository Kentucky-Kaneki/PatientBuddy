import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Server,
  Eye,
  FileCheck,
  AlertTriangle,
} from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description:
      "All your data is encrypted in transit and at rest using industry-standard AES-256 encryption.",
  },
  {
    icon: Server,
    title: "Secure Cloud Storage",
    description:
      "Your documents are stored in SOC 2 compliant data centers with 99.9% uptime guarantee.",
  },
  {
    icon: Eye,
    title: "Privacy First",
    description:
      "We never share your health data with third parties. Your information stays private, always.",
  },
  {
    icon: FileCheck,
    title: "HIPAA Compliant",
    description:
      "Our platform meets all HIPAA requirements for handling protected health information.",
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-success/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
              Security & Trust
            </span>

            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Your Health Data is Safe With Us
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              We understand that medical information is sensitive. That's why
              we've built our platform with security as the foundation, not an
              afterthought.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-success" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-card rounded-3xl p-8 border border-border shadow-elevated">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary mx-auto mb-6">
                <Shield className="w-10 h-10 text-primary-foreground" />
              </div>

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Medical Disclaimer
                </h3>
                <p className="text-muted-foreground">
                  MediClear provides informational content only and does not
                  offer medical advice, diagnoses, or treatment recommendations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Always Consult Your Doctor
                    </p>
                    <p className="text-sm text-muted-foreground">
                      The information provided by this platform should not
                      replace professional medical advice. Always consult with
                      qualified healthcare providers for medical decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
