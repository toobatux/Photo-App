import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import useModal from "../hooks/useModal";
import PostModal from "../components/PostModal";
import ProfileHeader from "../components/ProfileHeader";
import PostDisplay from "../components/PostDisplay";
import { useAuth } from "../context/AuthContext";
import ProfileSkeleton from "../components/ProfileSkeleton";
import useToast from "../hooks/useToast";
import Toast from "../components/Toast";
import { customFetch } from "../services/api";
import PhotoOutlinedIcon from "@mui/icons-material/PhotoOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import GalleryList from "../components/GalleryList";
import NewGalleryButton from "../components/NewGalleryButton";
import NewPhotoButton from "../components/NewPhotoButton";

export function Profile() {
  const { username } = useParams();
  const { user, loading: isAuthLoading } = useAuth();

  const [data, setData] = useState({
    profile: {},
    pic_color: "#1e1e1e",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPhotoDisplay, setShowPhotoDisplay] = useState(true);
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const { toast, setToast, showToast } = useToast();

  const [postPage, setPostPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  const [galleryPage, setGalleryPage] = useState(1);
  const [hasMoreGalleries, setHasMoreGalleries] = useState(true);
  const [isGalleriesLoading, setIsGalleriesLoading] = useState(false);
  const [galleries, setGalleries] = useState([]);

  const photoModal = useModal();
  const postModal = useModal();

  useEffect(() => {
    if (isAuthLoading) return;

    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        const data = await customFetch(`/api/profile/${username}/`, {
          method: "GET",
        });

        setData(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [username, isAuthLoading]);

  const loadMorePosts = useCallback(async () => {
    if (isPostsLoading || !hasMorePosts) return;

    setIsPostsLoading(true);
    try {
      const newPosts = await customFetch(
        `/api/users/${username}/posts/?page=${postPage}`,
      );

      if (newPosts.length === 0) {
        setHasMorePosts(false);
      } else {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((post) => post.id));
          const uniqueNewPosts = newPosts.filter(
            (post) => !existingIds.has(post.id),
          );

          return [...prev, ...uniqueNewPosts];
        });
        setPostPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      setHasMorePosts(false);
    } finally {
      setIsPostsLoading(false);
    }
  }, [postPage, isPostsLoading, hasMorePosts]);

  const loadMoreGalleries = useCallback(async () => {
    if (isGalleriesLoading || !hasMoreGalleries) return;

    setIsGalleriesLoading(true);
    try {
      const newGalleries = await customFetch(
        `/api/users/${username}/galleries/?page=${galleryPage}`,
      );

      if (newGalleries.length === 0) {
        setHasMoreGalleries(false);
      } else {
        setGalleries((prev) => {
          const existingIds = new Set(prev.map((gallery) => gallery.id));
          const uniqueNewGalleries = newGalleries.filter(
            (gallery) => !existingIds.has(gallery.id),
          );

          return [...prev, ...uniqueNewGalleries];
        });
        setGalleryPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error loading galleries:", error);
      setHasMoreGalleries(false);
    } finally {
      setIsGalleriesLoading(false);
    }
  }, [galleryPage, isGalleriesLoading, hasMoreGalleries]);

  const handleSelectPost = (index) => {
    setSelectedPostIndex(index);
    postModal.open();
  };

  const handleNextPost = () => {
    if (selectedPostIndex < posts.length - 1) {
      setSelectedPostIndex((prevIndex) => prevIndex + 1);
    } else {
      setSelectedPostIndex(0); // Loop back to start
    }
  };

  const handlePrevPost = () => {
    if (selectedPostIndex > 0) {
      setSelectedPostIndex((prevIndex) => prevIndex - 1);
    } else {
      setSelectedPostIndex(posts.length - 1); // Loop back to start
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (error)
    return <div className="text-red-500 text-center p-8">Error: {error}</div>;
  if (!data)
    return <div className="text-center p-8">No profile data found.</div>;

  const { profile, pic_color = "#1e1e1e" } = data;
  const selectedPost = posts[selectedPostIndex];

  console.log(profile);

  const handlePostUpdate = (updatedPost) => {
    setPosts(() =>
      posts.map((post) => (post.id === updatedPost.id ? updatedPost : post)),
    );
  };

  const handlePostDelete = (postId) => {
    setPosts(() => posts.filter((post) => post.id !== postId));
  };

  const handleProfileUpdate = (updatedProfile) => {
    setData((prevData) => ({
      ...prevData,
      profile: updatedProfile,
    }));
  };

  const isOwner = user && user.name === profile.name;

  return (
    <>
      <div className="flex relative flex-col w-full">
        {/* Dynamic background gradient */}
        {/* <div
        style={{
          backgroundImage: `linear-gradient(to top, transparent, ${pic_color})`,
        }}
        className="fixed -top-180 md:-top-160 left-0 right-0 w-full z-0 h-[1000px] bg-background pointer-events-none"
      /> */}
        {toast && <Toast toast={toast} setToast={setToast} />}

        <div className="flex flex-col z-10">
          <ProfileHeader
            user={user}
            photoModal={photoModal}
            profile_picture={profile.profile_picture}
            name={profile.name}
            bio={profile.bio}
            location={profile.location}
            camera={profile.camera}
            followers_count={profile.followers_count}
            following_count={profile.following_count}
            showToast={showToast}
            onUpdate={handleProfileUpdate}
          />

          <div className="flex w-full">
            <div className="flex w-full">
              <button
                onClick={() => setShowPhotoDisplay(true)}
                className={`flex gap-2 items-center px-2 py-3 text-sm border-b cursor-pointer transition-colors ${showPhotoDisplay ? "border-foreground" : "border-foreground/10 hover:border-foreground/50 text-foreground/70"}`}
              >
                <PhotoOutlinedIcon sx={{ fontSize: "18px" }} />
                Photos
              </button>
              <div className="w-2 border-b border-foreground/10"></div>
              <button
                onClick={() => setShowPhotoDisplay(false)}
                className={`flex gap-2 items-center px-2 py-3 text-sm border-b cursor-pointer transition-colors ${!showPhotoDisplay ? "border-foreground text-foreground" : "border-foreground/10 hover:border-foreground/50 text-foreground/70"}`}
              >
                <PhotoLibraryOutlinedIcon sx={{ fontSize: "18px" }} />
                Galleries
              </button>
              <div className="w-full border-b border-foreground/10"></div>
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-6">
            {showPhotoDisplay ? (
              <>
                {user && user.name === profile.name && <NewPhotoButton isPrimary={false}/>}
                <PostDisplay
                  posts={posts}
                  handleSelectPost={handleSelectPost}
                  isProfile={true}
                  isOwner={isOwner}
                  showToast={showToast}
                  setPosts={setPosts}
                  loadMore={loadMorePosts}
                  hasMore={hasMorePosts}
                  loading={isPostsLoading}
                />
              </>
            ) : (
              <>
                {user && user.name === profile.name && <NewGalleryButton isPrimary={false} />}
                <GalleryList
                  galleries={galleries}
                  setGalleries={setGalleries}
                  isOwner={isOwner}
                  loadMore={loadMoreGalleries}
                  hasMore={hasMoreGalleries}
                  showToast={showToast}
                  loading={isGalleriesLoading}
                />
              </>
            )}
          </div>

          {postModal.isOpen && selectedPost && (
            <PostModal
              selectedPost={selectedPost}
              handleNextPost={handleNextPost}
              handlePrevPost={handlePrevPost}
              postModal={postModal}
              user={user}
              onPostUpdate={handlePostUpdate}
              key={selectedPostIndex}
              showDeleteToast={showToast}
              onDelete={handlePostDelete}
            />
          )}
        </div>
      </div>
    </>
  );
}
