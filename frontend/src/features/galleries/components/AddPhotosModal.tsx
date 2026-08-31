import { useRef, useState } from "react";
import Modal from "../../../components/Modal";
import { customFetch } from "../../../services/api";
import CloseIcon from "@mui/icons-material/Close";
import PhotoOutlinedIcon from "@mui/icons-material/PhotoOutlined";

const AddPhotosModal = ({ isOpen, onClose, showToast, gallery_id }) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const newPreviews = selectedFiles.map((file) =>
        URL.createObjectURL(file),
      );
      setImages((prev) => [...prev, ...selectedFiles]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return alert("Please select an image");

    setLoading(true);

    try {
      const formData = new FormData();
      images.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("gallery_id", gallery_id);

      console.log("FORM_DATA:", formData);

      const newPost = await customFetch("/api/galleries/bulk-upload/", {
        method: "POST",
        body: formData,
      });
      showToast("Added photos successfully", "success");
      onClose();
    } catch (err) {
      showToast("Error adding photos. Please try again.", "error");
      console.error("Failed to add photos:", err);
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      isClosable={false}
      header={"Add Photos"}
    >
      <div className="relative">
        <form onSubmit={handleSubmit} className="space-y-5 p-4 md:p-6 h-full">
          {/* Picture Upload Area */}
          <div className="flex w-full items-center gap-4">
            <label className="block text-sm font-medium text-foreground/70">
              Upload Photo(s)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              multiple
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center gap-2 p-2"
            >
              <PhotoOutlinedIcon
                sx={{ fontSize: "18px" }}
                className="text-foreground/50"
              />
              <span className="pe-2">Browse</span>
            </button>
          </div>

          {imagePreviews.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 my-4">
              {imagePreviews.map((previewUrl, index) => (
                <div
                  key={previewUrl}
                  className="relative group border border-foreground/10 rounded-lg overflow-hidden"
                >
                  {/* Image Preview */}
                  <img
                    src={previewUrl}
                    alt={images[index]?.name || "Preview"}
                    className="w-full h-full object-cover"
                  />

                  {/* File Name Overlay */}
                  <div className="absolute bottom-0 inset-x-0 bg-background/60 text-foreground text-[10px] p-1 truncate">
                    {images[index]?.name}
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="flex absolute top-1 right-1 bg-black/50 hover:bg-black/30 backdrop-blur-lg text-white rounded-full p-1 items-center justify-center text-xs cursor-pointer"
                  >
                    <CloseIcon sx={{ fontSize: "18px" }} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-2">
              No photos selected
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 mt-4 md:mt-6">
            <button type="button" onClick={onClose} className="btn-secondary px-4">
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || images.length === 0}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddPhotosModal;
