import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import { useEffect, useRef } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { Link } from "react-router";
import useModal from "../hooks/useModal";

const GalleryPhotoList = ({
  photos,
  // loadMore,
  // hasMore,
  // showToast,
  loading,
}) => {
  const observerTarget = useRef(null);
  const newModal = useModal();

  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       if (entries[0].isIntersecting && hasMore && !loading) {
  //         loadMore();
  //       }
  //     },
  //     { threshold: 0.1 },
  //   );

  //   if (observerTarget.current) {
  //     observer.observe(observerTarget.current);
  //   }

  //   return () => observer.disconnect();
  // }, [loadMore, hasMore, loading]);

  // const isEmpty = !loading && galleries.length === 0 && !hasMore;

  return (
    <div className="w-full flex flex-col items-center">
      {photos.length > 0 && (
        <div className="columns-2 md:columns-3 gap-4 w-full -mb-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative rounded shadow group overflow-clip break-inside-avoid mb-3 inline-block w-full"
            >
              <img
                src={photo.src}
                alt=""
                className="bg-foreground/10 shadow-lg w-full cursor-pointer transition-all"
              />

              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-zoom-in flex items-center gap-2 absolute top-0 bottom-0 left-0 right-0 bg-black/30 p-2"
              >
                <div className="absolute bottom-2 p-2 z-20">
                  <div
                    className="flex w-full flex-wrap gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* <LikeButton
                      initialLiked={post.is_liked}
                      totalLikes={post.total_likes}
                      postId={post.id}
                      showToast={showToast}
                    />
                    <SaveButton
                      initialSaved={post.is_saved}
                      postId={post.id}
                      showToast={showToast}
                    /> */}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {!photos && (
        <div className="flex flex-col gap-4 m-auto mt-20 text-secondary">
          <p>No photos yet</p>
          <button onClick={newModal.open} className="btn-primary">
            Create photo
          </button>
        </div>
      )}

      <div
        ref={observerTarget}
        className="h-10 flex items-center justify-center w-full mt-6"
      >
        {loading && <LoadingSpinner />}
      </div>

      {/* <NewGalleryModal isOpen={newModal.isOpen} onClose={newModal.close} showToast={showToast}/> */}
    </div>
  );
};

export default GalleryPhotoList;
