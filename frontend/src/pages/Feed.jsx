import { useCallback, useEffect, useState } from "react";
import useModal from "../hooks/useModal";
import PostModal from "../features/posts/components/PostModal";
import PostDisplay from "../features/posts/components/PostDisplay";
import { useAuth } from "../context/AuthContext";
import { customFetch } from "../services/api";
import useToast from "../hooks/useToast";

function Feed() {
  // const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const selectedPost = posts[selectedPostIndex];

  const postModal = useModal();
  const { user } = useAuth();
  const { showToast } = useToast();

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newPosts = await customFetch(`/api/posts/?page=${page}`);

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((post) => post.id));
          const uniqueNewPosts = newPosts.filter(
            (post) => !existingIds.has(post.id),
          );

          return [...prev, ...uniqueNewPosts];
        });
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  const handleSelectPost = (index) => {
    setSelectedPostIndex(index);
    postModal.open();
  };

  if (error)
    return <div className="text-red-500 text-center p-8">Error: {error}</div>;

  return (
    <div className="flex flex-col w-full">
      {/* <h1 className="text-lg font-semibold mb-4">My Feed</h1> */}

      {/* Categories */}
      <div className="relative">
        <div className="flex relative w-full overflow-x-auto scrollbar-none gap-2 mb-4 md:mb-6">
          {["Nature", "Mountains", "City", "Skyline", "Ocean"].map(
            (category, index) => (
              <button
                key={index}
                className="flex px-4 py-1.5 rounded-full border border-foreground/10 text-foreground/70 hover:bg-foreground/10 hover:text-foreground cursor-pointer text-sm select-none"
              >
                {category}
              </button>
            ),
          )}
        </div>
        <div className="absolute top-0 right-0 bottom-0 w-14 h-full bg-linear-to-l from-background to-transparent pointer-events-none"></div>
      </div>

      <PostDisplay
        posts={posts}
        handleSelectPost={handleSelectPost}
        isProfile={false}
        showToast={showToast}
        setPosts={setPosts}
        loadMore={loadMore}
        hasMore={hasMore}
        loading={loading}
      />

      {selectedPost && (
        <PostModal
          selectedPost={selectedPost}
          postModal={postModal}
          isProfile={false}
          user={user}
        />
      )}
    </div>
  );
}

export default Feed;
