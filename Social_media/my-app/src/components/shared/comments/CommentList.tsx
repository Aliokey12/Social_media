import { Models } from "appwrite";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { timeAgo } from "@/lib/utils";
import { FiHeart, FiMessageCircle, FiX, FiTrash2 } from "react-icons/fi";
import { useUserContext } from "@/context/AuthContext";
import { 
  addCommentReaction, 
  getCommentReactions, 
  removeCommentReaction, 
  getCommentReplies,
  deleteComment 
} from "@/lib/appwrite/api";
import { useToast } from "@/hooks/use-toast";
import EmojiPicker from "./EmojiPicker";
import CommentForm from "./CommentForm";

type CommentListProps = {
  comments: Models.Document[];
  onCommentDeleted?: () => void;
};

const CommentList = ({ comments, onCommentDeleted }: CommentListProps) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);
  const [reactions, setReactions] = useState<{ [key: string]: Models.Document[] }>({});
  const [replies, setReplies] = useState<{ [key: string]: Models.Document[] }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [deletingComments, setDeletingComments] = useState<string[]>([]);

  useEffect(() => {
    const loadCommentData = async () => {
      if (!comments || comments.length === 0) return;
      
      for (const comment of comments) {
        try {
          // Load reactions
          const commentReactions = await getCommentReactions(comment.$id);
          setReactions(prev => ({ ...prev, [comment.$id]: commentReactions.documents }));

          // Load replies
          const commentReplies = await getCommentReplies(comment.$id);
          setReplies(prev => ({ ...prev, [comment.$id]: commentReplies.documents }));
        } catch (error) {
          console.error(`Error loading data for comment ${comment.$id}:`, error);
        }
      }
    };

    loadCommentData();
  }, [comments]);

  const handleReaction = async (commentId: string, emoji: string) => {
    try {
      await addCommentReaction({
        commentId,
        userId: user.id,
        emoji,
      });

      // Refresh reactions
      const updatedReactions = await getCommentReactions(commentId);
      setReactions(prev => ({ ...prev, [commentId]: updatedReactions.documents }));

      // Check if user already had a reaction
      const userHadReaction = reactions[commentId]?.some(reaction => reaction.userId === user.id);
      
      toast({
        title: "Başarılı!",
        description: userHadReaction ? "Tepkiniz güncellendi." : "Tepkiniz eklendi.",
      });
    } catch (error) {
      toast({
        title: "Hata!",
        description: "Tepki eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveReaction = async (commentId: string, emoji: string) => {
    try {
      // Find the user's reaction
      const userReaction = reactions[commentId]?.find(
        reaction => reaction.userId === user.id && reaction.emoji === emoji
      );
      
      if (!userReaction) return;
      
      // Remove the reaction
      await removeCommentReaction(userReaction.$id);
      
      // Refresh reactions
      const updatedReactions = await getCommentReactions(commentId);
      setReactions(prev => ({ ...prev, [commentId]: updatedReactions.documents }));
      
      toast({
        title: "Başarılı!",
        description: "Tepkiniz kaldırıldı.",
      });
    } catch (error) {
      toast({
        title: "Hata!",
        description: "Tepki kaldırılırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    try {
      setDeletingComments(prev => [...prev, commentId]);
      
      await deleteComment(commentId);
      
      toast({
        title: "Başarılı!",
        description: "Yorum başarıyla silindi.",
      });
      
      // Refresh comments list
      if (onCommentDeleted) {
        onCommentDeleted();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Hata!",
        description: "Yorum silinirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setDeletingComments(prev => prev.filter(id => id !== commentId));
    }
  };

  const toggleReplies = async (commentId: string) => {
    if (expandedReplies.includes(commentId)) {
      setExpandedReplies(prev => prev.filter(id => id !== commentId));
    } else {
      setExpandedReplies(prev => [...prev, commentId]);
      
      // Refresh replies when expanding
      setLoading(prev => ({ ...prev, [commentId]: true }));
      try {
        const commentReplies = await getCommentReplies(commentId);
        setReplies(prev => ({ ...prev, [commentId]: commentReplies.documents }));
      } catch (error) {
        console.error(`Error loading replies for comment ${commentId}:`, error);
      } finally {
        setLoading(prev => ({ ...prev, [commentId]: false }));
      }
    }
  };

  const handleCommentAdded = async (commentId: string) => {
    try {
      // Refresh replies
      const updatedReplies = await getCommentReplies(commentId);
      setReplies(prev => ({ ...prev, [commentId]: updatedReplies.documents }));
    } catch (error) {
      console.error(`Error refreshing replies for comment ${commentId}:`, error);
    }
  };

  if (!comments || comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-dark-3 rounded-xl mb-20">
        <img 
          src="/assets/icons/comment-placeholder.svg" 
          alt="no comments" 
          className="w-16 h-16 opacity-30"
        />
        <p className="text-light-4 mt-4 text-center">
          Henüz yorum yapılmamış.
          <br />
          <span className="text-primary-500">İlk yorumu sen yap!</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-light-1 font-semibold text-lg">Yorumlar ({comments.length})</h3>
      
      <div className="space-y-6 relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-dark-4 z-0"></div>

        {comments.map((comment) => {
          const commentUser = comment.user || {};
          const userId = commentUser.$id || comment.userId;
          const userName = commentUser.name || "Kullanıcı";
          const userImage = commentUser.imageUrl || "/assets/icons/profile-placeholder.svg";
          
          const commentReactions = reactions[comment.$id] || [];
          const commentReplies = replies[comment.$id] || [];
          const reactionCount = commentReactions.length;
          
          const isExpanded = expandedReplies.includes(comment.$id);
          const isLoading = loading[comment.$id] || false;
          const isDeleting = deletingComments.includes(comment.$id);
          
          // Check if the current user is the comment owner
          const isCommentOwner = user && userId === user.id;

          return (
            <div key={comment.$id}>
              <div className="group relative bg-dark-3 rounded-2xl p-4 sm:p-5 hover:bg-dark-4 transition-all duration-300">
                {/* Timeline Dot */}
                <div className="absolute -left-[1.4rem] sm:-left-[1.65rem] top-8 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary-500 border-4 border-dark-1 group-hover:scale-125 transition-transform duration-300 z-20" />
                  <div className="absolute w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary-500/30 animate-ping" />
                </div>
                
                {/* Timeline Connector */}
                <div className="absolute -left-[0.7rem] sm:-left-[0.8rem] top-8 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-dark-3 group-hover:bg-dark-4 transition-all duration-300 transform rotate-45 z-10" />
                
                <div className="flex gap-3 sm:gap-4">
                  <Link 
                    to={`/profile/${userId}`}
                    className="shrink-0 relative group/avatar"
                  >
                    <img
                      src={userImage}
                      alt={userName}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-dark-4 group-hover/avatar:border-primary-500 transition-all duration-300"
                    />
                    {commentUser.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-dark-3" />
                    )}
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                      <Link 
                        to={`/profile/${userId}`}
                        className="font-semibold text-light-1 hover:text-primary-500 transition-colors text-sm sm:text-base"
                      >
                        {userName}
                      </Link>
                      <span className="text-light-4 text-xs sm:text-sm">•</span>
                      <span className="text-light-4 text-xs sm:text-sm">
                        {timeAgo(comment.$createdAt)}
                      </span>
                      </div>
                      
                      {isCommentOwner && (
                        <button
                          onClick={() => handleDeleteComment(comment.$id)}
                          disabled={isDeleting}
                          className="text-light-4 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-dark-2"
                          title="Yorumu sil"
                        >
                          {isDeleting ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FiTrash2 size={16} />
                          )}
                        </button>
                      )}
                    </div>
                    
                    <p className="text-light-2 leading-relaxed text-sm sm:text-base break-words">
                      {comment.text}
                    </p>
                    
                    {/* Reactions Display */}
                    <div className="flex flex-wrap items-center gap-3 mt-3 sm:mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReaction(comment.$id, "❤️")}
                          className={`flex items-center justify-center p-1.5 rounded-full transition-colors ${
                            commentReactions.some(r => r.userId === user.id)
                              ? "text-red-500 bg-red-500/10 hover:bg-red-500/20"
                              : "text-light-4 hover:text-red-500 hover:bg-dark-2"
                          }`}
                        >
                          <FiHeart
                            size={16}
                            className={commentReactions.some(r => r.userId === user.id) ? "fill-red-500" : ""}
                          />
                        </button>
                        
                        {reactionCount > 0 && (
                          <span className="text-light-4 text-xs sm:text-sm">
                            {reactionCount}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                            <button
                          onClick={() => toggleReplies(comment.$id)}
                          className={`flex items-center justify-center p-1.5 rounded-full transition-colors ${
                            isExpanded
                              ? "text-primary-500 bg-primary-500/10 hover:bg-primary-500/20"
                              : "text-light-4 hover:text-primary-500 hover:bg-dark-2"
                          }`}
                        >
                          <FiMessageCircle size={16} />
                        </button>
                        
                        {commentReplies.length > 0 && (
                          <span className="text-light-4 text-xs sm:text-sm">
                            {commentReplies.length}
                          </span>
                        )}
                      </div>
                    
                      <EmojiPicker onEmojiSelect={(emoji) => handleReaction(comment.$id, emoji)} />
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="ml-8 sm:ml-12 mt-3 sm:mt-4">
                  <CommentForm 
                    post={comment.post || { $id: comment.postId }}
                    parentId={comment.$id}
                    onCommentAdded={() => handleCommentAdded(comment.$id)} 
                  />
                  
                  {isLoading ? (
                    <div className="flex justify-center py-3 sm:py-4">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : commentReplies.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                      {commentReplies.map((reply) => {
                        const replyUser = reply.user || {};
                        const replyUserId = replyUser.$id || reply.userId;
                        const replyUserName = replyUser.name || "Kullanıcı";
                        const replyUserImage = replyUser.imageUrl || "/assets/icons/profile-placeholder.svg";
                        const isReplyOwner = user && replyUserId === user.id;
                        const isReplyDeleting = deletingComments.includes(reply.$id);

                        return (
                      <div 
                        key={reply.$id}
                            className="bg-dark-4 rounded-xl p-3 sm:p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex gap-2 sm:gap-3 items-start">
                                <Link 
                                  to={`/profile/${replyUserId}`}
                                  className="shrink-0"
                                >
                                  <img
                                    src={replyUserImage}
                                    alt={replyUserName}
                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-dark-3"
                            />
                          </Link>
                                
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                              <Link 
                                      to={`/profile/${replyUserId}`}
                                      className="font-medium text-light-1 hover:text-primary-500 transition-colors text-xs sm:text-sm"
                              >
                                      {replyUserName}
                              </Link>
                                    <span className="text-light-4 text-xs">•</span>
                                    <span className="text-light-4 text-xs">
                                {timeAgo(reply.$createdAt)}
                              </span>
                            </div>
                                  
                                  <p className="text-light-2 text-xs sm:text-sm mt-1 break-words">
                              {reply.text}
                            </p>
                          </div>
                        </div>
                              
                              {isReplyOwner && (
                                <button
                                  onClick={() => handleDeleteComment(reply.$id)}
                                  disabled={isReplyDeleting}
                                  className="text-light-4 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-dark-3"
                                  title="Yanıtı sil"
                                >
                                  {isReplyDeleting ? (
                                    <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <FiTrash2 size={14} />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      </div>
                  ) : (
                    <p className="text-light-4 text-xs sm:text-sm text-center py-3 sm:py-4">
                      Henüz yanıt yok. İlk yanıtı sen yaz!
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommentList; 