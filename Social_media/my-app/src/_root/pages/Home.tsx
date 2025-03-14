import { Models } from "appwrite";
import { FiUsers, FiTrendingUp } from "react-icons/fi";
import { RiNewspaperLine } from "react-icons/ri";

import { useToast } from "@/hooks/use-toast";
import { Loader, PostCard, UserCard } from "@/components/shared";
import { useGetRecentPosts, useGetUsers } from "@/lib/react-query/queries";

const Home = () => {
  const { toast } = useToast();

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
    toast({
      title: "Bir şeyler ters gitti",
      description: "Lütfen sayfayı yenileyip tekrar deneyin.",
      variant: "destructive",
    });

    return (
      <div className="flex-center flex-col gap-6 py-10">
        <img 
          src="/assets/icons/error.svg" 
          alt="error" 
          className="w-32 h-32 opacity-50"
        />
        <p className="text-light-4 text-center">
          Bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin.
        </p>
      </div>
    );
  }

  const hasNoPosts = !isPostLoading && (!posts?.documents || posts.documents.length === 0);
  const hasNoCreators = !isUserLoading && (!creators?.documents || creators.documents.length === 0);

  return (
    <div className="flex flex-1 gap-6 items-start pt-2">
      {/* Main Feed Section */}
      <div className="flex-1 flex flex-col gap-4 items-start pl-0">
        <div className="w-full max-w-screen-sm">
          <div className="flex items-center gap-3 mb-4 glass-card p-4 animate-fade-in">
            <div className="p-2.5 gradient-bg rounded-xl shadow-lg">
              <RiNewspaperLine className="text-white text-xl" />
            </div>
            <h2 className="h3-bold md:h2-bold gradient-text">Ana Akış</h2>
          </div>
          
          {isPostLoading ? (
            <div className="flex-center w-full py-20">
              <Loader />
            </div>
          ) : hasNoPosts ? (
            <div className="w-full h-full flex-center flex-col gap-4 py-10 glass-card p-8 animate-fade-in">
              <img 
                src="/assets/icons/profile-placeholder.svg" 
                alt="no posts" 
                className="w-24 h-24 opacity-30"
              />
              <p className="text-light-4 text-center">Henüz gönderi yok</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-5 animate-fade-in">
              {posts?.documents.map((post: Models.Document, index: number) => (
                <li key={post.$id} className="w-full" style={{ animationDelay: `${index * 0.1}s` }}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:flex lg:flex-col gap-6 w-80 sticky top-24">
        {/* Suggested Users */}
        <div className="glass-card p-5 animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 gradient-bg rounded-xl shadow-lg">
              <FiUsers className="text-white text-lg" />
            </div>
            <h3 className="h3-bold gradient-text">Tanıyor Olabileceklerin</h3>
          </div>
          
          {isUserLoading ? (
            <div className="flex-center w-full py-8">
              <Loader />
            </div>
          ) : hasNoCreators ? (
            <div className="flex-center flex-col gap-4 py-6">
              <img 
                src="/assets/icons/profile-placeholder.svg" 
                alt="no users" 
                className="w-20 h-20 opacity-30"
              />
              <p className="text-light-4 text-center">Henüz kullanıcı yok</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {creators?.documents.map((creator, index) => (
                <li key={creator?.$id} className="w-full" style={{ animationDelay: `${index * 0.1}s` }}>
                  <UserCard user={creator} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Trending Topics */}
        <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 gradient-bg rounded-xl shadow-lg">
              <FiTrendingUp className="text-white text-lg" />
            </div>
            <h3 className="h3-bold gradient-text">Gündem</h3>
          </div>
          
          <ul className="flex flex-col gap-3">
            {['#SnapFlow', '#Teknoloji', '#Sanat', '#Müzik', '#Spor'].map((topic, index) => (
              <li key={topic} className="flex items-center justify-between p-3 bg-dark-3/40 rounded-lg hover:bg-dark-4/60 transition-all duration-300 cursor-pointer">
                <span className="text-light-2 font-medium">{topic}</span>
                <span className="text-light-3 text-sm">{Math.floor(Math.random() * 1000) + 100} gönderi</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
