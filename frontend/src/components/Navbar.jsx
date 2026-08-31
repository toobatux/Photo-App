import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import useModal from "../hooks/useModal";
import LoginModal from "../features/auth/components/LoginModal";
import Dropdown from "./Dropdown";
import PhotoOutlinedIcon from "@mui/icons-material/PhotoOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import { useAuth } from "../context/AuthContext";
import ProfileModal from "../features/profile/components/ProfileModal";
import useToast from "../hooks/useToast";
import Toast from "./Toast";
import NewPhotoModal from "../features/posts/components/NewPhotoModal";
import NewGalleryModal from "../features/galleries/components/NewGalleryModal";

const Navbar = () => {
  const [solidNav, setSolidNav] = useState(false);

  const { user, setUser, loading } = useAuth();
  const { toast, setToast, showToast } = useToast();

  const createDropdown = useModal();
  const newPhotoModal = useModal();
  const newGalleryModal = useModal();
  const loginModal = useModal();
  const logoutModal = useModal();
  const profileModal = useModal();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY > 5) {
        setSolidNav(true);
      } else {
        setSolidNav(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logoutModal.open();
    profileModal.close();
  };

  return (
    <>
      <div
        className={`flex sticky top-0 z-20 w-full h-[55px] bg-background border-b px-4 md:px-6 items-center transition-all duration-75 
        ${solidNav ? "shadow-lg border-transparent" : "border-foreground/10"}
      `}
      >
        {/* <div className="sticky top-0 z-40 flex w-full h-[60px] bg-[#181818] p-4 border-b border-white/5"> */}
        <div className="flex relative w-full max-w-5xl items-center justify-between gap-4 m-auto">
          <Link to={"/"} className="lobster-regular">
            <b className="hidden md:flex">ShowMe</b>
            <b className={`flex md:hidden`}>SM</b>
          </Link>

          <div className="flex lg:absolute w-full max-w-[500px] lg:right-1/2 lg:translate-x-1/2">
            <div className="relative flex grow h-8 items-center bg-foreground/5 hover:bg-foreground/10 rounded-lg text-sm">
              <label htmlFor="search-photos-input" className="sr-only">
                Search photos
              </label>

              <div className="absolute top-1/2 -translate-y-1/2 left-2">
                <SearchIcon sx={{ fontSize: "18px" }} className="text-foreground/20" />
              </div>
              <input
                id="search-photos-input"
                type="text"
                placeholder="Search photos"
                className="flex w-full h-full pl-9 pr-2 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <div className="relative">
            <button
              onClick={user ? createDropdown.open : loginModal.open}
              className="nav-btn-secondary-outlined flex w-8 max-h-[32px] md:w-full md:px-2 gap-2 items-center justify-center border border-foreground/10 text-foreground/70 rounded-lg hover:bg-foreground/10 hover:text-foreground cursor-pointer"
            >
              <AddIcon sx={{ fontSize: "18px" }} />
              <p className="hidden md:flex pe-2 text-sm">Create</p>
            </button>
            {createDropdown.isOpen && (
              <Dropdown
                isOpen={createDropdown.open}
                onClose={createDropdown.close}
              >
                <div className="flex flex-col p-1 w-32">
                  <button
                    onClick={() => { newPhotoModal.open(); createDropdown.close(); }}
                    className="flex gap-3 p-2 items-center cursor-pointer hover:bg-foreground/5 rounded-lg select-none"
                  >
                    <PhotoOutlinedIcon
                      sx={{ fontSize: "18px" }}
                      className="text-foreground/50"
                    />
                    <span>Photo</span>
                  </button>
                  <button onClick={() => { newGalleryModal.open(); createDropdown.close(); }} className="flex gap-3 p-2 items-center cursor-pointer hover:bg-foreground/5 rounded-lg select-none">
                    <PhotoLibraryOutlinedIcon
                      sx={{ fontSize: "18px" }}
                      className="text-foreground/50"
                    />
                    <span>Gallery</span>
                  </button>
                </div>
              </Dropdown>
            )}
            </div>

            {user ? (
              <div className="relative flex items-center">
                <button
                  onClick={profileModal.open}
                  className={`flex w-8 h-8 shrink-0 cursor-pointer rounded-full border border-foreground/10 hover:border-foreground/15 overflow-hidden ${profileModal.isOpen && "outline-4 rounded-full outline-foreground/20"}`}
                >
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-transparent rounded-full"></div>
                  <img
                    src={user?.profile_picture}
                    alt={user?.user?.username}
                    className="object-cover bg-foreground/10"
                  />
                </button>
                {profileModal.isOpen && (
                  <ProfileModal
                    username={user.user.username}
                    isOpen={profileModal.isOpen}
                    onClose={profileModal.close}
                    handleLogout={handleLogout}
                  />
                )}
              </div>
            ) : (
              <button
                onClick={loginModal.open}
                className="nav-btn-secondary-outlined px-4"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>

      {newPhotoModal.isOpen && (
        <NewPhotoModal
          isOpen={newPhotoModal.isOpen}
          onClose={newPhotoModal.close}
          showToast={showToast}
        />
      )}

      {newGalleryModal.isOpen && (
        <NewGalleryModal
          isOpen={newGalleryModal.isOpen}
          onClose={newGalleryModal.close}
          showToast={showToast}
        />
      )}

      {loginModal.isOpen && (
        <LoginModal
          user={user}
          setUser={setUser}
          isOpen={loginModal.isOpen}
          onClose={loginModal.close}
          showToast={showToast}
        />
      )}
      {logoutModal.isOpen && (
        <LoginModal
          user={user}
          setUser={setUser}
          isOpen={logoutModal.isOpen}
          onClose={logoutModal.close}
          showToast={showToast}
        />
      )}

      {toast && <Toast toast={toast} setToast={setToast} />}
    </>
  );
};

export default Navbar;
