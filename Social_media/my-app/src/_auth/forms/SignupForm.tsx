import * as z from "zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/hooks/use-toast";

import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queries";
import { SignupValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";

const SignupForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuthUser } = useUserContext();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  // Queries
  const { mutateAsync: createUserAccount } = useCreateUserAccount();
  const { mutateAsync: signInAccount } = useSignInAccount();

  // Handler
  const handleSignup = async (user: z.infer<typeof SignupValidation>) => {
    setIsLoading(true);
    try {
      const newUser = await createUserAccount(user);

      if (!newUser) {
        toast({ title: "Kayıt başarısız. Lütfen tekrar deneyin.", });
        return;
      }

      const session = await signInAccount({
        email: user.email,
        password: user.password,
      });

      if (!session) {
        toast({ title: "Bir şeyler ters gitti. Lütfen yeni hesabınızla giriş yapın", });
        navigate("/sign-in");
        return;
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        toast({ title: "Tebrikler aramıza sende katıldın . Yönlendiriliyorsun !", });
        navigate("/");
      } else {
        toast({ title: "Giriş başarısız. Lütfen tekrar deneyin.", });
        return;
      }
    } catch (error) {
      console.error("Kayıt sırasında bir hata oluştu:", error);
      toast({ title: "Kayıt başarısız. Lütfen tekrar deneyin.", });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <div className="w-full max-w-[420px] mx-auto px-4 sm:px-0 flex items-center justify-center flex-col relative z-10">
        <div className="absolute -z-10 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute -z-10 w-72 h-72 -right-20 -bottom-20 rounded-full bg-accent-2/20 blur-3xl animate-pulse delay-700"></div>
        <div className="absolute -z-10 w-60 h-60 -left-20 top-40 rounded-full bg-accent-3/20 blur-3xl animate-pulse delay-1000"></div>
        
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <div className="font-bold text-5xl sm:text-7xl mb-2">
            <span className="gradient-text">Snap</span>
            <span className="text-gray-400">Flow</span>
          </div>
        </div>

        <div className="animate-fade-in">
          <h2 className="h3-bold md:h2-bold pt-2 sm:pt-4 text-center">
            Yeni bir hesap oluşturun
          </h2>
          <p className="text-light-3 small-medium md:base-regular mt-2 text-center">
            SnapFlow'a katılmak için bilgilerinizi girin
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(handleSignup)}
          className="flex flex-col gap-4 sm:gap-5 w-full mt-6 sm:mt-8 animate-slide-up">
          <div className="glass-card p-4 sm:p-8 flex flex-col gap-4 sm:gap-6 relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary-500/50 -translate-x-1 -translate-y-1"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent-2/50 translate-x-1 -translate-y-1"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent-3/50 -translate-x-1 translate-y-1"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary-500/50 translate-x-1 translate-y-1"></div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label flex items-center gap-2 text-sm sm:text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Ad
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      className="glass-input pl-10 text-black h-10 sm:h-12" 
                      {...field} 
                      placeholder="Adınız"
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label flex items-center gap-2 text-sm sm:text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.35-.035-.691-.1-1.02A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                    Kullanıcı Adı
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      className="glass-input pl-10 text-black h-10 sm:h-12" 
                      {...field} 
                      placeholder="kullanici_adi"
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />

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

            <div className="flex items-center mt-1 sm:mt-2">
              <input type="checkbox" id="terms" className="mr-2 h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
              <label htmlFor="terms" className="text-xs sm:text-sm text-light-3">
                <span>Kullanım şartlarını ve gizlilik politikasını kabul ediyorum</span>
              </label>
            </div>

            <Button type="submit" className="gradient-bg mt-2 sm:mt-4 h-10 sm:h-12">
              {isLoading ? (
                <div className="flex-center gap-2">
                  <Loader /> Yükleniyor...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm sm:text-base">Kaydol</span>
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
            Zaten bir hesabınız var mı?
            <Link
              to="/sign-in"
              className="text-primary-500 text-xs sm:text-sm font-semibold ml-1 hover:underline">
              Giriş yap
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SignupForm;
