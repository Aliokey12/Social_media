import { ID, Query, Models } from "appwrite";
import { appwriteConfig, account, databases, storage, avatars } from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser } from "@/types";

interface UnreadCountMap {
  [key: string]: number;
}

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw new Error('Failed to create a new account');

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.error('An error occurred during account creation:', error);
    throw error;
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.error('An error occurred while saving the user to the database:', error);
    throw error;
  }
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string; }) {
  try {
    const session = await account.createEmailSession(user.email, user.password);
    return session;
  } catch (error) {
    console.error('An error occurred during sign in:', error);
    throw error;
  }
}

// ============================== PASSWORD RECOVERY
export async function requestPasswordRecovery(email: string) {
  try {
    // Use the current domain as the redirect URL
    const redirectUrl = `${window.location.origin}/reset-password`;
    const recovery = await account.createRecovery(email, redirectUrl);
    return recovery;
  } catch (error) {
    console.error('An error occurred during password recovery request:', error);
    throw error;
  }
}

// ============================== COMPLETE PASSWORD RECOVERY
export async function completePasswordRecovery(userId: string, secret: string, newPassword: string) {
  try {
    const response = await account.updateRecovery(userId, secret, newPassword, newPassword);
    return response;
  } catch (error) {
    console.error('An error occurred during password recovery completion:', error);
    throw error;
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== SIGN OUT
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      "top",
      100
    );

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    // Her post için beğenileri ve creator bilgilerini getir
    const postsWithDetails = await Promise.all(
      posts.documents.map(async (post) => {
        try {
          // Beğenileri getir
          const likes = await databases.listDocuments(
            appwriteConfig.databaseId,
            "likes",
            [Query.equal("post", post.$id)]
          );

          // Creator bilgilerini getir
          let creator = post.creator;
          
          // Eğer creator bir ID ise, kullanıcı bilgilerini getir
          if (typeof post.creator === 'string') {
            try {
              creator = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                post.creator
              );
            } catch (creatorError) {
              console.error('Error fetching creator for post:', post.$id, creatorError);
              // Creator bilgisi alınamazsa, mevcut creator değerini kullan
            }
          }

          return {
            ...post,
            creator,
            likes: likes.documents.map(like => ({ $id: like.user }))
          };
        } catch (error) {
          console.error('Error processing post:', post.$id, error);
          // Hata durumunda orijinal post'u dön
          return post;
        }
      })
    );

    return { ...posts, documents: postsWithDetails };
  } catch (error) {
    console.error('Error in searchPosts:', error);
    throw new Error("Failed to search posts");
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    // Her post için beğenileri getir
    const postsWithLikes = await Promise.all(
      posts.documents.map(async (post) => {
        try {
          // Beğenileri getir
          const likes = await databases.listDocuments(
            appwriteConfig.databaseId,
            "likes",
            [Query.equal("post", post.$id)]
          );

          // Creator bilgilerini getir
          let creator = post.creator;
          
          // Eğer creator bir ID ise, kullanıcı bilgilerini getir
          if (typeof post.creator === 'string') {
            try {
              creator = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                post.creator
              );
            } catch (creatorError) {
              console.error('Error fetching creator for post:', post.$id, creatorError);
              // Creator bilgisi alınamazsa, mevcut creator değerini kullan
            }
          }

          return {
            ...post,
            creator,
            likes: likes.documents.map(like => ({ $id: like.user }))
          };
        } catch (error) {
          console.error('Error processing post:', post.$id, error);
          // Hata durumunda orijinal post'u dön
          return post;
        }
      })
    );

    return { ...posts, documents: postsWithLikes };
  } catch (error) {
    console.error('Error in getInfinitePosts:', error);
    throw new Error("Failed to get infinite posts");
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  // Ensure postId is a valid string
  if (!postId || typeof postId !== 'string') {
    console.error('Invalid postId:', postId);
    throw new Error("Post ID is required and must be a string");
  }

  // Check if postId is an object that was accidentally stringified
  if (postId.includes('[object Object]')) {
    console.error('postId contains [object Object]:', postId);
    throw new Error("Invalid Post ID format");
  }

  try {
    console.log('Fetching post with ID:', postId);
    
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw new Error("Post not found");

    // Get the creator details - ensure creator is a string ID
    let creator;
    if (post.creator && typeof post.creator === 'string') {
      try {
        creator = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          post.creator
        );
      } catch (creatorError) {
        console.error('Error fetching creator for post:', post.$id, creatorError);
        // If we can't fetch the creator, use the creator ID as is
        creator = { $id: post.creator };
      }
    } else if (post.creator && typeof post.creator === 'object' && post.creator.$id) {
      // If creator is already an object with $id, use it directly
      creator = post.creator;
    } else {
      console.error('Invalid creator format:', post.creator);
      // Create a placeholder creator object
      creator = { $id: 'unknown', name: 'Unknown User' };
    }

    // Get likes
    const likes = await databases.listDocuments(
      appwriteConfig.databaseId,
      "likes",
      [Query.equal("post", postId)]
    );

    // Add likes and creator to the post object
    return {
      ...post,
      creator,
      likes: likes.documents.map(like => ({ $id: like.user }))
    };
  } catch (error) {
    console.error('Error in getPostById:', error);
    throw new Error("Failed to get post by ID");
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    //  Update post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    // Önce gönderiyi getir
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    // Mevcut kullanıcıyı getir
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error("Kullanıcı oturumu bulunamadı");
    }

    // Gönderiyi oluşturan kişi ile mevcut kullanıcıyı karşılaştır
    let creatorId = post.creator;
    if (typeof creatorId === 'object' && creatorId.$id) {
      creatorId = creatorId.$id;
    }

    if (currentUser.$id !== creatorId) {
      throw new Error("Bu gönderiyi silme yetkiniz yok");
    }

    // Gönderiyi sil
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    // Gönderi resmini sil
    await deleteFile(imageId);

    // Gönderiyle ilişkili tüm yorumları sil
    const comments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [Query.equal("postId", postId)]
    );

    // Tüm yorumları sil
    for (const comment of comments.documents) {
      await deleteComment(comment.$id);
    }

    // Gönderiyle ilişkili tüm beğenileri sil
    const likes = await databases.listDocuments(
      appwriteConfig.databaseId,
      "likes",
      [Query.equal("post", postId)]
    );

    // Tüm beğenileri sil
    for (const like of likes.documents) {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        "likes",
        like.$id
      );
    }

    return { status: "Ok" };
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, userId: string) {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    // Önce kullanıcının bu postu daha önce beğenip beğenmediğini kontrol et
    const existingLikes = await databases.listDocuments(
      appwriteConfig.databaseId,
      "likes",
      [
        Query.equal("post", postId),
        Query.equal("user", userId)
      ]
    );

    // Eğer kullanıcı daha önce beğenmişse, beğeniyi kaldır
    if (existingLikes.documents.length > 0) {
      const likeId = existingLikes.documents[0].$id;
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        "likes",
        likeId
      );
      
      return { status: "unliked" };
    }

    // Beğeni işlemi
    const like = await databases.createDocument(
      appwriteConfig.databaseId,
      "likes",
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    // Bildirim oluştur (eğer post sahibi beğenen kişi değilse)
    if (post && post.creator && post.creator.$id && post.creator.$id !== userId) {
      try {
        const user = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          userId
        );

        await createNotification(
          post.creator.$id,
          'like',
          userId,
          user.name,
          user.imageUrl,
          postId
        );
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Continue even if notification creation fails
      }
    }

    return like;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}
// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!posts) throw Error;

    // Her post için beğenileri getir
    const postsWithLikes = await Promise.all(
      posts.documents.map(async (post) => {
        try {
          // Beğenileri getir
          const likes = await databases.listDocuments(
            appwriteConfig.databaseId,
            "likes",
            [Query.equal("post", post.$id)]
          );

          // Creator bilgilerini getir
          let creator = post.creator;
          
          // Eğer creator bir ID ise, kullanıcı bilgilerini getir
          if (typeof post.creator === 'string') {
            try {
              creator = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                post.creator
              );
            } catch (creatorError) {
              console.error('Error fetching creator for post:', post.$id, creatorError);
              // Creator bilgisi alınamazsa, mevcut creator değerini kullan
            }
          }

          return {
            ...post,
            creator,
            likes: likes.documents.map(like => ({ $id: like.user }))
          };
        } catch (error) {
          console.error('Error processing post:', post.$id, error);
          // Hata durumunda orijinal post'u dön
          return post;
        }
      })
    );

    return { ...posts, documents: postsWithLikes };
  } catch (error) {
    console.error('Error in getUserPosts:', error);
    throw new Error("Failed to get user posts");
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw Error;

    // Her post için beğenileri getir
    const postsWithLikes = await Promise.all(
      posts.documents.map(async (post) => {
        try {
          // Beğenileri getir
          const likes = await databases.listDocuments(
            appwriteConfig.databaseId,
            "likes",
            [Query.equal("post", post.$id)]
          );

          // Creator bilgilerini getir
          let creator = post.creator;
          
          // Eğer creator bir ID ise, kullanıcı bilgilerini getir
          if (typeof post.creator === 'string') {
            try {
              creator = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                post.creator
              );
            } catch (creatorError) {
              console.error('Error fetching creator for post:', post.$id, creatorError);
              // Creator bilgisi alınamazsa, mevcut creator değerini kullan
            }
          }

          return {
            ...post,
            creator,
            likes: likes.documents.map(like => ({ $id: like.user }))
          };
        } catch (error) {
          console.error('Error processing post:', post.$id, error);
          // Hata durumunda orijinal post'u dön
          return post;
        }
      })
    );

    return { ...posts, documents: postsWithLikes };
  } catch (error) {
    console.error('Error in getRecentPosts:', error);
    throw new Error("Failed to get recent posts");
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  try {
    if (!userId) {
      console.error('getUserById: userId is empty or undefined');
      throw new Error('Kullanıcı ID\'si belirtilmedi');
    }

    console.log('Getting user with ID:', userId);

    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    ).catch(error => {
      console.error('Appwrite error in getUserById:', error);
      if (error.code === 404) {
        throw new Error('Kullanıcı bulunamadı');
      }
      throw error;
    });

    if (!user) {
      console.error('User not found for ID:', userId);
      throw new Error('Kullanıcı bulunamadı');
    }

    console.log('Successfully found user:', user.$id);
    return user;
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw error;
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    //  Update user
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

// Comment related functions
export async function addComment({ text, postId, userId, parentId }: {
  text: string;
  postId: string;
  userId: string;
  parentId?: string;
}) {
  try {
    const newComment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      ID.unique(),
      {
        text,
        postId,
        userId,
        parentId: parentId || null,
        isReply: !!parentId
      }
    );

    // Get user details for the new comment
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    // Get post details to create notification
    try {
      const post = await getPostById(postId);
      
      // Only create notification if the commenter is not the post creator
      if (post && post.creator && post.creator.$id && post.creator.$id !== userId) {
        try {
          await createNotification(
            post.creator.$id,
            'comment',
            userId,
            user.name,
            user.imageUrl,
            postId
          );
        } catch (notificationError) {
          console.error("Error creating comment notification:", notificationError);
          // Continue even if notification creation fails
        }
      }
    } catch (postError) {
      console.error("Error fetching post for comment notification:", postError);
      // Continue without creating notification if post fetch fails
    }

    return { ...newComment, user };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}

export async function getPostComments(postId: string) {
  try {
    const comments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [
        Query.equal("postId", postId),
        Query.orderDesc("$createdAt"),
        Query.limit(100)
      ]
    );

    if (comments.documents.length === 0) {
      return comments;
    }

    // Get user details for each comment using a single query
    const userIds = [...new Set(comments.documents.map(comment => comment.userId))];
    
    let usersMap: { [key: string]: Models.Document } = {};
    if (userIds.length > 0) {
      try {
        // Filter out any non-string IDs
        const validUserIds = userIds.filter(id => typeof id === 'string');
        
        if (validUserIds.length > 0) {
          const usersQuery = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("$id", validUserIds)]
          );

          // Create a map of users for faster lookup
          usersMap = usersQuery.documents.reduce((acc: { [key: string]: Models.Document }, user) => {
            if (user && user.$id) {
              acc[user.$id] = user;
            }
            return acc;
          }, {});
        }
      } catch (error) {
        console.error('Error fetching users for comments:', error);
      }
    }

    // Combine comments with user data
    const commentsWithUser = comments.documents.map(comment => {
      let user = null;
      
      if (comment.userId && typeof comment.userId === 'string' && usersMap[comment.userId]) {
        user = usersMap[comment.userId];
      } else if (comment.userId && typeof comment.userId === 'object' && comment.userId.$id) {
        // If userId is already an object with $id
        user = comment.userId;
      }
      
      return {
        ...comment,
        user
      };
    });

    return { ...comments, documents: commentsWithUser };
  } catch (error) {
    console.error("Error getting comments:", error);
    throw error;
  }
}

// Comment reactions
export async function addCommentReaction({ 
  commentId, 
  userId, 
  emoji 
}: { 
  commentId: string; 
  userId: string; 
  emoji: string; 
}) {
  try {
    // Check if user already reacted to this comment
    const existingReactions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentReactionsCollectionId,
      [
        Query.equal("commentId", commentId),
        Query.equal("userId", userId)
      ]
    );

    // If user already reacted, update the existing reaction
    if (existingReactions.documents.length > 0) {
      const existingReaction = existingReactions.documents[0];
      
      // If the same emoji, just return the existing reaction
      if (existingReaction.emoji === emoji) {
        return existingReaction;
      }
      
      // Otherwise, update the emoji
      const updatedReaction = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.commentReactionsCollectionId,
        existingReaction.$id,
        {
          emoji
        }
      );
      
      return updatedReaction;
    }
    
    // If no existing reaction, create a new one
    const reaction = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentReactionsCollectionId,
      ID.unique(),
      {
        commentId,
        userId,
        emoji,
      }
    );

    return reaction;
  } catch (error) {
    console.error("Error adding reaction:", error);
    throw error;
  }
}

export async function removeCommentReaction(reactionId: string) {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentReactionsCollectionId,
      reactionId
    );

    return { status: "ok" };
  } catch (error) {
    console.error("Error removing reaction:", error);
    throw error;
  }
}

export async function getCommentReactions(commentId: string) {
  try {
    const reactions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentReactionsCollectionId,
      [Query.equal("commentId", commentId)]
    );

    return reactions;
  } catch (error) {
    console.error("Error getting reactions:", error);
    throw error;
  }
}

// Comment replies
export async function getCommentReplies(parentId: string) {
  try {
    const replies = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [
        Query.equal("parentId", parentId),
        Query.equal("isReply", true),
        Query.orderDesc("$createdAt")
      ]
    );

    if (replies.documents.length === 0) {
      return replies;
    }

    // Get user details for each reply using a single query
    const userIds = [...new Set(replies.documents.map(reply => reply.userId))];
    
    let usersMap: { [key: string]: Models.Document } = {};
    if (userIds.length > 0) {
      try {
        // Filter out any non-string IDs
        const validUserIds = userIds.filter(id => typeof id === 'string');
        
        if (validUserIds.length > 0) {
          const usersQuery = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("$id", validUserIds)]
          );

          // Create a map of users for faster lookup
          usersMap = usersQuery.documents.reduce((acc: { [key: string]: Models.Document }, user) => {
            if (user && user.$id) {
              acc[user.$id] = user;
            }
            return acc;
          }, {});
        }
      } catch (error) {
        console.error('Error fetching users for replies:', error);
      }
    }

    // Combine replies with user data
    const repliesWithUser = replies.documents.map(reply => {
      let user = null;
      
      if (reply.userId && typeof reply.userId === 'string' && usersMap[reply.userId]) {
        user = usersMap[reply.userId];
      } else if (reply.userId && typeof reply.userId === 'object' && reply.userId.$id) {
        // If userId is already an object with $id
        user = reply.userId;
      }
      
      return {
        ...reply,
        user
      };
    });

    return { ...replies, documents: repliesWithUser };
  } catch (error) {
    console.error("Error getting replies:", error);
    throw error;
  }
}

// ============================================================
// MESSAGES
// ============================================================

// Create a new conversation or get existing one
export async function getOrCreateConversation(participants: string[]) {
  try {
    // Sort participant IDs to ensure consistent conversation lookup
    const sortedParticipants = [...participants].sort();
    
    // Check if conversation already exists by checking if both participants are in the array
    const conversations = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      [
        Query.search('participantIds', sortedParticipants[0]),
        Query.search('participantIds', sortedParticipants[1])
      ]
    );
    
    // Find the conversation that has exactly these two participants
    const existingConversation = conversations.documents.find(conv => 
      conv.participantIds.length === 2 &&
      conv.participantIds.includes(sortedParticipants[0]) &&
      conv.participantIds.includes(sortedParticipants[1])
    );
    
    // If conversation exists, return it
    if (existingConversation) {
      return existingConversation;
    }
    
    // Create new conversation
    const newConversation = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      ID.unique(),
      {
        participantIds: sortedParticipants,
        lastMessageAt: new Date().toISOString(),
        lastMessage: '',
        unreadCount: JSON.stringify({
          [sortedParticipants[0]]: 0,
          [sortedParticipants[1]]: 0
        })
      }
    );
    
    return newConversation;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Get all conversations for a user
export async function getUserConversations(userId: string) {
  try {
    const conversations = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      [
        Query.search('participantIds', userId),
        Query.orderDesc('lastMessageAt')
      ]
    );
    
    // Populate user details for each conversation
    const populatedConversations = await Promise.all(
      conversations.documents.map(async (conversation) => {
        // Find the other participant (not the current user)
        const otherParticipantId = conversation.participantIds.find(
          (id: string) => id !== userId
        );
        
        // Get the other participant's details
        const otherUser = await getUserById(otherParticipantId);

        // Parse unreadCount from JSON string
        let unreadCount: UnreadCountMap = {};
        try {
          unreadCount = JSON.parse(conversation.unreadCount || '{}');
        } catch (e) {
          console.error('Error parsing unreadCount:', e);
        }
        
        return {
          ...conversation,
          unreadCount,
          otherUser
        };
      })
    );
    
    return populatedConversations;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Send a message
export async function sendMessage({ 
  conversationId, 
  senderId, 
  receiverId, 
  content,
  attachmentUrl = '' 
}: {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachmentUrl?: string;
}) {
  try {
    // Validate input parameters
    if (!receiverId) {
      console.error('sendMessage: receiverId is empty');
      throw new Error('Alıcı ID\'si belirtilmedi');
    }

    if (!content.trim()) {
      console.error('sendMessage: content is empty');
      throw new Error('Mesaj içeriği boş olamaz');
    }

    console.log('Sending message to receiver:', receiverId);

    // Check if receiver exists
    const receiver = await getUserById(receiverId).catch(error => {
      console.error('Error getting receiver in sendMessage:', error);
      throw new Error('Alıcı bulunamadı');
    });

    if (!receiver) {
      console.error('Receiver not found:', receiverId);
      throw new Error('Alıcı bulunamadı');
    }

    console.log('Found receiver:', receiver.$id);

    // Get the conversation first to validate it exists
    const conversation = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      conversationId
    ).catch(error => {
      console.error('Error getting conversation:', error);
      throw new Error('Konuşma bulunamadı');
    });

    if (!conversation) {
      console.error('Conversation not found:', conversationId);
      throw new Error('Konuşma bulunamadı');
    }

    // Create the message
    const message = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      ID.unique(),
      {
        conversationId,
        senderId,
        receiverId,
        content,
        attachmentUrl,
        read: false,
        createdAt: new Date().toISOString()
      }
    );
    
    // Parse current unreadCount and clean up any invalid entries
    let unreadCount: UnreadCountMap = {};
    try {
      const parsedUnreadCount = JSON.parse(conversation.unreadCount || '{}') as Record<string, number>;
      // Only keep valid user IDs
      Object.entries(parsedUnreadCount).forEach(([key, value]) => {
        if (key && key.trim() && conversation.participantIds.includes(key)) {
          unreadCount[key] = value;
        }
      });
    } catch (e) {
      console.error('Error parsing unreadCount:', e);
      // Initialize with zero counts for both participants
      conversation.participantIds.forEach((id: string) => {
        unreadCount[id] = 0;
      });
    }
    
    // Increment unread count for receiver
    unreadCount[receiverId] = (unreadCount[receiverId] || 0) + 1;
    
    // Update the conversation
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      conversationId,
      {
        lastMessage: content,
        lastMessageAt: new Date().toISOString(),
        unreadCount: JSON.stringify(unreadCount)
      }
    );
    
    return message;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
}

// Get messages for a conversation
export async function getConversationMessages(conversationId: string) {
  try {
    const messages = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      [
        Query.equal('conversationId', conversationId),
        Query.orderAsc('createdAt')
      ]
    );
    
    return messages.documents;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string, userId: string) {
  try {
    // Update all unread messages sent to this user
    const messages = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      [
        Query.equal('conversationId', conversationId),
        Query.equal('receiverId', userId),
        Query.equal('read', false)
      ]
    );
    
    // Mark each message as read
    await Promise.all(
      messages.documents.map(message => 
        databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.messagesCollectionId,
          message.$id,
          { read: true }
        )
      )
    );
    
    // Reset unread count for this user in the conversation
    const conversation = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      conversationId
    );
    
    // Parse the unreadCount string to an object
    let unreadCount: UnreadCountMap = {};
    try {
      unreadCount = JSON.parse(conversation.unreadCount || '{}');
    } catch (e) {
      console.error('Error parsing unreadCount:', e);
    }
    
    // Reset unread count for this user
    unreadCount[userId] = 0;
    
    // Update the conversation with the new unreadCount
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      conversationId,
      { 
        unreadCount: JSON.stringify(unreadCount)
      }
    );
    
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Get total unread message count for a user
export async function getTotalUnreadCount(userId: string) {
  try {
    const conversations = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      [
        Query.search('participantIds', userId)
      ]
    );
    
    let totalUnread = 0;
    
    conversations.documents.forEach(conversation => {
      try {
        const unreadCount: UnreadCountMap = JSON.parse(conversation.unreadCount || '{}');
        if (unreadCount[userId]) {
          totalUnread += unreadCount[userId];
        }
      } catch (e) {
        console.error('Error parsing unreadCount:', e);
      }
    });
    
    return totalUnread;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ============================================================
// FOLLOWS
// ============================================================

// ============================== FOLLOW USER
export async function followUser(followerId: string, followingId: string) {
  try {
    // Takip işlemi
    const follow = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      ID.unique(),
      {
        follower: followerId,
        followed: followingId,
        createdAt: new Date().toISOString(),
      }
    );

    // Bildirim oluştur
    const follower = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      followerId
    );

    await createNotification(
      followingId,
      'follow',
      followerId,
      follower.name,
      follower.imageUrl
    );

    return follow;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

// ============================== UNFOLLOW USER
export async function unfollowUser(followerId: string, followedId: string) {
  try {
    if (!followerId || !followedId) {
      throw new Error('Both followerId and followedId are required');
    }

    console.log('Unfollowing user with params:', { followerId, followedId });
    
    // Sadece "followed" alanıyla sorgulama yapalım
    const follows = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      [
        Query.equal("follower", followerId),
        Query.equal("followed", followedId)
      ]
    );

    if (!follows || follows.documents.length === 0) {
      console.log('No follow relationship found');
      return null;
    }

    const followDoc = follows.documents[0];
    console.log('Found follow document:', followDoc);

    const status = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      followDoc.$id
    );

    console.log('Successfully unfollowed user');
    return status;
  } catch (error) {
    console.error('Error in unfollowUser:', error);
    throw error;
  }
}

// ============================== GET USER FOLLOWERS
export async function getUserFollowers(userId: string) {
  try {
    console.log('Getting followers for user:', userId);
    
    const follows = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      [Query.equal("followed", userId)]
    );

    // Get user details for each follower
    const followerUsers = await Promise.all(
      follows.documents.map(async (follow) => {
        const user = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          follow.follower
        );
        return user;
      })
    );

    return { ...follows, documents: followerUsers };
  } catch (error) {
    console.error('Error in getUserFollowers:', error);
    throw error;
  }
}

// ============================== GET USER FOLLOWING
export async function getUserFollowing(userId: string) {
  try {
    console.log('Getting following for user:', userId);
    
    const follows = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      [Query.equal("follower", userId)]
    );

    // Get user details for each followed user
    const followedUsers = await Promise.all(
      follows.documents.map(async (follow) => {
        // Sadece "followed" alanını kullan
        const followedId = follow.followed;
        
        if (!followedId) {
          console.error('Missing followed ID in document:', follow);
          return null;
        }
        
        const user = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          followedId
        );
        return user;
      }).filter(Boolean) // null değerleri filtrele
    );

    return { ...follows, documents: followedUsers };
  } catch (error) {
    console.error('Error in getUserFollowing:', error);
    throw error;
  }
}

// ============================== CHECK IF FOLLOWING
export async function checkIsFollowing(followerId: string, followedId: string) {
  try {
    console.log('Checking follow status:', { followerId, followedId });
    
    // Sadece "followed" alanıyla kontrol edelim
    const follows = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      [
        Query.equal("follower", followerId),
        Query.equal("followed", followedId)
      ]
    );

    const isFollowing = follows.documents.length > 0;
    console.log('Is following:', isFollowing);
    return isFollowing;
  } catch (error) {
    console.error('Error in checkIsFollowing:', error);
    return false;
  }
}

// ============================================================
// NOTIFICATIONS
// ============================================================

// Create a notification
export async function createNotification(
  userId: string,
  type: 'like' | 'follow' | 'comment',
  sourceUserId: string,
  sourceUserName: string,
  sourceUserImage: string,
  postId?: string
) {
  try {
    // Ensure postId is a string or null
    const safePostId = typeof postId === 'string' ? postId : null;
    
    const notification = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      ID.unique(),
      {
        userId,
        type,
        sourceUserId,
        sourceUserName,
        sourceUserImage,
        postId2: safePostId,
        isRead: false,
        createdAt: new Date().toISOString(),
      }
    );

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Get user notifications
export async function getUserNotifications(userId: string) {
  try {
    const notifications = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
        Query.limit(50)
      ]
    );

    // Get user details for each sender
    const notificationsWithUser = await Promise.all(
      notifications.documents.map(async (notification) => {
        let sender = null;
        let post = null;
        
        // Get sender details
        if (notification.sourceUserId && typeof notification.sourceUserId === 'string') {
          try {
            sender = await getUserById(notification.sourceUserId);
          } catch (error) {
            console.error('Error fetching sender for notification:', error);
            // Continue without the sender data if there's an error
          }
        }
        
        // Get post details if available
        if (notification.postId2 && typeof notification.postId2 === 'string') {
          try {
            post = await getPostById(notification.postId2);
          } catch (error) {
            console.error('Error fetching post for notification:', error);
            // Continue without the post data if there's an error
          }
        }
        
        return {
          ...notification,
          sender,
          post
        };
      })
    );

    return { ...notifications, documents: notificationsWithUser };
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const updatedNotification = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      notificationId,
      {
        read: true
      }
    );

    return updatedNotification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string) {
  try {
    const notifications = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("userId", userId),
        Query.equal("isRead", false)
      ]
    );

    return notifications.total;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}

export async function getUnreadNotificationsCount(userId: string) {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal('userId', userId),
        Query.equal('isRead', false),
      ]
    );

    return response.total;
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
    return 0;
  }
}

// ============================== DELETE COMMENT
export async function deleteComment(commentId: string) {
  try {
    // Önce yorumu sil
    const status = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId
    );

    // Yoruma ait tüm tepkileri sil
    const reactions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentReactionsCollectionId,
      [Query.equal("commentId", commentId)]
    );

    // Tepkileri sil
    await Promise.all(
      reactions.documents.map(reaction => 
        databases.deleteDocument(
          appwriteConfig.databaseId,
          appwriteConfig.commentReactionsCollectionId,
          reaction.$id
        )
      )
    );

    // Yoruma ait tüm yanıtları sil
    const replies = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [
        Query.equal("parentId", commentId),
        Query.equal("isReply", true)
      ]
    );

    // Yanıtları sil
    await Promise.all(
      replies.documents.map(reply => 
        deleteComment(reply.$id) // Recursive olarak yanıtları da sil
      )
    );

    return { status: "ok" };
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}