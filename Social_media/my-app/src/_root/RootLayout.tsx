import { Outlet } from "react-router-dom";
import { useEffect } from "react";

import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import { useUserContext } from "@/context/AuthContext";

const RootLayout = () => {
  const { isAuthenticated } = useUserContext();

  // Sayfa yüklendiğinde en üste kaydır
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full min-h-screen bg-dark-1 flex flex-col">
      <Topbar />
      
      <div className="flex flex-1 relative">
        <LeftSidebar />
        
        <section className="flex-1 overflow-hidden">
          <div className="max-w-5xl mx-auto w-full pb-20 md:pb-0">
            <Outlet />
          </div>
        </section>
      </div>

      <Bottombar />
    </div>
  );
};

export default RootLayout;