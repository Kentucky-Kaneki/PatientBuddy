import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is my medical information secure?",
    answer:
      "Absolutely. We use bank-level encryption (AES-256) to protect all your data. Your health information is stored in HIPAA-compliant data centers and is never shared with third parties. You have complete control over your data and can delete it at any time.",
  },
  {
    question: "Can MediClear diagnose my condition?",
    answer:
      "No. MediClear is designed to help you understand your medical reports and prescriptions in simple language, but it does not provide medical diagnoses, treatment recommendations, or replace professional medical advice. Always consult with your healthcare provider for medical decisions.",
  },
  {
    question: "What types of documents can I upload?",
    answer:
      "You can upload various medical documents including blood test reports, imaging reports (X-ray, MRI, CT scans), pathology reports, and handwritten or printed prescriptions. We support PDF files and common image formats (JPG, PNG, HEIC).",
  },
  {
    question: "How accurate is the AI interpretation?",
    answer:
      "Our AI is trained on millions of medical documents and provides highly accurate interpretations. However, we always recommend cross-referencing with your healthcare provider and using our platform as a supplementary tool for understanding, not as a primary source of medical guidance.",
  },
  {
    question: "Can I manage health records for my family members?",
    answer:
      "Yes! You can create separate profiles for each family member under your account. Each profile maintains its own health history, making it easy to manage and track health records for your entire family in one place.",
  },
  {
    question: "What languages are supported?",
    answer:
      "We currently support English, Spanish, Hindi, and several other languages. We're continuously adding more languages to make healthcare information accessible to everyone.",
  },
  {
    question: "How do I ask questions about my report?",
    answer:
      "After uploading and analyzing your document, you can use our AI chat feature to ask any questions. Simply type your question in plain language, and our AI will provide informational answers based on your specific report content.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! We offer a free tier that allows you to upload and analyze a limited number of reports each month. Premium plans offer unlimited uploads, advanced features, and priority support.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            FAQ
          </span>

          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about MediClear and how it can help you
            understand your health better.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-2xl px-6 data-[state=open]:shadow-soft"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>

                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
