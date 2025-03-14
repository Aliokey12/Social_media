import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { FiSearch, FiFilter, FiTrendingUp } from "react-icons/fi";

import { Input } from "@/components/ui";
import useDebounce from "@/hooks/useDebounce";
import { GridPostList, Loader } from "@/components/shared";
import { useGetPosts, useSearchPosts } from "@/lib/react-query/queries";

export type SearchResultProps = {
  isSearchFetching: boolean;
  searchedPosts: any;
};

const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultProps) => {
  if (isSearchFetching) {
    return <Loader />;
  } else if (searchedPosts && searchedPosts.documents.length > 0) {
    return <GridPostList posts={searchedPosts.documents} />;
  } else {
    return (
      <div className="flex flex-col items-center justify-center w-full py-10 glass-card animate-fade-in">
        <img 
          src="/assets/icons/search.svg" 
          alt="no results" 
          className="w-16 h-16 opacity-30 mb-4"
        />
        <p className="text-light-4 text-center">Arama sonucu bulunamadı</p>
      </div>
    );
  }
};

const Explore = () => {
  const { ref, inView } = useInView();
  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts();

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);
  const { data: searchedPosts, isFetching: isSearchFetching } = useSearchPosts(debouncedSearch);

  useEffect(() => {
    if (inView && !searchValue) {
      fetchNextPage();
    }
  }, [inView, searchValue, fetchNextPage]);

  if (!posts)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const shouldShowSearchResults = searchValue !== "";
  const shouldShowPosts = !shouldShowSearchResults && 
    posts.pages.every((item) => item?.documents.length === 0);

  return (
    <div className="explore-container animate-fade-in">
      <div className="glass-card p-6 rounded-2xl mb-10 w-full">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 gradient-bg rounded-xl shadow-lg">
            <FiSearch className="text-white text-xl" />
          </div>
          <h2 className="h3-bold md:h2-bold gradient-text">Keşfet</h2>
        </div>

        <div className="flex gap-3 w-full rounded-xl glass-input p-2 pl-4 focus-within:ring-2 focus-within:ring-primary-500 transition-all duration-300">
          <FiSearch className="text-light-3 text-xl self-center" />
          <Input
            type="text"
            placeholder="Gönderileri, etiketleri veya kullanıcıları ara..."
            className="explore-search bg-transparent border-none focus:ring-0 text-light-1 placeholder:text-light-4 flex-1"
            value={searchValue}
            onChange={(e) => {
              const { value } = e.target;
              setSearchValue(value);
            }}
          />
        </div>
      </div>

      <div className="flex-between w-full mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 gradient-bg rounded-lg shadow-md">
            <FiTrendingUp className="text-white text-lg" />
          </div>
          <h3 className="body-bold md:h3-bold gradient-text">Bugün Popüler</h3>
        </div>

        <div className="flex-center gap-3 glass-card px-4 py-2 rounded-xl cursor-pointer hover:opacity-90 transition-all duration-300 shadow-sm">
          <p className="small-medium md:base-medium text-light-2">Tümü</p>
          <FiFilter className="text-primary-500" />
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full">
        {shouldShowSearchResults ? (
          <SearchResults
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPosts}
          />
        ) : shouldShowPosts ? (
          <div className="flex flex-col items-center justify-center w-full py-10 glass-card animate-fade-in">
            <img 
              src="/assets/icons/profile-placeholder.svg" 
              alt="no posts" 
              className="w-20 h-20 opacity-30 mb-4"
            />
            <p className="text-light-4 text-center">Henüz gönderi yok</p>
          </div>
        ) : (
          posts.pages.map((item, index) => (
            item && item.documents ? (
              <GridPostList key={`page-${index}`} posts={item.documents} />
            ) : null
          ))
        )}
      </div>

      {hasNextPage && !searchValue && (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Explore;
