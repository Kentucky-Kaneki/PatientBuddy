import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl gradient-primary p-8 lg:p-16 text-center"
        >
          {/* Background decorations */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 border border-primary-foreground/30 rounded-full" />
            <div className="absolute bottom-10 right-10 w-48 h-48 border border-primary-foreground/20 rounded-full" />
            <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-primary-foreground/25 rounded-full" />
          </div>

          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
              Start Understanding Your Health Today
            </h2>

            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Join thousands of people who have taken control of their health journey.
              Upload your first report and see the difference clarity makes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button
                  size="xl"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Link to="/login">
                <Button
                  variant="outline"
                  size="xl"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  I Already Have an Account
                </Button>
              </Link>
            </div>

            <p className="text-sm text-primary-foreground/60 mt-6">
              No credit card required • Free tier available • Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
