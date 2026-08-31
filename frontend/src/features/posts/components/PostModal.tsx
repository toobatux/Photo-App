import { Link } from "react-router";
import { createPortal } from "react-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import Modal from "../../../components/Modal";
import { useState } from "react";
import useModal from "../../../hooks/useModal";
import { customFetch } from "../../../services/api";
import useToast from "../../../hooks/useToast";
import Toast from "../../../components/Toast";
import { LikeButton } from "./LikeButton";
import { SaveButton } from "./SaveButton";

const PostModal = ({
  selectedPost,
  handleNextPost,
  handlePrevPost,
  postModal,
  user,
  onPostUpdate,
  showDeleteToast,
  onDelete
}) => {
  const [isSaved, setIsSaved] = useState(
    selectedPost.is_saved ? selectedPost.is_saved : false,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(
    selectedPost.caption ? selectedPost.caption : null,
  );
  const [isPublic, setIsPublic] = useState(
    selectedPost.public ? selectedPost.public : true,
  );
  const [loading, setLoading] = useState(false);
  const deleteModal = useModal();
  const { toast, setToast, showToast } = useToast();

  console.log(selectedPost);

  const handleToggleSaved = () => {
    setIsSaved((prev) => !prev);
    if (isSaved) {
      showToast("Unsaved post", "success");
    } else {
      showToast("Saved post", "success");
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);

      const data = await customFetch(`/api/posts/${selectedPost.id}/delete/`, {
        method: "DELETE"
      });

      onDelete(selectedPost.id);
      deleteModal.close();
      postModal.close();
      showDeleteToast("Post deleted successfully", "success");
    } catch (error) {
      showDeleteToast("Failed to delete post", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedPost.caption === caption && selectedPost.public === isPublic) {
      setIsEditing(false);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("public", isPublic);

      const updatedPost = await customFetch(
        `/api/posts/${selectedPost.id}/update/`,
        {
          method: "PATCH",
          body: formData,
        },
      );

      console.log("Updated post", updatedPost);
      showToast("Post updated successfully", "success");

      if (onPostUpdate) {
        onPostUpdate(updatedPost);
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update post:", err);
      showToast("Failed to update post. Please try again.", "error");
      throw new Error(JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const headerContent = (
    <Link
      to={`/profile/${selectedPost.username}`}
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
  );

  const modalContent = (
    <Modal
      isOpen={postModal.isOpen}
      onClose={postModal.close}
      size="xl"
      header={headerContent}
    >
      {toast && <Toast toast={toast} setToast={setToast} />}
      <div className="flex flex-col w-full pt-4">
        {/* Post image */}
        <div className="relative flex w-full h-full px-4 md:px-6 max-h-[60vh] min-h-[300px] items-stretch justify-center">
          <div className="flex w-full justify-center border border-foreground/5 rounded-lg overflow-clip">
            <img
              src={selectedPost.image}
              alt={selectedPost.caption}
              className="bg-foreground/10 object-contain"
            />
          </div>

          <div className="group absolute top-0 right-0 bottom-0 left-0 bg-transparent">
            <div className="relative h-full">
              <div className="hidden group-hover:flex absolute top-1/2 left-6 lg:left-10 z-10">
                <button
                  type="button"
                  onClick={() => handlePrevPost()}
                  className="px-4 post-btn"
                >
                  <NavigateBeforeIcon fontSize="small" />
                </button>
              </div>
              <div className="hidden group-hover:flex absolute top-1/2 right-6 lg:right-10 z-10">
                <button
                  type="button"
                  onClick={() => handleNextPost()}
                  className="post-btn px-4"
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  name="public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic((prev) => !prev)}
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
                    className="btn-secondary px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
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

              <div className="flex w-full justify-between gap-2">
                <div className="flex w-full flex-wrap gap-2">
                  <LikeButton
                    initialLiked={selectedPost.is_liked}
                    totalLikes={selectedPost.total_likes}
                    postId={selectedPost.id}
                    showToast={showToast}
                    isModal={true}
                  />
                  <SaveButton
                    initialSaved={selectedPost.is_saved}
                    postId={selectedPost.id}
                    showToast={showToast}
                    isModal={true}
                  />
                  {user && user.user.username === selectedPost.username && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex nav-btn-secondary px-4"
                    >
                      Edit post
                    </button>
                  )}
                </div>

                {user && user.user.username !== selectedPost.username && (
                  <button className="flex nav-btn-secondary-outlined px-4">
                    Report
                  </button>
                )}
              </div>

              <div className="flex gap-2 items-center text-sm text-foreground/60 pt-4">
                {user && user.user.username === selectedPost.username && (
                  <>
                    <p>{selectedPost.public ? "Public" : "Private"}</p>
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
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        isClosable={false}
        size="sm"
      >
        <div className="p-6">
          <div className="nav-links">
            <div className="flex flex-col gap-2">
              <h1 className="text-lg font-semibold">Delete post</h1>
              <p className="text-foreground/70">
                Are you sure you want to delete this post?
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={deleteModal.close} className="btn-secondary px-4">
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
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
    </Modal>
  );

  return createPortal(modalContent, document.body);
};

export default PostModal;
