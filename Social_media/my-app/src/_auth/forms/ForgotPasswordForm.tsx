import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useState } from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/hooks/use-toast";

import { PasswordRecoveryValidation } from "@/lib/validation";
import { requestPasswordRecovery } from "@/lib/appwrite/api";

const ForgotPasswordForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof PasswordRecoveryValidation>>({
    resolver: zodResolver(PasswordRecoveryValidation),
    defaultValues: {
      email: "",
    },
  });

  // Handle password recovery request
  const handlePasswordRecovery = async (data: z.infer<typeof PasswordRecoveryValidation>) => {
    setIsLoading(true);
    try {
      await requestPasswordRecovery(data.email);
      setEmailSent(true);
      toast({ 
        title: "Şifre sıfırlama bağlantısı gönderildi", 
        description: "E-posta adresinize şifre sıfırlama bağlantısı gönderdik. Lütfen e-postanızı kontrol edin."
      });
    } catch (error) {
      console.error("Şifre sıfırlama isteği sırasında bir hata oluştu:", error);
      toast({ 
        title: "Şifre sıfırlama başarısız", 
        description: "Şifre sıfırlama isteği gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
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
            Şifrenizi mi unuttunuz?
          </h2>
          <p className="text-light-3 text-xs sm:text-sm md:text-base mt-2 text-center">
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        {emailSent ? (
          <div className="glass-card p-4 sm:p-8 mt-6 sm:mt-8 w-full animate-fade-in">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-primary-500 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">E-posta Gönderildi!</h3>
              <p className="text-xs sm:text-sm text-light-3 mb-4 sm:mb-6">
                Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin ve bağlantıya tıklayarak şifrenizi sıfırlayın.
              </p>
              <Link to="/sign-in" className="text-xs sm:text-sm text-primary-500 hover:underline">
                Giriş sayfasına dön
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit(handlePasswordRecovery)}
            className="flex flex-col gap-4 sm:gap-5 w-full mt-6 sm:mt-8 animate-slide-up">
            <div className="glass-card p-4 sm:p-8 flex flex-col gap-4 sm:gap-6 relative">
              {/* Dekoratif köşe elementleri */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary-500/50 -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent-2/50 translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent-3/50 -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary-500/50 translate-x-1 translate-y-1"></div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-form_label flex items-center gap-2 text-sm sm:text-base">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      E-posta
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        className="glass-input pl-10 text-black h-10 sm:h-12" 
                        {...field} 
                        placeholder="ornek@email.com"
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
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs sm:text-sm">Şifre Sıfırlama Bağlantısı Gönder</span>
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

export default ForgotPasswordForm; 