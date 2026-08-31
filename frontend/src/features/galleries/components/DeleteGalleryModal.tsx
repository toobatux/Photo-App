import { createPortal } from "react-dom";
import Modal from "../../../components/Modal";
import { useState } from "react";
import { customFetch } from "../../../services/api";

const DeleteGalleryModal = ({isOpen, onClose, onDelete}) => {
  const [loading, setLoading] = useState(false);

  const modalContent = (
    <Modal isOpen={isOpen} onClose={onClose} size="md" header={"Delete Gallery"}>
      <div className="p-6">
          <div className="nav-links">
            <div className="flex flex-col gap-4 md:gap-6">
              <p className="text-foreground/70">
                Are you sure you want to delete this gallery?
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={onClose} className="btn-secondary px-4">
                  Cancel
                </button>
                <button
                  onClick={onDelete}
                  disabled={loading}
                  className="btn-destructive-outlined px-4"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
    </Modal>
  );

  return createPortal(modalContent, document.body);
}

export default DeleteGalleryModal;