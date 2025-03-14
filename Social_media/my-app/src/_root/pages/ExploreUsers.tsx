import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '@/context/AuthContext';
import { getUsers, getOrCreateConversation } from '@/lib/appwrite/api';
import { Loader } from '@/components/shared';
import { FiSearch, FiMessageCircle } from 'react-icons/fi';
import { Models } from 'appwrite';

interface User extends Models.Document {
  name: string;
  username?: string;
  imageUrl?: string;
  $id: string;
}

const ExploreUsers = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await getUsers();
        if (fetchedUsers?.documents) {
          // Filter out the current user
          const otherUsers = fetchedUsers.documents.filter(u => u.$id !== user.id) as User[];
          setUsers(otherUsers);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) {
      loadUsers();
    }
  }, [user.id]);

  const handleStartChat = async (otherUserId: string) => {
    try {
      const conversation = await getOrCreateConversation([user.id, otherUserId]);
      navigate(`/messages/${conversation.$id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-light-1">Kullanıcılar</h1>
      </div>

      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-4" />
        <input
          type="text"
          placeholder="Kullanıcı ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-dark-3 rounded-lg py-3 pl-10 pr-4 text-light-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <Loader />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 bg-dark-3 rounded-xl">
          <FiMessageCircle className="w-16 h-16 text-light-4 opacity-30" />
          <p className="text-light-4 mt-4 text-center">
            {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz kullanıcı yok.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredUsers.map((otherUser) => (
            <div
              key={otherUser.$id}
              className="flex items-center gap-3 p-3 bg-dark-3 rounded-xl hover:bg-dark-4 transition-colors"
            >
              <img
                src={otherUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt={otherUser.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-dark-4"
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-light-1">{otherUser.name}</h3>
                {otherUser.username && (
                  <p className="text-sm text-light-3">@{otherUser.username}</p>
                )}
              </div>

              <button
                onClick={() => handleStartChat(otherUser.$id)}
                className="bg-primary-500 text-white rounded-full p-2 hover:bg-primary-600 transition-colors"
                aria-label="Mesaj gönder"
              >
                <FiMessageCircle className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreUsers; 