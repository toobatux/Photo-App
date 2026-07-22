import { Link } from "react-router";
import { createPortal } from "react-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CloseIcon from "@mui/icons-material/Close";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
// import FavoriteIcon from "@mui/icons-material/Favorite";
// import useModal from "../hooks/useModal";
import Modal from "../components/Modal";
import { useEffect, useRef, useState } from "react";
import useModal from "../hooks/useModal";

const PostModal = ({
  selectedPost,
  handleNextPost,
  handlePrevPost,
  postModal,
  user,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(
    selectedPost.caption ? selectedPost.caption : null,
  );
  const deleteModal = useModal();

  const handleToggleLiked = () => {
    setIsLiked((prev) => !prev);
  };
  const handleToggleSaved = () => {
    setIsSaved((prev) => !prev);
  };

  const handleDelete = () => {
    deleteModal.close();
    postModal.close();
  }

  const headerContent = (
    <Link
            to={`/${selectedPost.username}`}
            className="flex w-fit items-center gap-4 text-sm group cursor-pointer"
          >
            <div className="relative">
              <img
                src={selectedPost.profile_pic}
                alt={selectedPost.username}
                className="w-8 h-8 rounded-full bg-foreground/10"
              />
              <div className="absolute top-0 right-0 bottom-0 left-0 cursor-pointer"></div>
            </div>
            <p className="group-hover:underline">{selectedPost.profile_name}</p>
          </Link>
  )

  const modalContent = (
    <Modal isOpen={postModal.isOpen} onClose={postModal.close} size="xl" header={headerContent}>
      <div
        className="flex flex-col w-full pt-4"
      >
        {/* Post image */}
        <div
          className="relative flex w-full h-full px-4 md:px-6 max-h-[65vh] items-stretch justify-center"
        >
          <div className="flex w-full justify-center border border-foreground/5 rounded-lg overflow-clip">
            <img
              src={selectedPost.image}
              alt={selectedPost.caption}
              className="bg-foreground/10 object-contain"
            />
          </div>

          <div className="group absolute top-0 right-0 bottom-0 left-0 bg-transparent hover:bg-background/20">
            <div className="relative h-full">
              <div className="hidden group-hover:flex absolute top-1/2 left-6 lg:left-10 z-10">
                <button
                  type="button"
                  onClick={() => handlePrevPost()}
                  className="nav-btn-secondary px-4"
                >
                  <NavigateBeforeIcon fontSize="small" />
                </button>
              </div>
              <div className="hidden group-hover:flex absolute top-1/2 right-6 lg:right-10 z-10">
                <button
                  type="button"
                  onClick={() => handleNextPost()}
                  className="nav-btn-secondary px-4"
                >
                  <NavigateNextIcon fontSize="small" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Post options and metadata */}
        <div className="flex flex-col w-full gap-4 p-4 md:p-6">
          {isEditing ? (
            <form className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="caption"
                  className="block text-sm font-medium text-foreground/70 mb-2"
                >
                  Caption
                </label>
                <input
                  type="text"
                  name="caption"
                  value={caption}
                  placeholder={"Write a caption here..."}
                  onChange={(e) => setCaption(e.target.value)}
                  className="input-box"
                />
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="caption"
                  className="block text-sm font-medium text-foreground/70"
                >
                  Public
                </label>
                <input
                  type="checkbox"
                  name="caption"
                  value={selectedPost.caption}
                />
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
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    // disabled={loading}
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div>
              {selectedPost.caption && (
                <div className="text-sm mb-4">{selectedPost.caption}</div>
              )}

              <div className="flex w-full flex-wrap gap-2">
                <button
                  onClick={handleToggleLiked}
                  className={`flex gap-2 nav-btn-secondary-outlined h-[34px] w-[34px] justify-center`}
                >
                  {isLiked ? (
                    <FavoriteIcon fontSize="small" className="text-rose-500" />
                  ) : (
                    <FavoriteBorderIcon fontSize="small" />
                  )}
                </button>
                <button
                  onClick={handleToggleSaved}
                  className={`flex gap-2 nav-btn-secondary-outlined h-[34px] w-[34px] justify-center`}
                >
                  {isSaved ? (
                    <BookmarkIcon fontSize="small" />
                  ) : (
                    <BookmarkBorderIcon fontSize="small" />
                  )}
                </button>
                {user && user.user.username === selectedPost.username && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex nav-btn-secondary px-4"
                  >
                    Edit post
                  </button>
                )}
              </div>

              <div className="flex gap-2 items-center text-sm text-foreground/60 pt-4">
                {user && user.user.username === selectedPost.username && (
                  <>
                    <p>Public</p>
                    <p className="text-foreground/60">•</p>
                  </>
                )}
                <p>
                  Published on{" "}
                  {new Date(selectedPost.created_on).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.close} isClosable={false} size="sm">
        <div className="p-6">
          <div className="nav-links">
            <div className="flex flex-col gap-2">
              <h1 className="text-lg font-semibold">Delete post</h1>
              <p className="text-foreground/70">Are you sure you want to delete this post?</p>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={deleteModal.close} className="btn-secondary">Cancel</button>
              <button
                onClick={handleDelete}
                className="btn-destructive-outlined px-4"
              >
                Delete
              </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Modal>
  );

  return createPortal(modalContent, document.body);
};

export default PostModal;
