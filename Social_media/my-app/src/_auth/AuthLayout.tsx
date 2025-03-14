import { Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated } = useUserContext();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-container min-h-screen w-full">
      {/* Animasyonlu arka plan elementleri */}
      <div className="fixed -z-10 w-full h-full overflow-hidden">
        {/* Gradient arka plan */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-1 via-dark-2 to-dark-1 opacity-80"></div>
        
        {/* Animasyonlu daireler */}
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-primary-500/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-accent-2/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2 animate-pulse delay-700"></div>
        <div className="absolute top-1/2 right-1/4 w-1/4 h-1/4 bg-accent-3/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1/5 h-1/5 bg-primary-500/10 rounded-full blur-3xl animate-pulse delay-1500"></div>
        
        {/* Dekoratif çizgiler */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[10%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-500/20 to-transparent"></div>
          <div className="absolute top-[30%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-2/20 to-transparent"></div>
          <div className="absolute top-[70%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-3/20 to-transparent"></div>
          <div className="absolute top-[90%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-500/20 to-transparent"></div>
        </div>
        
        {/* Dekoratif noktalar */}
        <div className="absolute inset-0 opacity-30">
          <div className="stars-small"></div>
          <div className="stars-medium"></div>
          <div className="stars-large"></div>
        </div>
      </div>
      
      {/* Dekoratif şekiller */}
      <div className="fixed -z-5 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 border border-primary-500/20 rounded-lg rotate-45 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 border border-accent-2/20 rounded-full animate-float delay-500"></div>
        <div className="absolute top-1/3 right-20 w-12 h-12 border border-accent-3/20 rounded-lg rotate-12 animate-float delay-1000"></div>
        <div className="absolute bottom-1/3 left-20 w-10 h-10 border border-primary-500/20 rounded-full animate-float delay-1500"></div>
      </div>
      
      {/* Ana içerik */}
      <section className="flex flex-1 justify-center items-center flex-col py-10 px-4 relative">
        <Outlet />
      </section>
    </div>
  );
}
