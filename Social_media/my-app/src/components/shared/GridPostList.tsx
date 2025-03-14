import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { FiHeart, FiMessageCircle } from "react-icons/fi";

import { PostStats } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";

type GridPostListProps = {
  posts: Models.Document[];
  showUser?: boolean;
  showStats?: boolean;
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
}: GridPostListProps) => {
  const { user } = useUserContext();

  if (!posts || !Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="flex-center flex-col gap-4 py-10 glass-card animate-fade-in">
        <img 
          src="/assets/icons/profile-placeholder.svg" 
          alt="no posts" 
          className="w-24 h-24 opacity-30"
        />
        <p className="text-light-4 text-center">Henüz gönderi yok</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
      {posts.map((post, index) => {
        if (!post || !post.imageUrl) return null;

        return (
          <li 
            key={post.$id} 
            className="relative group animate-fade-in" 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Link to={`/posts/${post.$id}`} className="block w-full">
              <div className="relative aspect-square overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={post.imageUrl}
                  alt="gönderi"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                
                {/* Caption preview */}
                {post.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-light-1 text-sm line-clamp-2 drop-shadow-md">
                      {post.caption}
                    </p>
                  </div>
                )}

                {/* Stats overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  {/* Top section with user */}
                  {showUser && post.creator && (
                    <div className="flex items-center gap-2 bg-dark-1/50 backdrop-blur-sm p-2 rounded-lg self-start">
                      <img
                        src={
                          post.creator.imageUrl ||
                          "/assets/icons/profile-placeholder.svg"
                        }
                        alt="yaratıcı"
                        className="w-8 h-8 rounded-full border-2 border-primary-500"
                      />
                      <p className="text-light-1 text-sm font-medium line-clamp-1">
                        {post.creator.name}
                      </p>
                    </div>
                  )}
                  
                  {/* Bottom section with stats */}
                  {showStats && user && (
                    <div className="flex justify-between items-center bg-dark-1/50 backdrop-blur-sm p-2 rounded-lg">
                      <div className="flex items-center gap-1">
                        <FiHeart className="text-red-500" />
                        <span className="text-light-1 text-sm">
                          {post.likes ? post.likes.length : 0}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <FiMessageCircle className="text-primary-500" />
                        <span className="text-light-1 text-sm">
                          {post.comments ? post.comments.length : 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default GridPostList;
