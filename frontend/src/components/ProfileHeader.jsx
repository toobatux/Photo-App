import { useState } from "react";
import useModal from "../hooks/useModal";
import EditProfileModal from "./EditProfileModal";
import LoginModal from "./LoginModal";
import { useAuth } from "../context/AuthContext";

const ProfileHeader = ({
  user,
  photoModal,
  profile_picture,
  name,
  bio,
  followers_count,
  following_count,
}) => {
  const editModal = useModal();
  const loginModal = useModal();
  const [isFollowing, setIsFollowing] = useState(false);
  const { setUser } = useAuth();
  
  return (
    <div className="py-6 md:p-12 border-b border-foreground/10">
      <div className="flex flex-col md:flex-row gap-6 md:gap-12">
        <div className="relative flex-none flex justify-content-center">
          {profile_picture && (
            <img
              className="rounded-full shadow shadow-black/40 bg-foreground/10 w-[110px] h-[110px] md:w-[150px] md:h-[150px] object-cover"
              src={profile_picture}
              alt="Profile"
            />
          )}
          <div
            onClick={photoModal.open}
            className="absolute top-0 right-0 bottom-0 left-0 bg-transparent rounded-full"
          ></div>
        </div>

        <div className="flex-1 flex">
          <div>
            <div className="flex flex-col gap-2 md:gap-4 w-full">
              <h2 className="w-full font-bold text-2xl md:text-4xl break-words whitespace-normal">
                {name}
              </h2>
              <p className="text-sm">{bio}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs mt-4">
                {user && user.name === name ? (
                  <button onClick={editModal.open} className="nav-btn-secondary px-4">Edit profile</button>
                ) : user ? (
                  isFollowing ? (<button onClick={(() => setIsFollowing(false))} className="nav-btn-secondary-outlined px-4">
                     Following
                  </button>) : (<button onClick={(() => setIsFollowing(true))} className="nav-btn-primary px-4">
                    Follow
                  </button>)
                ): (
                  <button onClick={loginModal.open} className="nav-btn-primary px-4">
                    Follow
                  </button>
                )}
                {/* <button className="flex rounded w-[85px] me-4 text-xs h-[32px] justify-center items-center border border-foreground/50 text-foreground hover:bg-foreground/10 font-semibold transition-colors cursor-pointer">
                        Following
                      </button> */}
                      <div className="flex gap-2">
                <div className="">
                  {followers_count ?? 0}{" "}
                  {followers_count === 1 ? "Follower" : "Followers"}
                </div>
                <p className="text-foreground/60">•</p>
                <div className="">{following_count ?? 0} Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EditProfileModal isOpen={editModal.isOpen} onClose={editModal.close} user={user} setUser={setUser}/>
      <LoginModal isOpen={loginModal.isOpen} onClose={loginModal.close}/>
    </div>
  );
};

export default ProfileHeader;
