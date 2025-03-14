import { Models } from "appwrite";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FiHeart, FiBookmark } from "react-icons/fi";

import { checkIsLiked } from "@/lib/utils";
import {
  useLikePost,
  useSavePost,
  useDeleteSavedPost,
  useGetCurrentUser,
} from "@/lib/react-query/queries";

type PostStatsProps = {
  post: Models.Document;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const location = useLocation();
  
  const likesList = post.likes && Array.isArray(post.likes) 
    ? post.likes.map((user: Models.Document) => user.$id)
    : [];

  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isSaveAnimating, setIsSaveAnimating] = useState(false);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();

  const { data: currentUser } = useGetCurrentUser();

  useEffect(() => {
    const updatedLikesList = post.likes && Array.isArray(post.likes) 
      ? post.likes.map((user: Models.Document) => user.$id)
      : [];
    
    setLikes(updatedLikesList);
  }, [post]);

  const savedPostRecord = currentUser?.save && Array.isArray(currentUser.save)
    ? currentUser.save.find(
        (record: Models.Document) => 
          record && 
          record.post && 
          record.post.$id === post.$id
      )
    : null;

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser, savedPostRecord]);

  const handleLikePost = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();

    if (!userId) return;

    let likesArray = [...likes];
    const isLiked = likesArray.includes(userId);

    if (isLiked) {
      likesArray = likesArray.filter((Id) => Id !== userId);
    } else {
      likesArray.push(userId);
      setIsLikeAnimating(true);
      setTimeout(() => setIsLikeAnimating(false), 1000);
    }

    setLikes(likesArray);
    
    if (!post.$id || typeof post.$id !== 'string') {
      console.error('Invalid post ID:', post.$id);
      return;
    }
    
    likePost({ postId: post.$id, userId });
  };

  const handleSavePost = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();

    if (!userId) return;

    setIsSaveAnimating(true);
    setTimeout(() => setIsSaveAnimating(false), 1000);

    if (savedPostRecord) {
      setIsSaved(false);
      return deleteSavePost(savedPostRecord.$id);
    }

    if (!post.$id || typeof post.$id !== 'string') {
      console.error('Invalid post ID:', post.$id);
      return;
    }
    
    savePost({ userId: userId, postId: post.$id });
    setIsSaved(true);
  };

  const containerStyles = location.pathname.startsWith("/profile")
    ? "w-full"
    : "";

  const isLiked = checkIsLiked(likes, userId);

  return (
    <div className={`flex justify-between items-center z-20 ${containerStyles}`}>
      <div className="flex gap-3 items-center">
        <button
          onClick={handleLikePost}
          className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
            isLiked ? 'text-red-500' : 'text-light-3 hover:text-red-500'
          } ${isLikeAnimating ? 'animate-like-button' : ''}`}
        >
          <FiHeart 
            className={`text-xl transition-all duration-300 ${isLiked ? 'fill-red-500 scale-110' : ''}`} 
          />
        </button>
        <p className={`text-sm font-medium transition-all duration-300 ${isLiked ? 'text-red-500' : 'text-light-2'}`}>
          {likes.length > 0 ? likes.length : ''}
        </p>
      </div>

      <button
        onClick={handleSavePost}
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
          isSaved ? 'text-primary-500' : 'text-light-3 hover:text-primary-500'
        } ${isSaveAnimating ? 'animate-save-button' : ''}`}
      >
        <FiBookmark 
          className={`text-xl transition-all duration-300 ${isSaved ? 'fill-primary-500 scale-110' : ''}`} 
        />
      </button>
    </div>
  );
};

export default PostStats;
