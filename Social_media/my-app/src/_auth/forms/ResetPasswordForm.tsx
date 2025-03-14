import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/hooks/use-toast";

import { ResetPasswordValidation } from "@/lib/validation";
import { completePasswordRecovery } from "@/lib/appwrite/api";

const ResetPasswordForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  // Get userId and secret from URL parameters
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const form = useForm<z.infer<typeof ResetPasswordValidation>>({
    resolver: zodResolver(ResetPasswordValidation),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Check if userId and secret are present
    if (!userId || !secret) {
      toast({ 
        title: "Geçersiz şifre sıfırlama bağlantısı", 
        description: "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir şifre sıfırlama isteği gönderin."
      });
      navigate("/forgot-password");
    }
  }, [userId, secret, toast, navigate]);

  // Handle password reset
  const handleResetPassword = async (data: z.infer<typeof ResetPasswordValidation>) => {
    if (!userId || !secret) return;
    
    setIsLoading(true);
    try {
      await completePasswordRecovery(userId, secret, data.password);
      setResetComplete(true);
      toast({ 
        title: "Şifre başarıyla sıfırlandı", 
        description: "Şifreniz başarıyla değiştirildi. Şimdi yeni şifrenizle giriş yapabilirsiniz."
      });
    } catch (error) {
      console.error("Şifre sıfırlama sırasında bir hata oluştu:", error);
      toast({ 
        title: "Şifre sıfırlama başarısız", 
        description: "Şifreniz sıfırlanırken bir hata oluştu. Bağlantının süresi dolmuş olabilir. Lütfen yeni bir şifre sıfırlama isteği gönderin."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <div className="w-full max-w-[420px] mx-auto px-4 sm:px-0 flex items-center justify-center flex-col relative z-10">
        <div className="absolute -z-10 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute -z-10 w-72 h-72 -right-20 -bottom-20 rounded-full bg-accent-2/20 blur-3xl animate-pulse delay-700"></div>
        
        {/* Logo ve başlık */}
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <div className="font-bold text-5xl sm:text-7xl mb-2">
            <span className="gradient-text">Snap</span>
            <span className="text-gray-400">Flow</span>
          </div>
        </div>

        <div className="animate-fade-in">
          <h2 className="h3-bold md:h2-bold pt-2 sm:pt-4 text-center">
            Şifrenizi Sıfırlayın
          </h2>
          <p className="text-light-3 text-xs sm:text-sm md:text-base mt-2 text-center">
            Lütfen yeni şifrenizi girin.
          </p>
        </div>

        {resetComplete ? (
          <div className="glass-card p-4 sm:p-8 mt-6 sm:mt-8 w-full animate-fade-in">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-primary-500 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Şifre Başarıyla Sıfırlandı!</h3>
              <p className="text-xs sm:text-sm text-light-3 mb-4 sm:mb-6">
                Şifreniz başarıyla değiştirildi. Artık yeni şifrenizle giriş yapabilirsiniz.
              </p>
              <Link to="/sign-in" className="gradient-bg px-4 sm:px-6 py-2 rounded-lg inline-block text-xs sm:text-sm">
                Giriş Yap
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit(handleResetPassword)}
            className="flex flex-col gap-4 sm:gap-5 w-full mt-6 sm:mt-8 animate-slide-up">
            <div className="glass-card p-4 sm:p-8 flex flex-col gap-4 sm:gap-6 relative">
              {/* Dekoratif köşe elementleri */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary-500/50 -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent-2/50 translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent-3/50 -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary-500/50 translate-x-1 translate-y-1"></div>
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-form_label flex items-center gap-2 text-sm sm:text-base">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Yeni Şifre
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        className="glass-input pl-10 text-black h-10 sm:h-12" 
                        {...field} 
                        placeholder="••••••••"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-form_label flex items-center gap-2 text-sm sm:text-base">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Şifreyi Onayla
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        className="glass-input pl-10 text-black h-10 sm:h-12" 
                        {...field} 
                        placeholder="••••••••"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <Button type="submit" className="gradient-bg mt-2 sm:mt-4 h-10 sm:h-12">
                {isLoading ? (
                  <div className="flex-center gap-2">
                    <Loader /> <span className="text-xs sm:text-sm">Yükleniyor...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs sm:text-sm">Şifreyi Sıfırla</span>
                  </div>
                )}
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-light-2 text-center mt-4 sm:mt-6">
              <Link
                to="/sign-in"
                className="text-primary-500 text-xs sm:text-sm font-semibold hover:underline">
                Giriş sayfasına dön
              </Link>
            </p>
          </form>
        )}
      </div>
    </Form>
  );
};

export default ResetPasswordForm; 