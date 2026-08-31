import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';
import { useEffect, useRef } from "react";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { Link } from "react-router";
import useModal from "../../../hooks/useModal";
import NewGalleryModal from "./NewGalleryModal";
import NewGalleryButton from "./NewGalleryButton";

const GalleryList = ({
  galleries,
  setGalleries,
  isOwner,
  loadMore,
  hasMore,
  showToast,
  loading,
}) => {
  const observerTarget = useRef(null);
  const newModal = useModal();

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

  const isEmpty = !loading && galleries.length === 0 && !hasMore;

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. gallery Grid (Renders if galleries exist) */}
      {galleries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full -mb-4">
          {galleries.map((gallery, index) => (
            <Link to={`/galleries/${gallery.id}`} key={gallery.id}>
              <div className="flex w-full h-full flex-col gap-2 cursor-pointer hover:bg-foreground/5 transition-colors p-4 rounded">
                <div className="relative">
                  {gallery.photos?.[0]?.src ? (
                    <img
                      src={gallery.photos?.[0]?.src}
                      alt=""
                      className="flex w-full h-full aspect-square rounded bg-foreground/10 shadow-lg cursor-pointer transition-all object-cover object-center"
                    />
                  ) : (
                    <div className="relative flex w-full h-full aspect-square rounded bg-foreground/10 shadow-lg cursor-pointer transition-all object-cover object-center">
                        <div className="absolute right-1/2 translate-x-1/2 top-1/2 -translate-y-1/2">
                        <ImageNotSupportedOutlinedIcon className="text-foreground/20" sx={{fontSize:"32px"}}/>
                        </div>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 px-2 py-1 text-sm rounded text-foreground bg-background/20 backdrop-blur">
                    <div className="flex gap-2">
                      <PhotoLibraryOutlinedIcon
                        sx={{ fontSize: "18px" }}
                        className="text-foreground/60"
                      />
                      <p>{gallery.total_photos}</p>
                    </div>
                  </div>
                </div>
                <span className="sr-only">
                  View gallery by {gallery.username}
                </span>

                {/* <div className="flex items-center p-2">
                    <div className="flex w-full h-full items-end text-sm">
                      <Link
                        to={`/${gallery.username}`}
                        className="flex items-center gap-4"
                      >
                        <div className="relative min-w-6 min-h-6 rounded-full">
                          <img
                            src={gallery.photographer_avatar}
                            alt={gallery.photographer}
                            className="w-8 min-w-8 h-8 shrink-0 cursor-pointer rounded-full border border-foreground/10 hover:border-foreground/15 overflow-hidden"
                          />
                        </div>

                        <p className="truncate w-full text-white">
                          {gallery.photographer}
                        </p>
                      </Link>
                    </div>
                  </div> */}

                <p className="flex">{gallery.title}</p>

                {!gallery.is_public && (
                  <div className="flex items-center gap-2 text-foreground/60">
                    <VisibilityOffOutlinedIcon
                      sx={{ fontSize: "18px" }}
                      className="block translate-y-[1px]"
                    />
                    <p className="leading-none m-0 text-sm">Hidden</p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 2. Empty State (Only shows after fetching finishes and finds 0 galleries) */}
      {isEmpty && (
        <div className="flex flex-col gap-4 m-auto mt-20 text-secondary text-center">
          <p>No galleries yet</p>
          {isOwner && <NewGalleryButton />}
        </div>
      )}

      <div
        ref={observerTarget}
        className="h-10 flex items-center justify-center w-full mt-6"
      >
        {loading && <LoadingSpinner />}
      </div>

      <NewGalleryModal
        isOpen={newModal.isOpen}
        onClose={newModal.close}
        showToast={showToast}
      />
    </div>
  );
};

export default GalleryList;
