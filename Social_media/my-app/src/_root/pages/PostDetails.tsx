import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui";
import { Loader } from "@/components/shared";
import { GridPostList, PostStats } from "@/components/shared";
import { CommentForm, CommentList } from "@/components/shared/comments";

import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { getPostComments } from "@/lib/appwrite/api";

// Define the Post type to fix TypeScript errors
interface Post {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $collectionId: string;
  $databaseId: string;
  $permissions: string[];
  caption: string;
  imageUrl: string;
  imageId: string;
  location?: string;
  tags: string[];
  creator: {
    $id: string;
    name: string;
    imageUrl: string;
  };
  likes: { $id: any }[];
}

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useUserContext();
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const { data: postData, isLoading, isError } = useGetPostById(id);
  const post = postData as Post | undefined;
  
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator?.$id
  );
  const { mutate: deletePost } = useDeletePost();

  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  );

  const handleDeletePost = () => {
    if (id && post?.imageId) {
      deletePost({ postId: id, imageId: post.imageId });
      navigate(-1);
    }
  };

  const loadComments = async () => {
    if (!id) return;
    
    try {
      setIsLoadingComments(true);
      const commentsData = await getPostComments(id);
      setComments(commentsData.documents);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadComments();
    }
  }, [id]);

  if (isError) {
    return (
      <div className="flex-center w-full h-full flex-col">
        <p className="text-light-1 mt-10 text-center">Gönderi yüklenirken bir hata oluştu.</p>
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost mt-4">
          <p className="small-medium lg:base-medium">Geri Dön</p>
        </Button>
      </div>
    );
  }

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost">
          <img
            src={"/assets/icons/back.svg"}
            alt="geri"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Geri</p>
        </Button>
      </div>

      {isLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <img
            src={post.imageUrl}
            alt="yaratıcı"
            className="post_details-img"
          />

          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post.creator.$id}`}
                className="flex items-center gap-3">
                <img
                  src={
                    post.creator.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="yaratıcı"
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post.creator.name}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular ">
                      {multiFormatDateString(post.$createdAt)}
                    </p>
                    •
                    <p className="subtle-semibold lg:small-regular">
                      {post.location}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex-center gap-4">
                <Link
                  to={`/update-post/${post.$id}`}
                  className={`${user.id !== post.creator.$id && "hidden"}`}>
                  <img
                    src={"/assets/icons/edit.svg"}
                    alt="düzenle"
                    width={24}
                    height={24}
                  />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`post_details-delete_btn ${
                    user.id !== post.creator.$id && "hidden"
                  }`}>
                  <img
                    src={"/assets/icons/delete.svg"}
                    alt="sil"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post.tags.map((tag: string, index: number) => (
                  <li
                    key={`${tag}${index}`}
                    className="text-light-3 small-regular">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full">
              <PostStats post={post} userId={user.id} />
            </div>
            
            {/* Comments Section */}
            <div className="w-full mt-6 bg-dark-3/30 p-4 rounded-xl">
              <h3 className="text-light-1 font-semibold text-lg mb-4">Yorumlar</h3>
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
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          Daha Fazla İlgili Gönderi
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;
