import { useEffect, useState } from "react";
import useModal from "../hooks/useModal";
import PostModal from "../components/PostModal";
import PostDisplay from "../components/PostDisplay";
import { useAuth } from "../context/AuthContext";

function Feed() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const postModal = useModal();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`http://192.168.1.166:8000/api/feed/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSelectPost = (post) => {
    setSelectedPost(post);
    postModal.open();
  };

  if (loading) return <div className="text-center p-8">Loading profile...</div>;
  if (error)   return <div className="text-red-500 text-center p-8">Error: {error}</div>;
  if (!data)   return <div className="text-center p-8">No profile data found.</div>;

  const { posts } = data;

  return (
    <div className="flex flex-col w-full">
      {/* <h1 className="text-lg font-semibold mb-4">My Feed</h1> */}

      {/* Categories */}
      <div className="relative">
        <div className="flex relative w-full overflow-x-auto scrollbar-none gap-2 mb-4 md:mb-6">
          {['Nature', 'Mountains', 'City', 'Skyline', 'Ocean'].map((category, index) => (
            <button key={index} className="flex px-4 py-1.5 rounded-full border border-foreground/10 text-foreground/70 hover:bg-foreground/10 hover:text-foreground cursor-pointer text-sm select-none">
              {category}
            </button>
          ))}
        </div>
        <div className="absolute top-0 right-0 bottom-0 w-14 h-full bg-linear-to-l from-background to-transparent pointer-events-none"></div>
      </div>

      <PostDisplay posts={posts} handleSelectPost={handleSelectPost} isProfile={false} />

      {selectedPost && (
        <PostModal selectedPost={selectedPost} postModal={postModal} isProfile={false} user={user} />
      )}
    </div>
  );
}

export default Feed;
