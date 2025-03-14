import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUserContext } from '@/context/AuthContext';
import { getConversationMessages, sendMessage, markMessagesAsRead, getUserById } from '@/lib/appwrite/api';
import { Loader } from '@/components/shared';
import { FiArrowLeft, FiSend, FiImage, FiMoreVertical, FiPhone, FiVideo, FiInfo, FiSmile } from 'react-icons/fi';
import { useToast } from '@/hooks/use-toast';
import { Models, Client, Databases } from 'appwrite';
import { appwriteConfig } from '@/lib/appwrite/config';

const client = new Client()
    .setEndpoint(appwriteConfig.url)
    .setProject(appwriteConfig.projectId);

const databases = new Databases(client);

interface Message extends Models.Document {
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  read: boolean;
}

interface OtherUser {
  id: string;
  name: string;
  imageUrl: string;
  isOnline: boolean;
}

const MessageDetail = () => {
  const { conversationId } = useParams();
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Mesajları gruplandırma fonksiyonu
  const groupMessagesByDate = (messages: Message[]) => {
    return messages.reduce((groups: { [key: string]: Message[] }, message) => {
      const date = new Date(message.createdAt).toLocaleDateString('tr-TR');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});
  };

  const messageGroups = groupMessagesByDate(messages);

  useEffect(() => {
    const loadConversationDetails = async () => {
      if (!conversationId || !user?.id) return;
      
      try {
        setLoading(true);
        
        // Konuşma mesajlarını getir
        const messagesData = await getConversationMessages(conversationId);
        setMessages(messagesData as Message[]);
        
        // Konuşma detaylarını getir
        const conversation = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.conversationsCollectionId,
          conversationId
        );
        
        // Diğer kullanıcıyı bul
        const otherUserId = conversation.participantIds.find(
          (id: string) => id !== user.id
        );
        
        if (!otherUserId) {
          throw new Error('Konuşma katılımcısı bulunamadı');
        }
        
        // Diğer kullanıcının bilgilerini getir
        const otherUserDetails = await getUserById(otherUserId);
        
        if (!otherUserDetails) {
          throw new Error('Kullanıcı bilgileri bulunamadı');
        }

        setOtherUser({
          id: otherUserDetails.$id,
          name: otherUserDetails.name,
          imageUrl: otherUserDetails.imageUrl,
          isOnline: otherUserDetails.isOnline || false
        });

        // Okunmamış mesajları kontrol et
        const unreadMessages = messagesData.filter(
          (msg: Message) => !msg.read && msg.senderId === otherUserId
        );
        
        setHasUnreadMessages(unreadMessages.length > 0);
        
        // Okunmamış mesaj varsa, okundu olarak işaretle
        if (unreadMessages.length > 0 && conversationId) {
          await markMessagesAsRead(conversationId, user.id);
        }

      } catch (error) {
        console.error('Error loading conversation details:', error);
        toast({
          title: 'Hata',
          description: error instanceof Error ? error.message : 'Konuşma detayları yüklenirken bir hata oluştu',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadConversationDetails();
    
    // Daha sık güncelleme için interval süresini 5 saniyeye düşürdük
    const interval = setInterval(loadConversationDetails, 5000);
    return () => clearInterval(interval);
  }, [conversationId, user.id, toast]);

  // Sayfa görünür olduğunda mesajları okundu olarak işaretle
  useEffect(() => {
    const markAsRead = async () => {
      if (conversationId && user?.id && hasUnreadMessages) {
        try {
          await markMessagesAsRead(conversationId, user.id);
          setHasUnreadMessages(false);
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      }
    };

    // Sayfa görünür olduğunda çalıştır
    markAsRead();

    // Sayfa görünürlüğü değiştiğinde kontrol et
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        markAsRead();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [conversationId, user?.id, hasUnreadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !conversationId || !otherUser) return;
    
    try {
      setSending(true);
      
      await sendMessage({
        conversationId,
        senderId: user.id,
        receiverId: otherUser.id,
        content: newMessage.trim()
      });
      
      setNewMessage('');
      
      // Mesajı gönderdikten sonra mesajları yenile
      const messagesData = await getConversationMessages(conversationId);
      setMessages(messagesData as Message[]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Hata',
        description: error instanceof Error ? error.message : 'Mesaj gönderilirken bir hata oluştu',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gradient-to-br from-dark-1 to-dark-2">
      {/* Header with glass effect */}
      <div className="backdrop-blur-md bg-dark-2/40 border-b border-glassBorder sticky top-0 z-10 px-4 py-3 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button 
            onClick={() => navigate('/messages')}
            className="p-2.5 rounded-full bg-dark-3/80 hover:bg-dark-4/80 transition-all duration-300"
            aria-label="Geri"
          >
            <FiArrowLeft className="w-5 h-5 text-light-2" />
          </button>
          
          {otherUser && (
            <Link to={`/profile/${otherUser.id}`} className="flex items-center gap-3 flex-1 hover:bg-dark-3/30 p-2 rounded-xl transition-all duration-300">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-500/30 shadow-lg">
                  <img
                    src={otherUser.imageUrl}
                    alt={otherUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {otherUser.isOnline && (
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-accent-3 rounded-full border-2 border-dark-2 shadow-lg" />
                )}
              </div>
              
              <div className="min-w-0">
                <h2 className="font-semibold text-lg text-light-1">{otherUser.name}</h2>
                <p className="text-xs text-light-3">
                  {otherUser.isOnline ? 'Çevrimiçi' : 'Son görülme yakın zamanda'}
                </p>
              </div>
            </Link>
          )}
          
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-full bg-dark-3/80 hover:bg-dark-4/80 transition-all duration-300 hidden sm:flex">
              <FiPhone className="w-5 h-5 text-light-2" />
            </button>
            <button className="p-2.5 rounded-full bg-dark-3/80 hover:bg-dark-4/80 transition-all duration-300 hidden sm:flex">
              <FiVideo className="w-5 h-5 text-light-2" />
            </button>
            <button className="p-2.5 rounded-full bg-dark-3/80 hover:bg-dark-4/80 transition-all duration-300">
              <FiInfo className="w-5 h-5 text-light-2" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-dark-1 to-dark-2">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="p-6 rounded-2xl bg-dark-2/30 backdrop-blur-sm border border-glassBorder flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <Loader />
                </div>
                <p className="text-light-3">Mesajlar yükleniyor...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <div className="p-8 rounded-3xl bg-dark-2/30 backdrop-blur-sm border border-glassBorder flex flex-col items-center shadow-card">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-2/20 flex items-center justify-center mb-6">
                  <FiSend className="w-12 h-12 text-primary-400" />
                </div>
                <h3 className="text-2xl font-semibold text-light-1 mb-3">Henüz mesaj yok</h3>
                <p className="text-light-3 text-center mb-6 max-w-md">
                  {otherUser?.name} ile sohbete başlamak için bir mesaj gönder
                </p>
                <div className="w-32 h-1 bg-gradient-to-r from-primary-500/30 to-accent-2/30 rounded-full"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 pb-4">
              {Object.entries(messageGroups).map(([date, groupMessages]) => (
                <div key={date} className="space-y-6">
                  <div className="flex items-center justify-center">
                    <div className="px-4 py-1.5 rounded-full bg-dark-3/60 backdrop-blur-sm border border-glassBorder shadow-sm">
                      <span className="text-xs text-light-4">{date}</span>
                    </div>
                  </div>
                  
                  {groupMessages.map((message) => {
                    const isCurrentUser = message.senderId === user.id;
                    
                    return (
                      <div 
                        key={message.$id} 
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[75%] rounded-2xl p-4 ${
                            isCurrentUser 
                              ? 'bg-gradient-to-br from-primary-500 to-accent-2 text-white rounded-tr-none shadow-lg' 
                              : 'bg-dark-3/60 backdrop-blur-sm border border-glassBorder text-light-1 rounded-tl-none shadow-md'
                          }`}
                        >
                          <p className="break-words">{message.content}</p>
                          <div className={`flex justify-end mt-1.5 text-xs ${isCurrentUser ? 'text-primary-100/80' : 'text-light-4'}`}>
                            <span>
                              {new Date(message.createdAt).toLocaleTimeString('tr-TR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            {isCurrentUser && (
                              <span className="ml-1.5">
                                {message.read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
      
      {/* Message Input with glass effect */}
      <div className="backdrop-blur-md bg-dark-2/40 border-t border-glassBorder p-4 sticky bottom-0 z-60 shadow-lg mb-16 md:mb-0">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <button 
              type="button"
              className="p-3 rounded-full bg-dark-3/80 hover:bg-dark-4/80 transition-all duration-300"
            >
              <FiSmile className="w-5 h-5 text-light-2" />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Mesaj yaz..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full bg-dark-3/60 backdrop-blur-sm border border-glassBorder rounded-full py-3 px-5 text-light-1 focus:outline-none focus:ring-2 focus:ring-primary-500/50 placeholder:text-light-4"
              />
            </div>
            
            <button 
              type="button"
              className="p-3 rounded-full bg-dark-3/80 hover:bg-dark-4/80 transition-all duration-300"
            >
              <FiImage className="w-5 h-5 text-light-2" />
            </button>
            
            <button 
              type="submit"
              disabled={!newMessage.trim() || sending}
              className={`p-3 rounded-full ${
                !newMessage.trim() || sending
                  ? 'bg-dark-4/80 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-accent-2 hover:shadow-lg'
              } transition-all duration-300`}
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiSend className="w-5 h-5 text-white" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MessageDetail; 