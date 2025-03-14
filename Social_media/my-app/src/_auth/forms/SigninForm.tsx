import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/hooks/use-toast";

import { SigninValidation } from "@/lib/validation";
import { useSignInAccount } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";

const SigninForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
  
  // Yükleme durumu için yerel durum oluştur
  const [isLoading, setIsLoading] = useState(false);

  // Query
  const { mutateAsync: signInAccount } = useSignInAccount();

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle sign-in
  const handleSignin = async (user: z.infer<typeof SigninValidation>) => {
    setIsLoading(true); // Yükleme durumunu başlat
    try {
      const session = await signInAccount(user);

      if (!session) {
        toast({ title: "Giriş başarısız. Lütfen tekrar deneyin." });
        return;
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        navigate("/");
      } else {
        toast({ title: "Giriş başarısız. Lütfen tekrar deneyin." });
      }
    } catch (error) {
      console.error("Giriş sırasında bir hata oluştu:", error);
      toast({ title: "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin." });
    } finally {
      setIsLoading(false); // Yükleme durumunu durdur
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
            Hesabınıza giriş yapın
          </h2>
          <p className="text-light-3 text-xs sm:text-sm md:text-base mt-2 text-center">
            Tekrar hoş geldiniz! Lütfen bilgilerinizi girin.
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(handleSignin)}
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label flex items-center gap-2 text-sm sm:text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Parola
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

            <div className="flex justify-between items-center mt-1 sm:mt-2">
              <div className="flex items-center">
                <input type="checkbox" id="remember" className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                <label htmlFor="remember" className="text-xs sm:text-sm text-light-3">Beni hatırla</label>
              </div>
              <Link to="/forgot-password" className="text-xs sm:text-sm text-primary-500 hover:underline">Şifremi unuttum</Link>
            </div>

            <Button type="submit" className="gradient-bg mt-2 sm:mt-4 h-10 sm:h-12">
              {isLoading || isUserLoading ? (
                <div className="flex-center gap-2">
                  <Loader /> <span className="text-xs sm:text-sm">Yükleniyor...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm sm:text-base">Giriş yap</span>
                </div>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center mt-4 sm:mt-6">
            <div className="h-px bg-gray-700 w-full"></div>
            <p className="text-light-3 text-xs sm:text-sm px-2 sm:px-4">veya</p>
            <div className="h-px bg-gray-700 w-full"></div>
          </div>

          <div className="flex gap-4 mt-2">
          </div>

          <p className="text-xs sm:text-sm text-light-2 text-center mt-4 sm:mt-6">
            Hesabınız yok mu?
            <Link
              to="/sign-up"
              className="text-primary-500 text-xs sm:text-sm font-semibold ml-1 hover:underline">
              Kaydol
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SigninForm;
