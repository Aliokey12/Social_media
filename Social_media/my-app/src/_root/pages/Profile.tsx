import {
  Route,
  Routes,
  Link,
  Outlet,
  useParams,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Button, useToast } from "@/components/ui";
import { LikedPosts } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById } from "@/lib/react-query/queries";
import { GridPostList, Loader } from "@/components/shared";
import { checkIsFollowing, followUser, getOrCreateConversation, getUserFollowers, getUserFollowing, unfollowUser } from "@/lib/appwrite/api";
import { FiMessageCircle, FiEdit3, FiUsers, FiHeart, FiImage, FiCalendar } from "react-icons/fi";
import { useEffect, useState } from "react";
import UserList from "@/components/shared/UserList";
import { Models } from "appwrite";

interface StabBlockProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const StatBlock = ({ value, label, icon, onClick }: StabBlockProps) => (
  <div className="profile-stat-block" onClick={onClick}>
    {icon}
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: currentUser } = useGetUserById(id || "");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [followers, setFollowers] = useState<Models.Document[]>([]);
  const [following, setFollowing] = useState<Models.Document[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  // Kullanıcı nesnelerini kontrol et
  useEffect(() => {
    console.log('Profile component user objects:', {
      user,
      userId: user?.id,
      user$id: user?.$id,
      currentUser,
      currentUserId: currentUser?.$id,
      id
    });
  }, [user, currentUser, id]);

  useEffect(() => {
    const loadFollowData = async () => {
      if (!currentUser || !user) {
        console.log('User data not loaded:', { currentUser, user });
        return;
      }

      try {
        // Check if current user is following the profile user
        // AuthContext'ten gelen user nesnesinin id veya $id alanını kullan
        const loggedInUserId = user.id || user.$id;
        const profileUserId = currentUser.$id;
        
        console.log('User details in loadFollowData:', {
          user,
          userId: user.id,
          user$id: user.$id,
          currentUser,
          currentUserId: currentUser.$id
        });
        
        // Daha sıkı ID kontrolü
        if (!loggedInUserId || loggedInUserId === "") {
          console.error('Invalid loggedInUserId in loadFollowData:', loggedInUserId);
          return;
        }

        if (!profileUserId || profileUserId === "") {
          console.error('Invalid profileUserId in loadFollowData:', profileUserId);
          return;
        }
        
        console.log('Loading follow data with:', {
          loggedInUserId,
          profileUserId
        });

        const isFollowingCheck = await checkIsFollowing(loggedInUserId, profileUserId);
        console.log('Is following check result:', isFollowingCheck);
        setIsFollowing(isFollowingCheck);

        // Get followers and following counts and lists
        const followersData = await getUserFollowers(profileUserId);
        const followingData = await getUserFollowing(profileUserId);
        
        console.log('Follow data:', {
          followers: followersData.total,
          following: followingData.total
        });
        
        setFollowersCount(followersData.total);
        setFollowingCount(followingData.total);
        
        // Filter out null values and cast to the correct type
        const filteredFollowers = followersData.documents.filter((doc): doc is Models.Document => doc !== null);
        const filteredFollowing = followingData.documents.filter((doc): doc is Models.Document => doc !== null);
        
        setFollowers(filteredFollowers);
        setFollowing(filteredFollowing);
      } catch (error) {
        console.error("Error loading follow data:", error);
      }
    };

    loadFollowData();
  }, [currentUser, user]);

  const handleFollowUser = async () => {
    if (!currentUser || !user) {
      console.error('Missing user data:', { 
        currentUser: currentUser ? { id: currentUser.$id, name: currentUser.name } : null,
        user: user ? { id: user.id, $id: user.$id, name: user.name } : null 
      });
      toast({
        title: "Hata!",
        description: "Kullanıcı bilgileri eksik.",
        variant: "destructive",
      });
      return;
    }

    // Giriş yapmış kullanıcının ID'si (takip eden)
    // AuthContext'ten gelen user nesnesinin id veya $id alanını kullan
    // Eğer user.id boşsa, user.$id kullan
    const loggedInUserId = user.id || user.$id;
    
    // Profil sayfasındaki kullanıcının ID'si (takip edilen)
    const profileUserId = currentUser.$id;

    console.log('User object details:', {
      user,
      userId: user.id,
      user$id: user.$id,
      currentUser,
      currentUserId: currentUser.$id
    });

    // Daha sıkı ID kontrolü
    if (!loggedInUserId || loggedInUserId === "") {
      console.error('Invalid loggedInUserId:', loggedInUserId);
      toast({
        title: "Hata!",
        description: "Oturum açmış kullanıcı ID'si alınamadı.",
        variant: "destructive",
      });
      return;
    }

    if (!profileUserId || profileUserId === "") {
      console.error('Invalid profileUserId:', profileUserId);
      toast({
        title: "Hata!",
        description: "Profil kullanıcı ID'si alınamadı.",
        variant: "destructive",
      });
      return;
    }

    // Log the IDs being used
    console.log('Follow operation with IDs:', {
      loggedInUserId,
      profileUserId,
      isFollowing
    });
    
    setIsLoading(true);
    try {
      if (isFollowing) {
        console.log('Attempting to unfollow:', {
          followerId: loggedInUserId,
          followedId: profileUserId
        });
        await unfollowUser(loggedInUserId, profileUserId);
        setFollowersCount(prev => prev - 1);
      } else {
        console.log('Attempting to follow:', {
          followerId: loggedInUserId,
          followedId: profileUserId
        });
        await followUser(loggedInUserId, profileUserId);
        setFollowersCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
      
      toast({
        title: isFollowing ? "Takipten çıkıldı" : "Takip edildi",
        description: isFollowing 
          ? `${currentUser.name} artık takip edilmiyor.`
          : `${currentUser.name} takip ediliyor.`,
      });
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast({
        title: "Hata!",
        description: "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageUser = async () => {
    if (!currentUser || !user) return;
    
    if (currentUser.$id === user.$id) {
      toast({
        title: "Hata!",
        description: "Kendinize mesaj gönderemezsiniz.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const conversation = await getOrCreateConversation([currentUser.$id, user.$id]);
      navigate(`/messages/${conversation.$id}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Hata!",
        description: "Mesaj göndermek sırasında bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="profile-container overflow-hidden">
      {!currentUser ? (
        <div className="flex-center w-full h-full">
          <Loader />
        </div>
      ) : (
        <>
          {/* Followers/Following Modals */}
          {showFollowers && (
            <UserList 
              users={followers} 
              title="Takipçiler" 
              isOpen={showFollowers} 
              onClose={() => setShowFollowers(false)} 
            />
          )}
          
          {showFollowing && (
            <UserList 
              users={following} 
              title="Takip Edilenler" 
              isOpen={showFollowing} 
              onClose={() => setShowFollowing(false)} 
            />
          )}

          {/* Profile Header - Glassmorphism Card */}
          <div className="w-full mx-auto">
            <div className="glass-card p-8 rounded-2xl mb-8 animate-fade-in profile-card-hover">
              <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                {/* Profile Image Section */}
                <div className="profile-image-container">
                  <div className="profile-image profile-image-hover">
                    <img
                      src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="profile-status-indicator bg-green-500"></div>
                </div>

                {/* Profile Info Section */}
                <div className="flex flex-col flex-1 gap-4 items-center lg:items-start">
                  <div className="text-center lg:text-left">
                    <h1 className="text-3xl font-bold gradient-text">{currentUser.name}</h1>
                    <p className="text-light-3">@{currentUser.username}</p>
                  </div>
                  
                  {currentUser.bio && (
                    <p className="profile-bio">
                      {currentUser.bio}
                    </p>
                  )}

                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-3 mt-2 justify-center lg:justify-start">
                    <StatBlock 
                      value={followersCount} 
                      label="Takipçi" 
                      icon={<FiUsers className="text-primary-500" />}
                      onClick={() => setShowFollowers(true)}
                    />
                    <StatBlock 
                      value={followingCount} 
                      label="Takip" 
                      icon={<FiUsers className="text-accent-1" />}
                      onClick={() => setShowFollowing(true)}
                    />
                    <StatBlock 
                      value={currentUser.posts?.length || 0} 
                      label="Gönderi" 
                      icon={<FiImage className="text-accent-2" />}
                    />
                    {currentUser.joinedAt && (
                      <div className="flex items-center gap-2 bg-dark-3/50 px-4 py-2 rounded-full">
                        <FiCalendar className="text-light-3" />
                        <p className="small-medium text-light-3">
                          {new Date(currentUser.joinedAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'short'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-4 lg:mt-0">
                  {currentUser.$id !== user.$id ? (
                    <>
                      <Button 
                        type="button" 
                        className={`profile-action-button ${isFollowing ? 'profile-following-button' : 'profile-follow-button'}`}
                        onClick={handleFollowUser}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex-center gap-2">
                            <div className="h-4 w-4 rounded-full border-2 border-light-2 border-t-transparent animate-spin"></div>
                            <span>İşleniyor...</span>
                          </div>
                        ) : (
                          <span className="flex items-center gap-2">
                            {isFollowing ? (
                              <>
                                <FiUsers className="text-lg" />
                                Takip Ediliyor
                              </>
                            ) : (
                              <>
                                <FiUsers className="text-lg" />
                                Takip Et
                              </>
                            )}
                          </span>
                        )}
                      </Button>
                      
                      <Button 
                        type="button" 
                        className="profile-action-button glass-button"
                        onClick={handleMessageUser}
                      >
                        <FiMessageCircle className="text-lg mr-2" />
                        Mesaj Gönder
                      </Button>
                    </>
                  ) : (
                    <Link to={`/update-profile/${currentUser.$id}`}>
                      <Button type="button" className="profile-action-button glass-button w-full">
                        <FiEdit3 className="text-lg mr-2" />
                        Profili Düzenle
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex w-full bg-dark-3/30 rounded-xl p-1 mb-8 animate-slide-in">
              <Link
                to={`/profile/${id}`}
                className={`profile-tab ${
                  pathname === `/profile/${id}` 
                    ? "profile-tab-active" 
                    : "profile-tab-inactive"
                }`}
              >
                <p className="flex-center gap-2 justify-center">
                  <FiImage className={pathname === `/profile/${id}` ? "text-light-1" : "text-primary-500"} />
                  Gönderiler
                </p>
              </Link>
              <Link
                to={`/profile/${id}/liked-posts`}
                className={`profile-tab ${
                  pathname === `/profile/${id}/liked-posts` 
                    ? "profile-tab-active" 
                    : "profile-tab-inactive"
                }`}
              >
                <p className="flex-center gap-2 justify-center">
                  <FiHeart className={pathname === `/profile/${id}/liked-posts` ? "text-light-1" : "text-accent-1"} />
                  Beğenilen
                </p>
              </Link>
            </div>

            {/* Content Area */}
            <div className="animate-fade-in">
              <Routes>
                <Route
                  index
                  element={
                    <div className="w-full">
                      {currentUser.posts && currentUser.posts.length > 0 ? (
                        <GridPostList
                          posts={currentUser.posts}
                          showUser={false}
                          showStats={true}
                        />
                      ) : (
                        <div className="profile-empty-state">
                          <img 
                            src="/assets/icons/profile-placeholder.svg" 
                            alt="no posts" 
                            className="w-32 h-32 opacity-30 animate-float"
                          />
                          <div className="text-center">
                            <h3 className="text-xl font-semibold text-light-2 mb-2">Henüz Gönderi Yok</h3>
                            <p className="text-light-4 max-w-md">
                              {currentUser.$id === user.$id 
                                ? "İlk gönderini oluşturarak başla ve içeriklerini paylaş!" 
                                : "Bu kullanıcı henüz içerik paylaşmamış."}
                            </p>
                          </div>
                          {currentUser.$id === user.$id && (
                            <Link to="/create-post">
                              <Button type="button" className="gradient-bg rounded-full px-6 py-2 mt-4">
                                İlk Gönderini Oluştur
                              </Button>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  }
                />
                <Route
                  path="/liked-posts"
                  element={<LikedPosts />}
                />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;