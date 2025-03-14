import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { FiUserPlus, FiUserCheck } from "react-icons/fi";
import { useState } from "react";

import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";

type UserCardProps = {
  user: Models.Document;
};

const UserCard = ({ user }: UserCardProps) => {
  const { user: currentUser } = useUserContext();
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Takip etme işlevi buraya eklenebilir
    setIsFollowing(!isFollowing);
    console.log("Takip et butonuna tıklandı:", user.username);
  };

  // Kullanıcı kendisini takip edemez
  const isOwnProfile = currentUser.id === user.$id;

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl hover:bg-dark-3/50 transition-all duration-300 animate-fade-in">
      <Link to={`/profile/${user.$id}`} className="flex items-center gap-3">
        <div className="relative">
          <img
            src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="yaratıcı"
            className="rounded-full w-12 h-12 object-cover border-2 border-primary-500 hover:border-primary-600 transition-all duration-300 shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-2"></div>
        </div>

        <div className="flex flex-col">
          <p className="font-semibold text-light-1 line-clamp-1 hover:text-primary-500 transition-colors duration-200">
            {user.name}
          </p>
          <p className="text-xs text-light-3 line-clamp-1">
            @{user.username}
          </p>
          {user.bio && (
            <p className="text-xs text-light-4 line-clamp-1 mt-1 max-w-[180px]">
              {user.bio}
            </p>
          )}
        </div>
      </Link>

      {!isOwnProfile && (
        <Button 
          type="button" 
          size="sm" 
          onClick={handleFollowClick}
          className={`${isFollowing 
            ? "bg-dark-4 hover:bg-dark-3 text-light-2" 
            : "gradient-bg hover:opacity-90 text-light-1"} 
            rounded-full px-3 py-0.5 text-xs flex items-center gap-1.5 transition-all duration-300 self-end shadow-md`}>
          {isFollowing ? (
            <>
              <FiUserCheck className="text-xs" />
              <span>Takip Ediliyor</span>
            </>
          ) : (
            <>
              <FiUserPlus className="text-xs" />
              <span>Takip Et</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default UserCard;
