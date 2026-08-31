import { useState } from "react";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { customFetch } from "../../../services/api";
import LoginModal from "../../auth/components/LoginModal";
import useModal from "../../../hooks/useModal";
import { useAuth } from "../../../context/AuthContext";

export function LikeButton({
  initialLiked,
  totalLikes,
  postId,
  showToast,
  isModal = false,
}) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(totalLikes);
  const [isLoading, setIsLoading] = useState(false);
  const loginModal = useModal();
  const { user } = useAuth();

  const handleToggleLiked = async () => {
    if (isLoading) return;

    const previousState = isLiked;
    setIsLiked(!previousState);
    setIsLoading(true);

    try {
      const data = await customFetch(`/api/posts/${postId}/like/`, {
        method: "POST",
      });
      setIsLiked(data.is_liked);
      setLikes(data.likes_count);
      if (data.is_liked) {
        showToast("Liked post", "success");
      } else {
        showToast("Removed like from post", "success");
      }
    } catch (error) {
      setIsLiked(previousState);
      showToast("Failed to like post: " + error.message, "error");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={user ? handleToggleLiked : loginModal.open}
        aria-label={isLiked ? "Unlike item" : "Like item"}
        className={`flex gap-2 items-center ${isModal ? "nav-btn-secondary-outlined" : "post-btn"} h-[34px] px-2 justify-center`}
      >
        {isLiked ? (
          <FavoriteIcon sx={{fontSize: "18px"}} className="text-rose-500" />
        ) : (
          <FavoriteBorderIcon sx={{fontSize: "18px"}} />
        )}

        {likes > 0 && <span className="text-xs">{likes}</span>}
      </button>
      <LoginModal isOpen={loginModal.isOpen} onClose={loginModal.close} />
    </>
  );
}
