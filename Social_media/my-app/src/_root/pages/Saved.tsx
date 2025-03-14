import { Models } from "appwrite";

import { GridPostList, Loader } from "@/components/shared";
import { useGetCurrentUser } from "@/lib/react-query/queries";

const Saved = () => {
  const { data: currentUser } = useGetCurrentUser();

  const savePosts = currentUser?.save && Array.isArray(currentUser.save)
    ? currentUser.save
        .filter((savePost: Models.Document) => savePost.post) // Geçersiz kayıtları filtrele
        .map((savePost: Models.Document) => ({
          ...savePost.post,
          creator: {
            imageUrl: currentUser.imageUrl,
            name: currentUser.name,
            $id: currentUser.$id
          },
        }))
        .reverse()
    : [];

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="edit"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Kaydedilen Gönderiler</h2>
      </div>

      {!currentUser ? (
        <Loader />
      ) : (
        <div className="w-full max-w-5xl">
          {savePosts.length === 0 ? (
            <p className="text-light-4">Mevcut gönderi yok</p>
          ) : (
            <GridPostList posts={savePosts} showStats={false} />
          )}
        </div>
      )}
    </div>
  );
};

export default Saved;
