import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { FiEdit2, FiMessageCircle } from "react-icons/fi";
import { FaMapMarkerAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import { timeAgo } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { getPostComments } from "@/lib/appwrite/api";
import PostStats from "./PostStats";
import { CommentForm, CommentList } from "./comments";

type PostCardProps = {
  post: Models.Document;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Models.Document[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const loadComments = async () => {
    if (!showComments) return;
    
    try {
      setIsLoadingComments(true);
      const commentsData = await getPostComments(post.$id);
      setComments(commentsData.documents);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [showComments]);

  if (!post || !post.creator) return null;

  const isPostCreator = user && post.creator && user.id === post.creator.$id;

  return (
    <div className="glass-card rounded-2xl  border-y-2 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in">
      <div className="flex-between p-5">
        <div className="flex items-center gap-4">
          <Link 
            to={`/profile/${post.creator.$id}`}
            className="hover:opacity-90 transition-opacity duration-200 relative group">
            <img
              src={
                post.creator?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="yaratıcı"
              className="w-12 h-12 rounded-full object-cover border-2 border-primary-500 group-hover:border-primary-600 transition-all duration-300"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-2 animate-pulse"></div>
          </Link>

          <div className="flex flex-col">
            <Link 
              to={`/profile/${post.creator.$id}`}
              className="font-semibold text-light-1 hover:text-primary-500 transition-colors duration-200">
              {post.creator.name}
            </Link>
            <div className="flex items-center gap-2 text-light-3 text-sm">
              <p className="text-xs">
                {timeAgo(post.$createdAt)}
              </p>
              {post.location && (
                <>
                  <span className="text-primary-500">•</span>
                  <div className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-primary-500 text-xs" />
                    <p className="text-xs">
                      {post.location}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {isPostCreator && (
          <Link
            to={`/update-post/${post.$id}`}
            className="p-2 rounded-full hover:bg-dark-3/50 transition-all duration-300 group">
            <FiEdit2 className="text-light-3 group-hover:text-primary-500 transition-colors duration-300" size={20} />
          </Link>
        )}
      </div>

      <Link 
        to={`/posts/${post.$id}`}
        className="block">
        <div className="px-5 pb-4">
          <p className="text-light-1 text-base leading-relaxed">{post.caption}</p>
          {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((tag: string, index: number) => (
                <li 
                  key={`${tag}${index}`} 
                  className="gradient-bg-light text-light-1 text-sm px-3 py-1 rounded-full hover:opacity-90 transition-all duration-300">
                  #{tag}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative overflow-hidden mt-3">
          <img
            src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="gönderi resmi"
            className="w-full h-96 object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
      </Link>

      <div className="p-5">
        {user && <PostStats post={post} userId={user.id} />}
        
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-light-3 hover:text-primary-500 transition-colors mt-4 text-sm"
        >
          <FiMessageCircle className={`${showComments ? 'text-primary-500' : ''}`} />
          {showComments ? "Yorumları Gizle" : "Yorumları Göster"}
        </button>

        {showComments && (
          <div className="mt-4 bg-dark-3/30 p-4 rounded-xl">
            <CommentForm post={post} onCommentAdded={loadComments} />
            {isLoadingComments ? (
              <div className="text-light-4 text-center py-4">
                <div className="loader-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            ) : (
              <CommentList 
                comments={comments} 
                onCommentDeleted={loadComments}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
