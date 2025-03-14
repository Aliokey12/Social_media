import { Models } from "appwrite";
import { useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { addComment } from "@/lib/appwrite/api";
import { useToast } from "@/hooks/use-toast";
import { FiSend } from "react-icons/fi";

type CommentFormProps = {
  post: Models.Document;
  parentId?: string;
  onCommentAdded?: () => void;
};

const CommentForm = ({ post, parentId, onCommentAdded }: CommentFormProps) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const newComment = await addComment({
        text: comment.trim(),
        postId: post.$id,
        userId: user.id,
        parentId
      });
      
      setComment("");
      toast({
        title: "Başarılı!",
        description: parentId ? "Yanıtınız eklendi." : "Yorumunuz eklendi.",
      });
      
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      toast({
        title: "Hata!",
        description: "Yorum eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`flex items-center gap-3 ${parentId ? 'mt-3' : 'mt-4'} animate-fade-in`}
    >
      <div className="relative">
        <img
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={user.name}
          className="w-9 h-9 rounded-full object-cover border-2 border-primary-500 shadow-md"
        />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-3"></div>
      </div>
      
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder={parentId ? "Yanıtınızı yazın..." : "Yorumunuzu yazın..."}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full glass-input rounded-full py-2.5 px-4 pr-12 text-light-1 placeholder:text-light-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-300 ${
            comment.trim() 
              ? 'gradient-bg hover:opacity-90 shadow-md' 
              : 'bg-dark-3 hover:bg-dark-4'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <FiSend className={`w-5 h-5 ${comment.trim() ? 'text-light-1' : 'text-light-4'}`} />
        </button>
      </div>
    </form>
  );
};

export default CommentForm; 