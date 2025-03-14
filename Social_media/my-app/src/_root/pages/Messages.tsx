import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserContext } from '@/context/AuthContext';
import { getUserConversations, getTotalUnreadCount } from '@/lib/appwrite/api';
import { timeAgo } from '@/lib/utils';
import { Loader } from '@/components/shared';
import { FiMessageCircle, FiSearch, FiPlus, FiUsers, FiChevronRight, FiEdit, FiBell } from 'react-icons/fi';
import { Models } from 'appwrite';

interface UnreadCountMap {
  [userId: string]: number;
}

interface Conversation {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $collectionId: string;
  $databaseId: string;
  $permissions: string[];
  otherUser: Models.Document;
  lastMessage?: string;
  lastMessageAt: string;
  unreadCount?: UnreadCountMap;
  participantIds?: string[];
  participantNames?: string[];
  participantImages?: string[];
}

const Messages = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const loadConversations = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Konuşmaları getir
        const conversationsData = await getUserConversations(user.id);
        setConversations(conversationsData as Conversation[]);
        
        // Toplam okunmamış mesaj sayısını getir
        const unreadCount = await getTotalUnreadCount(user.id);
        setTotalUnreadMessages(unreadCount);
        
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadConversations();
    
    // Daha sık güncelleme için interval süresini 5 saniyeye düşürdük
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [user?.id, refreshTrigger]);

  // Sayfa görünürlüğü değiştiğinde yenile
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setRefreshTrigger(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const filteredConversations = conversations.filter(conversation => {
    const otherUser = conversation.otherUser;
    return (otherUser.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
           (otherUser.username?.toLowerCase() || '').includes(searchTerm.toLowerCase());
  });

  const getOtherParticipantInfo = (conversation: Conversation) => {
    const otherUser = conversation.otherUser;
    return {
      id: otherUser.$id,
      name: otherUser.name,
      image: otherUser.imageUrl || "/assets/icons/profile-placeholder.svg"
    };
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gradient-to-br from-dark-1 to-dark-2">
      {/* Header with glass effect */}
      <div className="backdrop-blur-md bg-dark-2/40 border-b border-glassBorder sticky top-0 z-10 px-4 py-3 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-light-1">Mesajlar</h1>
          
          <div className="flex items-center gap-3">
            {totalUnreadMessages > 0 && (
              <div className="relative">
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-3 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">{totalUnreadMessages}</span>
                </div>
                <FiBell className="w-6 h-6 text-light-2" />
              </div>
            )}
            
            <button 
              onClick={() => navigate('/explore-users')}
              className="p-2.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-2 hover:shadow-lg transition-all duration-300"
              aria-label="Yeni mesaj"
            >
              <FiEdit className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Search bar with glass effect */}
      <div className="backdrop-blur-sm bg-dark-2/20 border-b border-glassBorder px-4 py-3 sticky top-16 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-light-3 w-5 h-5" />
            <input
              type="text"
              placeholder="Konuşma ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-3/60 backdrop-blur-sm border border-glassBorder rounded-full py-3 pl-12 pr-5 text-light-1 focus:outline-none focus:ring-2 focus:ring-primary-500/50 placeholder:text-light-4"
            />
          </div>
        </div>
      </div>
      
      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="p-6 rounded-2xl bg-dark-2/30 backdrop-blur-sm border border-glassBorder flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <Loader />
                </div>
                <p className="text-light-3">Konuşmalar yükleniyor...</p>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-6">
              <div className="p-8 rounded-3xl bg-dark-2/30 backdrop-blur-sm border border-glassBorder flex flex-col items-center shadow-card">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-2/20 flex items-center justify-center mb-6">
                  <FiMessageCircle className="w-12 h-12 text-primary-400" />
                </div>
                <h3 className="text-2xl font-semibold text-light-1 mb-3">
                  {searchTerm ? 'Konuşma bulunamadı' : 'Henüz mesaj yok'}
                </h3>
                <p className="text-light-3 text-center mb-6 max-w-md">
                  {searchTerm 
                    ? 'Arama kriterlerinize uygun konuşma bulunamadı'
                    : 'Yeni bir konuşma başlatmak için sağ üstteki + butonuna tıklayın'
                  }
                </p>
                <div className="w-32 h-1 bg-gradient-to-r from-primary-500/30 to-accent-2/30 rounded-full"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConversations.map((conversation) => {
                const otherUser = getOtherParticipantInfo(conversation);
                
                return (
                  <Link
                    key={conversation.$id}
                    to={`/messages/${conversation.$id}`}
                    className="block"
                  >
                    <div className="p-4 rounded-2xl bg-dark-2/30 backdrop-blur-sm border border-glassBorder hover:bg-dark-3/40 transition-all duration-300 shadow-card">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary-500/30 shadow-lg">
                            <img
                              src={otherUser.image}
                              alt={otherUser.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {conversation.unreadCount && conversation.unreadCount[user.id] > 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent-3 flex items-center justify-center border-2 border-dark-2">
                              <span className="text-xs font-medium text-white">{conversation.unreadCount[user.id]}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-lg text-light-1 truncate">{otherUser.name}</h3>
                            <span className="text-xs text-light-3 whitespace-nowrap ml-2">
                              {timeAgo(conversation.lastMessageAt)}
                            </span>
                          </div>
                          <p className={`text-sm truncate ${conversation.unreadCount && conversation.unreadCount[user.id] > 0 ? 'text-light-1 font-medium' : 'text-light-3'}`}>
                            {conversation.lastMessage || 'Henüz mesaj yok'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages; 