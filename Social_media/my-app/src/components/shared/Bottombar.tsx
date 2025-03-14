import { Link, useLocation } from "react-router-dom";
import { bottombarLinks } from "@/constants";
import { FiMessageCircle, FiHome, FiSearch, FiUser, FiPlusCircle } from "react-icons/fi";
import { useUserContext } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getTotalUnreadCount } from "@/lib/appwrite/api";

const Bottombar = () => {
  const { pathname } = useLocation();
  const { user } = useUserContext();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!user?.id) return;
      
      try {
        const count = await getTotalUnreadCount(user.id);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();
    
    // Poll for new messages every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

  // Mesajlar sayfasına gidildiğinde mesaj sayacını sıfırla
  useEffect(() => {
    if (pathname.startsWith('/messages') && unreadCount > 0) {
      setUnreadCount(0);
    }
  }, [pathname, unreadCount]);

  // Custom navigation links with icons
  const navLinks = [
    {
      route: "/",
      label: "Ana Sayfa",
      icon: FiHome
    },
    {
      route: "/explore",
      label: "Keşfet",
      icon: FiSearch
    },
    {
      route: "/create-post",
      label: "Oluştur",
      icon: FiPlusCircle
    },
    {
      route: "/messages",
      label: "Mesajlar",
      icon: FiMessageCircle
    },
    {
      route: `/profile/${user.id}`,
      label: "Profil",
      icon: FiUser
    }
  ];

  // Mesajlar sayfasına yönlendirme ve sayacı sıfırlama
  const handleMessagesClick = () => {
    if (unreadCount > 0) {
      setUnreadCount(0);
    }
  };

  return (
    <section className="bottom-bar fixed bottom-0 z-50 w-full backdrop-blur-md bg-dark-2/80 border-t border-dark-4/50 shadow-lg md:hidden">
      <div className="flex justify-between items-center py-2 px-5 max-w-lg mx-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.route;
          const isMessages = link.route === "/messages";
          const isCreate = link.route === "/create-post";

          return (
            <Link
              to={link.route}
              key={link.label}
              className="relative flex flex-col items-center gap-1 py-2 px-3"
              onClick={isMessages ? handleMessagesClick : undefined}
            >
              <div className={`
                p-2 rounded-full transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-r from-primary-500 to-accent-2 shadow-lg' 
                  : isCreate 
                    ? 'bg-gradient-to-r from-primary-500/80 to-accent-2/80 shadow-md' 
                    : 'bg-dark-3/60 hover:bg-dark-4/60'
                }
              `}>
                <link.icon className={`w-5 h-5 ${isActive || isCreate ? "text-white" : "text-light-2"}`} />
              </div>
              
              <span className={`text-xs ${isActive ? "text-light-1 font-medium" : "text-light-3"}`}>
                {link.label}
              </span>

              {isMessages && unreadCount > 0 && (
                <span className="absolute top-0 right-1 bg-gradient-to-r from-primary-500 to-accent-1 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Bottombar;