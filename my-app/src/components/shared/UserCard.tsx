import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { FiUserPlus } from "react-icons/fi";

import { Button } from "../ui/button";

type UserCardProps = {
  user: Models.Document;
};

const UserCard = ({ user }: UserCardProps) => {
  return (
    <Link to={`/profile/${user.$id}`} className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-dark-3 transition-all duration-300">
      <div className="flex items-center gap-3">
        <img
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="yaratıcı"
          className="rounded-full w-12 h-12 object-cover border-2 border-primary-500"
        />

        <div className="flex flex-col">
          <p className="base-medium text-light-1 line-clamp-1">
            {user.name}
          </p>
          <p className="small-regular text-light-3 line-clamp-1">
            @{user.username}
          </p>
        </div>
      </div>

      <Button 
        type="button" 
        size="sm" 
        className="bg-primary-500 hover:bg-primary-600 text-light-1 rounded-full px-4 py-1 flex items-center gap-1 transition-all duration-300">
        <FiUserPlus className="text-sm" />
        <span>Takip Et</span>
      </Button>
    </Link>
  );
};

export default UserCard;
