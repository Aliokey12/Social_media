import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { FaMapMarkerAlt } from "react-icons/fa";

import { PostStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";

type PostCardProps = {
  post: Models.Document;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();

  if (!post || !post.creator) return null;

  return (
    <div className="post-card bg-dark-2 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex-between p-5">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.creator.$id}`}>
            <img
              src={
                post.creator?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="yaratıcı"
              className="w-12 h-12 rounded-full object-cover border-2 border-primary-500"
            />
          </Link>

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {post.creator.name}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular">
                {multiFormatDateString(post.$createdAt)}
              </p>
              {post.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-secondary-500 text-xs" />
                    <p className="subtle-semibold lg:small-regular">
                      {post.location}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {user && post.creator && user.id === post.creator.$id && (
          <Link
            to={`/update-post/${post.$id}`}
            className="p-2 rounded-full hover:bg-dark-3 transition-all duration-300">
            <FiEdit2 className="text-light-3 hover:text-primary-500" size={18} />
          </Link>
        )}
      </div>

      <Link to={`/posts/${post.$id}`}>
        <div className="px-5 pb-3">
          <p className="text-light-1">{post.caption}</p>
          {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1 mt-2">
              {post.tags.map((tag: string, index: number) => (
                <li key={`${tag}${index}`} className="text-primary-500 text-sm hover:text-primary-600 transition-all duration-300">
                  #{tag}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative w-full aspect-video overflow-hidden">
          <img
            src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="gönderi resmi"
            className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
          />
        </div>
      </Link>

      <div className="p-5 pt-3">
        {user && <PostStats post={post} userId={user.id} />}
      </div>
    </div>
  );
};

export default PostCard;
