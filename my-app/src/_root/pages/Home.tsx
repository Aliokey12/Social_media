import { Models } from "appwrite";
import { FiUsers } from "react-icons/fi";
import { RiNewspaperLine } from "react-icons/ri";

// import { useToast } from "@/components/ui/use-toast";
import { Loader, PostCard, UserCard } from "@/components/shared";
import { useGetRecentPosts, useGetUsers } from "@/lib/react-query/queries";

const Home = () => {
  // const { toast } = useToast();

  const {
    data: posts,
    isLoading: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();
  const {
    data: creators,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers(10);

  if (isErrorPosts || isErrorCreators) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-light-1">Bir şeyler ters gitti</p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">Bir şeyler ters gitti</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 gap-10 px-5 py-10 md:px-8 lg:px-14">
      <div className="home-container flex-1">
        <div className="home-posts">
          <div className="flex items-center gap-2 mb-8">
            <RiNewspaperLine className="text-primary-500 text-2xl" />
            <h2 className="h3-bold md:h2-bold text-light-1">Ana Akış</h2>
          </div>
          
          {isPostLoading && !posts ? (
            <div className="flex-center w-full h-60">
              <Loader />
            </div>
          ) : (
            <ul className="flex flex-col gap-9 w-full">
              {posts?.documents.map((post: Models.Document) => (
                <li key={post.$id} className="w-full">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="home-creators hidden lg:block w-96 bg-dark-2 p-6 rounded-xl shadow-lg h-fit sticky top-24">
        <div className="flex items-center gap-2 mb-8">
          <FiUsers className="text-primary-500 text-xl" />
          <h3 className="h3-bold text-light-1">Tanıyor Olabiliceklerin</h3>
        </div>
        
        {isUserLoading && !creators ? (
          <div className="flex-center w-full h-40">
            <Loader />
          </div>
        ) : (
          <ul className="grid gap-6">
            {creators?.documents.map((creator) => (
              <li key={creator?.$id} className="w-full">
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;
