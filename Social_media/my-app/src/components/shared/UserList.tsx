import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

type UserListProps = {
  users: Models.Document[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
};

const UserList = ({ users, title, isOpen, onClose }: UserListProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-2 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-light-1 text-xl font-bold">{title}</h3>
          <Button 
            onClick={onClose}
            variant="ghost"
            className="text-light-1"
          >
            ✕
          </Button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-light-3 text-center py-4">Henüz kimse yok</p>
          ) : (
            <div className="flex flex-col gap-4">
              {users.map((user) => (
                <Link
                  key={user.$id}
                  to={`/profile/${user.$id}`}
                  className="flex items-center gap-3 hover:bg-dark-4 p-2 rounded-lg transition-all duration-300"
                  onClick={onClose}
                >
                  <img
                    src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-light-1 font-medium">{user.name}</p>
                    <p className="text-light-3 text-sm">@{user.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList; 