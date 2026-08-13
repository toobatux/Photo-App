import { Link } from "react-router";
import Dropdown from "./Dropdown";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

const ProfileModal = ({username, isOpen, onClose, handleLogout}) => {
  return (
    <Dropdown isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col p-1 w-42">
        <Link
          to={`/profile/${username}`}
          onClick={onClose}
          className="flex gap-3 p-2 items-center hover:bg-foreground/5 rounded-lg select-none"
        >
          <PersonOutlineOutlinedIcon
            fontSize="small"
            className="text-foreground/50"
          />
          <span>Profile</span>
        </Link>
        <button
          onClick={onClose}
          className="flex gap-3 p-2 items-center cursor-pointer hover:bg-foreground/5 rounded-lg select-none"
        >
          <NotificationsOutlinedIcon
            fontSize="small"
            className="text-foreground/50"
          />
          <span>Activity</span>
        </button>
        <button
          onClick={onClose}
          className="flex gap-3 p-2 items-center cursor-pointer hover:bg-foreground/5 rounded-lg select-none"
        >
          <BookmarkBorderIcon fontSize="small" className="text-foreground/50" />
          <span>Saved</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full gap-3 p-2 items-center cursor-pointer hover:bg-foreground/5 rounded-lg select-none"
        >
          <LogoutIcon fontSize="small" className="text-foreground/50" />
          <span>Sign out</span>
        </button>
      </div>
      {/* <hr className="border-t border-foreground/5" /> */}
      {/* <div className="flex w-full p-1">
        <button
          onClick={handleLogout}
          className="flex w-full gap-3 p-2 items-center cursor-pointer hover:bg-foreground/5 rounded-lg select-none"
        >
          <LogoutIcon fontSize="small" className="text-foreground/50" />
          <span>Sign out</span>
        </button>
      </div> */}
    </Dropdown>
  );
};

export default ProfileModal;
