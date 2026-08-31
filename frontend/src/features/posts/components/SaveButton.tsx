import { useState } from "react";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { customFetch } from "../../../services/api";
import useModal from "../../../hooks/useModal";
import { useAuth } from "../../../context/AuthContext";
import LoginModal from "../../auth/components/LoginModal";

export function SaveButton({
  initialSaved,
  postId,
  showToast,
  isModal = false,
}) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const loginModal = useModal();
  const { user } = useAuth();

  const handleToggleSaved = async () => {
    if (isLoading) return;

    const previousState = isSaved;
    setIsSaved(!previousState);
    setIsLoading(true);

    try {
      const data = await customFetch(`/api/posts/${postId}/save/`, {
        method: "POST",
      });
      setIsSaved(data.is_saved);
      if (data.is_saved) {
        showToast("Saved post", "success");
      } else {
        showToast("Removed post from saved", "success");
      }
    } catch (error) {
      setIsSaved(previousState);
      showToast("Failed to save post: " + error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={user ? handleToggleSaved : loginModal.open}
        aria-label={isSaved ? "Unsave item" : "Save item"}
        className={`flex gap-2 ${isModal ? "nav-btn-secondary-outlined" : "post-btn"} h-[34px] w-[34px] justify-center`}
      >
        {isSaved ? (
          <BookmarkIcon sx={{fontSize: "18px"}} />
        ) : (
          <BookmarkBorderIcon sx={{fontSize: "18px"}} />
        )}
      </button>
      <LoginModal isOpen={loginModal.isOpen} onClose={loginModal.close} />
    </>
  );
}
