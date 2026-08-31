import Modal from "../../../components/Modal";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { customFetch } from "../../../services/api";
import { useNavigate } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "../schemas/profile.schema";

const EditProfileModal = ({
  isOpen,
  onClose,
  user,
  setUser,
  showToast,
  onUpdate,
}) => {
  const [previewURL, setPreviewURL] = useState(user?.profile_picture || null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      bio: user?.bio || "",
      location: user?.location || "",
      camera: user?.camera || "",
      image: user?.profile_picture || undefined, // Optional file fields default to undefined
    },
  });

  const imageFileList = useWatch({
    control,
    name: "image",
  });

  useEffect(() => {
    const selectedFile = imageFileList?.[0] ?? imageFileList;
    // If image is a FileList (from native file input)
    if (selectedFile && selectedFile instanceof Blob) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewURL(objectUrl);

      // Clean up memory when file changes or component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreviewURL(null);
  }, [imageFileList]);

  useEffect(() => {
    if (!isOpen) {
      // Reverts all fields back to defaultValues & clears validation errors
      reset({
        name: user?.name || "",
        bio: user?.bio || "",
        location: user?.location || "",
        camera: user?.camera || "",
        image: user?.profile_picture || undefined
      });
    }
  }, [isOpen, reset]);

  const { ref: registerRef, ...imageRegisterProps } = register("image");

  const handleChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveClick = () => {
    setValue("image", undefined as any, {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file input DOM state
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);

      if (data.bio) {
        formData.append("bio", data.bio);
      }
      if (data.location) {
        formData.append("location", data.location);
      }
      if (data.camera) {
        formData.append("camera", data.camera);
      }
      if (data.image) {
        formData.append("profile_picture", data.image);
      }

      const updatedProfile = await customFetch("/api/profile/update/", {
        method: "PATCH",
        body: formData,
      });

      onUpdate(updatedProfile);
      showToast("Profile updated successfully", "success");
      setUser(updatedProfile);
      onClose();
    } catch (error) {
      showToast("Failed to update profile: " + error.message, "error");
    }
  };

  const modalContent = (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" header={"Edit Profile"}>
      <div className="flex flex-col relative">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 p-6"
        >
          <div className="flex flex-wrap-reverse sm:flex-nowrap w-full h-full gap-4 pb-4">
            <div className="flex flex-col gap-4 w-full h-full mt-auto">
              <label className="text-sm">Profile picture</label>
              <p className="text-sm text-foreground/70">Recommended 300x300</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleChangeClick}
                  className="nav-btn-secondary flex px-4"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleRemoveClick}
                  className="nav-btn-secondary-outlined flex px-4"
                >
                  Remove
                </button>
              </div>
              {errors.image && (
                <p className="text-sm text-red-500">{errors.image.message as string}</p>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              {...imageRegisterProps}
              ref={(e) => {
                registerRef(e);
                fileInputRef.current = e; // Store local ref for handleButtonClick
              }}
            />

            <div className="flex w-full h-full justify-center">
              {previewURL ? (
                <img
                  className="rounded-full shadow shadow-black/40 bg-foreground/10 w-[110px] h-[110px] min-w-[110px] object-cover"
                  src={previewURL}
                  alt="preview"
                />
              ) : (
                <div className="rounded-full shadow-lg shadow-black/40 bg-foreground/10 w-[110px] h-[110px] object-cover"></div>
              )}
            </div>
          </div>
          <div className="flex flex-col w-full gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className={`block text-sm font-medium ${errors.name ? "text-red-500" : "text-foreground/70"}`}
              >
                Name
              </label>
              <input
                {...register("name")}
                type="text"
                className={`${errors.name && "outline outline-red-500"} input-box`}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="bio" className="text-sm">
                Bio
              </label>
              <input
                {...register("bio")}
                type="text"
                className={`${errors.bio && "outline outline-red-500"} input-box`}
              />
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="location" className={`block text-sm font-medium ${errors.name ? "text-red-500" : "text-foreground/70"}`}>
                Location
              </label>
              <input
                {...register("location")}
                type="text"
                className={`${errors.location && "outline outline-red-500"} input-box`}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="camera" className="text-sm">
                Camera
              </label>
              <input
                {...register("camera")}
                className={`${errors.camera && "outline outline-red-500"} input-box`}
              />
              {errors.camera && (
                <p className="text-sm text-red-500">{errors.camera.message}</p>
              )}
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
