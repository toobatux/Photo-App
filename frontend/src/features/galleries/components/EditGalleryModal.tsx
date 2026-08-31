import Modal from "../../../components/Modal";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { customFetch } from "../../../services/api";
import { useNavigate } from "react-router";
import useModal from "../../../hooks/useModal";
import DeleteGalleryModal from "./DeleteGalleryModal";
import { useAuth } from "../../../context/AuthContext";

const EditGalleryModal = ({
  isOpen,
  onClose,
  gallery,
  showToast,
  onUpdate,
}) => {
  const [title, setTitle] = useState(gallery?.title || "");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  let navigate = useNavigate();

  const deleteModal = useModal();

  const handleDelete = async () => {
    try {
      if (!user) return;
      setLoading(true);

      const data = await customFetch(`/api/galleries/${gallery.id}/delete/`, {
        method: "DELETE"
      });

      deleteModal.close()
      navigate(`/profile/${user.user.username}`)
      onClose();
      showToast("Gallery deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete gallery", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);

      // Send via PATCH
      const updatedGallery = await customFetch(`/api/galleries/${gallery.id}/update/`, {
        method: "PATCH",
        body: formData,
      });

      onUpdate(updatedGallery);

      showToast("Gallery updated successfully", "success");

      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      showToast("Failed to update gallery. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <>
    <Modal isOpen={isOpen} onClose={onClose} size="lg" header={"Edit Gallery"} isClosable={false}>
      <div className="flex flex-col relative">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <div className="flex flex-col w-full gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-box"
              />
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-4 mt-4">
            <button
              type="button"
              onClick={deleteModal.open}
              className="flex w-fit px-4 btn-destructive-outlined"
            >
              Delete
            </button>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary px-4"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
    <DeleteGalleryModal isOpen={deleteModal.isOpen} onClose={deleteModal.close} onDelete={handleDelete}/>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default EditGalleryModal;
