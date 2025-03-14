import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { RiLogoutBoxLine } from "react-icons/ri";
import { FiMessageCircle, FiBell, FiUser, FiHome, FiSearch, FiBookmark, FiPlusCircle } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { useUserContext, INITIAL_USER } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { getTotalUnreadCount, getUnreadNotificationsCount } from "@/lib/appwrite/api";
import NotificationsPopover from "./NotificationsPopover";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, setUser, setIsAuthenticated, isLoading } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!user?.$id) return;
      
      try {
        const count = await getTotalUnreadCount(user.$id);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();
    
    // Poll for new messages every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [user?.$id]);

  useEffect(() => {
    const loadUnreadNotifications = async () => {
      if (!user?.$id) return;

      try {
        const count = await getUnreadNotificationsCount(user.$id);
        setUnreadNotifications(count);
      } catch (error) {
        console.error('Error loading unread notifications:', error);
      }
    };

    loadUnreadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [user?.$id]);

  // Mesajlar sayfasına gidildiğinde mesaj sayacını sıfırla
  useEffect(() => {
    if (pathname.startsWith('/messages') && unreadCount > 0) {
      setUnreadCount(0);
    }
  }, [pathname, unreadCount]);

  // Bildirim popover'ı dışında bir yere tıklandığında kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
  };

  // Mesajlar sayfasına yönlendirme ve sayacı sıfırlama
  const handleMessagesClick = () => {
    if (unreadCount > 0) {
      setUnreadCount(0);
    }
  };

  // Bildirim popover'ı açıldığında bildirim sayacını sıfırla
  const handleToggleNotifications = () => {
    const newState = !showNotifications;
    setShowNotifications(newState);
    
    // Eğer popover açılıyorsa, bildirim sayacını sıfırla
    if (newState && unreadNotifications > 0) {
      setUnreadNotifications(0);
    }
  };

  // Bildirim popover'ı kapatıldığında çağrılacak fonksiyon
  const handleCloseNotifications = () => {
    setShowNotifications(false);
    // Bildirim sayacını sıfırla
    if (unreadNotifications > 0) {
      setUnreadNotifications(0);
    }
  };

  // Sidebar için özel navigasyon linkleri
  const customLinks = [
    { icon: FiHome, route: "/", label: "Ana Sayfa" },
    { icon: FiSearch, route: "/explore", label: "Keşfet" },
    { icon: FiMessageCircle, route: "/messages", label: "Mesajlar", count: unreadCount },
    { icon: FiBell, route: "#", label: "Bildirimler", count: unreadNotifications, onClick: handleToggleNotifications },
    { icon: FiBookmark, route: "/saved", label: "Kaydedilenler" },
    { icon: FiPlusCircle, route: "/create-post", label: "Gönderi Oluştur" },
  ];

  return (
    <nav className="leftsidebar h-screen sticky top-0 overflow-y-auto w-80">
      <div className="flex flex-col gap-11">
        {/* Logo - only visible on desktop */}
     

        {isLoading || !user.email ? (
          <div className="h-14 w-full rounded-lg bg-dark-4 animate-pulse mx-4" />
        ) : (
          <Link to={`/profile/${user.$id}`} className="flex gap-4 items-center mx-4 p-3 glass-card rounded-xl hover:bg-dark-3/50 transition-all duration-300">
            <div className="relative">
              <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-primary-500 shadow-lg transition-all duration-300 hover:shadow-xl">
                <img
                  src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-dark-2 animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <p className="font-semibold text-light-1">{user.name}</p>
              <p className="text-sm text-light-3">@{user.username}</p>
            </div>
          </Link>
        )}

        <div className="flex flex-col gap-2 px-3">
          {customLinks.map((link) => {
            const isActive = link.route === "#" ? showNotifications : pathname === link.route;
            const isNotifications = link.label === "Bildirimler";
            const isMessages = link.route === "/messages";

            return (
              <div key={link.label} className="relative">
                {isNotifications ? (
                  <button
                    onClick={link.onClick}
                    className={`flex gap-4 items-center p-4 w-full text-left rounded-xl transition-all duration-300 ${
                      isActive 
                        ? "gradient-bg text-light-1" 
                        : "hover:bg-dark-3/50 text-light-3 hover:text-light-1"
                    }`}
                  >
                    <link.icon className={`w-6 h-6 ${isActive ? "text-light-1" : ""}`} />
                    <span className={`${isActive ? "font-medium" : ""}`}>{link.label}</span>
                    
                    {link.count && link.count > 0 && (
                      <span className="absolute right-4 bg-gradient-to-r from-primary-500 to-accent-1 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
                        {link.count > 9 ? '9+' : link.count}
                      </span>
                    )}
                  </button>
                ) : (
                  <NavLink
                    to={link.route}
                    className={({ isActive }) => 
                      `flex gap-4 items-center p-4 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? "gradient-bg text-light-1" 
                          : "hover:bg-dark-3/50 text-light-3 hover:text-light-1"
                      }`
                    }
                    onClick={isMessages ? handleMessagesClick : undefined}
                  >
                    <link.icon className="w-6 h-6" />
                    <span>{link.label}</span>
                    
                    {link.count && link.count > 0 && (
                      <span className="absolute right-4 bg-gradient-to-r from-primary-500 to-accent-1 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
                        {link.count > 9 ? '9+' : link.count}
                      </span>
                    )}
                  </NavLink>
                )}

                {isNotifications && showNotifications && (
                  <div 
                    ref={notificationsRef}
                    className="absolute left-full ml-2 top-0 z-50"
                  >
                    <NotificationsPopover onClose={handleCloseNotifications} />
                  </div>
                )}
              </div>
            );
          })}

          <NavLink
            to={`/profile/${user.$id}`}
            className={({ isActive }) => 
              `flex gap-4 items-center p-4 rounded-xl transition-all duration-300 ${
                isActive 
                  ? "gradient-bg text-light-1" 
                  : "hover:bg-dark-3/50 text-light-3 hover:text-light-1"
              }`
            }
          >
            <FiUser className="w-6 h-6" />
            <span>Profil</span>
          </NavLink>

          
        </div>
      <Button
        variant="ghost"
        className="flex gap-4   p-4 rounded-xl transition-all duration-300 hover:bg-dark-3/50 text-light-3 hover:text-red-500  "
        onClick={(e) => handleSignOut(e)}>
        <RiLogoutBoxLine className="w-6 h-6" />
        <p className="font-medium">Çıkış Yap</p>
      </Button>
      </div>

    </nav>
  );
};

export default LeftSidebar;
