import Modal from "./Modal";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { customFetch } from "../services/api";
import { useNavigate } from "react-router";

const EditProfileModal = ({ isOpen, onClose, user, setUser }) => {
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [camera, setCamera] = useState(user?.camera || "");
  const [image, setImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(user?.profile_picture || null);
  const [loading, setLoading] = useState(false);

  let navigate = useNavigate();
  
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      
      // Only attach the picture if the user actually picked a new file!
      if (image) {
        formData.append("profile_picture", image);
      }

      // Send via PATCH
      const updatedProfile = await customFetch("/api/profile/update/", {
        method: "PATCH",
        body: formData,
      });

      // Update global user/profile state so the Navbar & Page re-render immediately
      setUser(updatedProfile);
      onClose();
      navigate(0);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update profile: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return () => {
      // Prevents memory leaks by revoking the object URL when done
      if (previewURL && previewURL.startsWith("blob:")) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);

  const modalContent = (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" header={"Edit Profile"}>
      <div className="flex flex-col relative">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <div className="flex w-full h-full gap-4 pb-4">
            <div className="flex flex-col gap-4 w-full h-full mt-auto">
              <label className="text-sm">Profile picture</label>
              <p className="text-sm text-foreground/70">Recommended 300x300</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleButtonClick}
                  className="nav-btn-secondary flex px-4"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => { setImage(null); setPreviewURL(null); }}
                  className="nav-btn-secondary-outlined flex px-4"
                >
                  Remove
                </button>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <div className="flex w-full h-full justify-center">
              {previewURL ? (
                <img
                  className="rounded-full shadow shadow-black/40 bg-foreground/10 w-[110px] h-[110px] object-cover"
                  src={previewURL}
                  alt="preview"
                />
              ) : (
                <div
                  className="rounded-full shadow-lg shadow-black/40 bg-foreground/10 w-[110px] h-[110px] object-cover"
                >
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col w-full gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-box"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="bio" className="text-sm">
                Bio
              </label>
              <input
                id="id"
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-box"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="camera" className="text-sm">
                Camera
              </label>
              <input
                id="camera"
                type="text"
                value={camera}
                onChange={(e) => setCamera(e.target.value)}
                className="input-box"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary mt-2">
            Save
          </button>
        </form>
      </div>
    </Modal>
  );

  return createPortal(modalContent, document.body);
};

export default EditProfileModal;
