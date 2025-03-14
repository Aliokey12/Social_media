import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { FiMessageCircle, FiLogOut, FiSearch, FiBell } from "react-icons/fi";
import { getTotalUnreadCount, getUnreadNotificationsCount } from "@/lib/appwrite/api";
import NotificationsPopover from "./NotificationsPopover";

const Topbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

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

  // Mesajlar sayfasına gidildiğinde mesaj sayacını sıfırla
  useEffect(() => {
    if (location.pathname.startsWith('/messages') && unreadCount > 0) {
      setUnreadCount(0);
    }
  }, [location.pathname, unreadCount]);

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

  // Mesajlar sayfasına yönlendirme ve sayacı sıfırlama
  const handleMessagesClick = () => {
    if (unreadCount > 0) {
      setUnreadCount(0);
    }
  };

  return (
    <section className="topbar sticky top-0 z-50 backdrop-blur-md bg-dark-2/80 border-b border-dark-4/50 shadow-lg w-full">
      <div className="flex justify-between items-center py-2 px-4 max-w-7xl mx-auto">
        <Link to="/" className="flex gap-2 items-center ">
        <div className="font-bold text-3xl bg-gradient-to-r from-primary-400 to-accent-2 bg-clip-text text-transparent transition-all duration-300 hover:from-primary-300 hover:to-accent-1">SnapFlow</div>
        </Link>
      
        
        <div className="flex gap-3 items-center">
          <Link to="/messages" className="relative" onClick={handleMessagesClick}>
            <Button 
              variant="ghost" 
              className="rounded-full p-2.5 bg-dark-3/60 hover:bg-dark-4/60 transition-all duration-300"
            >
              <FiMessageCircle className="w-5 h-5 text-light-2" />
            </Button>
            
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-accent-1 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="relative">
            <Button 
              variant="ghost" 
              className="rounded-full p-2.5 bg-dark-3/60 hover:bg-dark-4/60 transition-all duration-300"
              onClick={handleToggleNotifications}
            >
              <FiBell className="w-5 h-5 text-light-2" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-accent-1 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Button>

            {showNotifications && (
              <NotificationsPopover onClose={handleCloseNotifications} />
            )}
          </div>
          
          <Button
            variant="ghost"
            className="rounded-full p-2.5 bg-dark-3/60 hover:bg-dark-4/60 transition-all duration-300"
            onClick={() => signOut()}
          >
            <FiLogOut className="w-5 h-5 text-light-2" />
          </Button>
          
          <Link to={`/profile/${user.$id}`} className="flex-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-500/30 shadow-lg transition-all duration-300 hover:border-primary-500/60 hover:shadow-xl">
                <img
                  src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-accent-3 border-2 border-dark-2"></div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;
