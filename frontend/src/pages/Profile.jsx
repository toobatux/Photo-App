import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useModal from "../hooks/useModal";
import PostModal from "../components/PostModal";
import ProfileHeader from "../components/ProfileHeader";
import PostDisplay from "../components/PostDisplay";
import { useAuth } from "../context/AuthContext";
import ProfileSkeleton from "../components/ProfileSkeleton";

export function Profile() {
  const { username } = useParams();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);

  const photoModal = useModal();
  const postModal = useModal();

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://192.168.1.166:8000/api/profile/${username}/`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

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
  }, [username]);

  const handleSelectPost = (index) => {
    setSelectedPostIndex(index);
    postModal.open();
  };

  const handleNextPost = () => {
    if (selectedPostIndex < profile_posts.length - 1) {
      setSelectedPostIndex((prevIndex) => prevIndex + 1);
    } else {
      setSelectedPostIndex(0); // Loop back to start
    }
  };

  const handlePrevPost = () => {
    if (selectedPostIndex > 0) {
      setSelectedPostIndex((prevIndex) => prevIndex - 1);
    } else {
      setSelectedPostIndex(profile_posts.length - 1); // Loop back to start
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (error)
    return <div className="text-red-500 text-center p-8">Error: {error}</div>;
  if (!data)
    return <div className="text-center p-8">No profile data found.</div>;

  const { profile, profile_posts = [], pic_color = "#1e1e1e" } = data;
  const selectedPost = profile_posts[selectedPostIndex];

  return (
    <div className="flex relative flex-col w-full">
      {/* Dynamic background gradient */}
      {/* <div
        style={{
          backgroundImage: `linear-gradient(to top, transparent, ${pic_color})`,
        }}
        className="fixed -top-180 md:-top-160 left-0 right-0 w-full z-0 h-[1000px] bg-background pointer-events-none"
      /> */}

      <div className="flex flex-col z-10">
        <ProfileHeader
          user={user}
          photoModal={photoModal}
          profile_picture={profile.profile_picture}
          name={profile.name}
          bio={profile.bio}
        />

        <div className="pt-6 md:pt-12">
          <PostDisplay
            posts={profile_posts}
            handleSelectPost={handleSelectPost}
            isProfile={true}
          />
        </div>

        {postModal.isOpen && selectedPost && (
          <PostModal
            selectedPost={selectedPost}
            handleNextPost={handleNextPost}
            handlePrevPost={handlePrevPost}
            postModal={postModal}
            user={user}
          />
        )}
      </div>
    </div>
  );
}

{
  /* Profile picture modal */
}
{
  /* {photoModal.isOpen && (
          <Modal
            isOpen={photoModal.isOpen}
            onClose={photoModal.close}
            size="md"
          >
            <div className="relative flex justify-center">
              <img
                className="rounded-full shadow-lg bg-foreground/10 max-w-[300px] h-[300px] lg:min-w-[400px] lg:max-w-[400px] lg:min-h-[400px] max-h-[400px] w-full object-cover"
                src={profile.profile_picture.url || profile.profile_picture}
                alt="Profile"
              />
              <div
                onClick={photoModal.open}
                className="absolute top-0 right-0 bottom-0 left-0 bg-transparent rounded-full"
              ></div>
              <div className="absolute z-50 -bottom-12 left-1/2 -translate-x-1/2">
                <button
                  onClick={photoModal.close}
                  className="flex items-center justify-center p-2 cursor-pointer gap-2 font-semibold hover:underline"
                >
                  <p className="text-white">Close</p>
                </button>
              </div>
            </div>
          </Modal>
        )} */
}
