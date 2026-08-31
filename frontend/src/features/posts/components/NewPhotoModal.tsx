import { useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import Modal from "../../../components/Modal";
import { customFetch } from "../../../services/api"
import { createPortal } from "react-dom";

const NewPhotoModal = ({isOpen, onClose, showToast}) => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [tagInput, setTagInput] = useState('');
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
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanedTag = tagInput.trim().replace(/#/g, '');
      if (cleanedTag && !tags.includes(cleanedTag)) {
        setTags([...tags, cleanedTag]);
      }
      setTagInput('');
    }
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return alert("Please select an image");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);
      formData.append('public', 'true');

      const newPost = await customFetch('/api/posts/create/', {
        method: "POST",
        body: formData,
      });
      showToast("Created post successfully", "success");
      onClose();
    } catch (err) {
      showToast("Error creating post. Please try again.", "error");
      console.error("Failed to create post:", err);
      alert("Error creating post: " + err.message);
      setLoading(false);
    }
    // onSubmit({ image, caption, tags });
  };

  const modalContent = (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isClosable={false} header={"New Photo"}>
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-5 p-4 md:p-6 h-full">
        
        {/* Picture Upload Area */}
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            Upload Photo
          </label>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden" 
            required
          />
          
          {imagePreview ? (
            <div className="relative aspect-video w-full rounded border border-foreground/10">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-full w-full object-contain rounded bg-background"
              />
              <button
                type="button"
                onClick={() => { setImage(null); setImagePreview(null); }}
                className="flex items-center justify-center cursor-pointer absolute right-2 top-2 rounded text-sm bg-foreground/60 p-1.5 text-white hover:bg-foreground/50 transition-colors"
              >
                {/* <CloseIcon className="h-4 w-4" /> */}
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-video cursor-pointer w-full flex-col items-center justify-center rounded border-2 border-dashed border-foreground/20 hover:border-foreground/50 bg-foreground/5 transition-colors"
            >
              {/* <ImageIcon className="h-8 w-8 text-zinc-400 dark:text-zinc-600 mb-2" /> */}
              <span className="text-sm font-medium text-foreground/50">Click to upload an image</span>
              <span className="text-xs text-foreground/30 mt-1">PNG, JPG, GIF</span>
            </button>
          )}
        </div>

        {/* Caption Input */}
        <div>
          <label htmlFor="caption" className="block text-sm font-medium text-foreground/70 mb-2">
            Caption
          </label>
          <input
            type="text"
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write something interesting..."
            className="input-box"
          />
        </div>

        {/* Tags Input */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-foreground/70 mb-2">
            Tags
          </label>
          <div className="flex w-full rounded-lg border border-foreground/10 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder-foreground/40 focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground/50">
            {tags.map((tag) => (
              <span 
                key={tag} 
                className="inline-flex items-center gap-2 rounded bg-foreground/10 px-2 py-1 text-xs font-medium text-foreground/70"
              >
                #{tag}
                <button 
                  type="button" 
                  onClick={() => handleRemoveTag(tag)}
                  className="rounded p-0.5 hover:bg-foreground/20"
                >
                  <CloseIcon fontSize="small" className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={tags.length === 0 ? "Add tags (press Enter or comma)" : ""}
              className="flex-1 min-w-[120px] bg-transparent px-1 text-sm text-foreground placeholder-foreground/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 mt-4 md:mt-6">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Publish" }
          </button>
        </div>

      </form>
    </div>
    </Modal>
  )

  return createPortal(modalContent, document.body);
}

export default NewPhotoModal