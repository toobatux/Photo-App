import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import { Link } from "react-router";
import { LikeButton } from "./LikeButton";
import { SaveButton } from "./SaveButton";
import useToast from "../hooks/useToast";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useCallback, useEffect, useRef, useState } from "react";
import { customFetch } from "../services/api";
import { LoadingSpinner } from "./LoadingSpinner";
import NewPhotoButton from "./NewPhotoButton";

const PostDisplay = ({
  posts,
  setPosts,
  isOwner,
  loadMore,
  hasMore,
  handleSelectPost,
  setSelectedPost,
  isProfile = false,
  showToast,
  loading
}) => {
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, loading]);

  const isEmpty = !loading && posts.length === 0 && !hasMore;

    return (
      <div className="w-full flex flex-col items-center">
      {/* 1. Post Grid (Renders if posts exist) */}
      {posts.length > 0 && (
        <div className="columns-2 md:columns-3 gap-4 w-full -mb-4">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className="relative rounded shadow group overflow-clip break-inside-avoid mb-3 inline-block w-full"
            >
              <img
                src={post.image}
                alt=""
                className="bg-foreground/10 shadow-lg w-full cursor-pointer transition-all"
              />

              {/* Overlay button */}
              <button
                onClick={() => handleSelectPost(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-zoom-in flex items-center gap-2 absolute top-0 bottom-0 left-0 right-0 bg-black/30 p-2"
              >
                <span className="sr-only">View post by {post.username}</span>

                {!isProfile && (
                  <div className="hidden group-hover:flex transition-opacity items-center absolute top-2 left-2 right-2 p-2">
                    <div className="flex w-full h-full items-end text-sm">
                      <Link
                        to={`/${post.username}`}
                        className="flex items-center gap-4"
                      >
                        <div className="relative min-w-6 min-h-6 rounded-full">
                          <img
                            src={post.profile_pic}
                            alt={post.profile_name}
                            className="w-8 min-w-8 h-8 shrink-0 cursor-pointer rounded-full border border-foreground/10 hover:border-foreground/15 overflow-hidden"
                          />
                        </div>

                        <p className="truncate w-full text-white">
                          {post.profile_name}
                        </p>
                      </Link>
                    </div>
                  </div>
                )}

                <div className="absolute top-2 p-2">
                  {!post.public && (
                    <div className="flex items-center gap-2">
                      <VisibilityOffOutlinedIcon
                        sx={{ fontSize: "18px" }}
                        className="text-foreground/60 block translate-y-[1px]"
                      />
                      <p className="leading-none m-0 text-sm">Hidden</p>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-2 p-2 z-20">
                  <div
                    className="flex w-full flex-wrap gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LikeButton
                      initialLiked={post.is_liked}
                      totalLikes={post.total_likes}
                      postId={post.id}
                      showToast={showToast}
                    />
                    <SaveButton
                      initialSaved={post.is_saved}
                      postId={post.id}
                      showToast={showToast}
                    />
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 2. Empty State (Only shows after fetching finishes and finds 0 posts) */}
      {isEmpty && <div className="flex flex-col gap-4 m-auto mt-20 text-center text-secondary">
          <p>No photos yet</p>
          {isOwner && (
            <NewPhotoButton/>
          )}
        </div>}

      {/* 3. Intersection Target Sentinel (ALWAYS rendered in DOM so Observer can trigger loadMore) */}
      <div
        ref={observerTarget}
        className="h-10 flex items-center justify-center w-full mt-6"
      >
        {loading && <LoadingSpinner/>}
        {/* {!hasMore && posts.length > 0 && (
          <p className="text-secondary">No more posts</p>
        )} */}
      </div>
    </div>
  );
};

export default PostDisplay;
