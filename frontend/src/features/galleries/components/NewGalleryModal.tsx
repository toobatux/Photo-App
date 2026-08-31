import { useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import Modal from "../../../components/Modal";
import { customFetch } from "../../../services/api";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gallerySchema, type GalleryFormData } from "../schemas/gallery.schema";

const NewGalleryModal = ({ isOpen, onClose, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle Tag Addition
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const cleanedTag = tagInput.trim().replace(/#/g, "");
      if (cleanedTag && !tags.includes(cleanedTag)) {
        setTags([...tags, cleanedTag]);
      }
      setTagInput("");
    }
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GalleryFormData>({
    resolver: zodResolver(gallerySchema),
  });

  // Handle Submit
  const onSubmit = async (data: GalleryFormData) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("is_public", "false");

      const newPost = await customFetch("/api/gallery/create/", {
        method: "POST",
        body: formData,
      });
      showToast("Created gallery successfully", "success");
      onClose();
    } catch (err) {
      showToast("Error creating gallery. Please try again.", "error");
      console.error("Failed to create gallery:", err);
      alert("Error creating gallery: " + err.message);
      setLoading(false);
    }
  };

  const modalContent = (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      isClosable={false}
      header={"New Gallery"}
    >
      <div className="relative">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-4 md:p-6 h-full">
          {/* Title Input */}
          <div>
            <label
              htmlFor="name"
              className={`block text-sm font-medium mb-2 ${errors.name ? "text-red-500" : "text-foreground/70"}`}
            >
              Name
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="Self-portraits"
              className={`${errors.name && "outline outline-red-500"} input-box`}
            />
            {errors.name && <p className="text-sm text-red-500 pt-2">{errors.name.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-4 md:mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );

  return createPortal(modalContent, document.body);
};

export default NewGalleryModal;
