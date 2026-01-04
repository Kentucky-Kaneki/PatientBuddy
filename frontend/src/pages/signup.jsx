import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";


const Signup = () => {
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const { toast } = useToast();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptTerms) {
      toast({
        title: t("signup.toast.termsTitle"),
description: t("signup.toast.termsDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {      
      const response = await fetch("http://localhost:5050/api/patient/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const data = await response.json();
    
        // Store token
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        toast({
          title: t("signup.toast.successTitle"),
description: t("signup.toast.successDesc"),

        });
        
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
        });

        // Navigate to dashboard
        window.location.href = "/dashboard";
      } else {
        toast({
          title: t("signup.toast.failedTitle"),
description: data.message || t("signup.toast.failedDesc"),

          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-3xl shadow-elevated p-8 border border-border">
          <div className="flex justify-end mb-4">
  <LanguageSwitcher />
</div>
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl gradient-primary">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-semibold text-foreground">
              MediClear
            </span>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">
  {t("signup.title")}
</h1>
<p className="text-center text-muted-foreground mb-8">
  {t("signup.subtitle")}
</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("signup.name")}</Label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t("signup.placeholderName")}

                    className="pl-10 h-12 rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("signup.email")}</Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"

                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("signup.phone")}</Label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t("signup.placeholderPhone")}

                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("signup.password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t("signup.placeholderPassword")}

                  className="pl-10 pr-10 h-12 rounded-xl"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
  {t("signup.passwordHint")}
</p>
            </div>

            <div className="flex items-start gap-2 py-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) =>
                  setAcceptTerms(Boolean(checked))
                }
                className="mt-1"
              />
              <Label
                htmlFor="terms"
                className="text-sm text-muted-foreground font-normal cursor-pointer"
              >
                {t("signup.agree")}{" "}

                <Link to="/terms" className="text-primary hover:underline">
                  {t("signup.terms")}
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  {t("signup.privacy")}
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {t("signup.creating")}
                </span>
              ) : (
                <>
                  {t("signup.create")}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {t("signup.haveAccount")}
              <Link to="/login" className="text-primary font-medium hover:underline">
                {t("signup.signin")}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;