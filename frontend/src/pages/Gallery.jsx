import { Link, useParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { customFetch } from "../services/api";
import AddIcon from "@mui/icons-material/Add";
import useModal from "../hooks/useModal";
import AddPhotosModal from "../components/AddPhotosModal";
import useToast from "../hooks/useToast";
import Toast from "../components/Toast";
import EditGalleryModal from "../components/EditGalleryModal";
import GalleryPhotoList from "../components/GalleryPhotoList";

export function Gallery() {
  const { galleryId } = useParams();
  const { user, loading: isAuthLoading } = useAuth();
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const { toast, setToast, showToast } = useToast();

  const addPhotosModal = useModal();
  const editGalleryModal = useModal();

  useEffect(() => {
    if (isAuthLoading) return;

    async function fetchGallery() {
      try {
        setLoading(true);
        setError(null);

        const data = await customFetch(`/api/galleries/${galleryId}/`, {
          method: "GET",
        });

        setGallery(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, [galleryId, isAuthLoading]);

  console.log(gallery);

  const handleGalleryUpdate = (updatedGallery) => {
    setGallery(updatedGallery);
  }

  if (loading) return <div>Loading gallery...</div>;
  if (error) return <div>{error}</div>;
  if (!gallery) return <div>No gallery found.</div>;

  return (
    <>
      <div className="flex flex-col w-full gap-4 md:gap-8">
        <div className="flex w-full flex-col py-6 md:py-12 gap-8 border-b border-foreground/10">
        {/* {gallery.photos && (
          <img src={gallery.photos?.[0]?.src} alt={gallery.title} className="flex w-full h-auto max-h-[30vh] bg-foreground/5 rounded object-cover object-center"/>
        )} */}
          <div className="space-y-2">
            <div className="text-lg font-semibold">{gallery.title}</div>
            <div className="flex gap-2 text-sm text-foreground/70">
              <div>
                {gallery.total_photos}{" "}
                {gallery.total_photos === 1 ? "photo" : "photos"}
              </div>
              <div>•</div>
              <div className="text-sm text-foreground/70">
                Created by{" "}
                <Link
                  to={`/${gallery.username}`}
                  className="underline hover:text-foreground"
                >
                  {gallery.photographer}
                </Link>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={editGalleryModal.open}
              className="btn-secondary w-fit px-4"
            >
              Edit gallery
            </button>
            <button
              onClick={addPhotosModal.open}
              className="btn-primary px-2 flex gap-2 items-center"
            >
              <AddIcon sx={{ fontSize: "18px" }} />{" "}
              <span className="pe-2">Add photos</span>
            </button>
          </div>
        </div>

        {gallery.photos.length > 0 ? (
          <GalleryPhotoList photos={gallery.photos}/>
        ) : (
          <div className="flex flex-col gap-6 items-center text-center my-10">
            <p>No photos yet</p>{" "}
            <button
              onClick={addPhotosModal.open}
              className="btn-primary flex gap-2 items-center"
            >
              <AddIcon sx={{ fontSize: "18px" }} /> Add photos
            </button>
          </div>
        )}
      </div>
      <AddPhotosModal
        isOpen={addPhotosModal.isOpen}
        onClose={addPhotosModal.close}
        showToast={showToast}
        gallery_id={gallery.id}
      />
      <EditGalleryModal
        isOpen={editGalleryModal.isOpen}
        onClose={editGalleryModal.close}
        showToast={showToast}
        gallery={gallery}
        onUpdate={handleGalleryUpdate}
      />
      <Toast toast={toast} setToast={setToast} />
    </>
  );
}
