import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import { Link } from "react-router";

const PostDisplay = ({ posts, handleSelectPost, setSelectedPost, isProfile = false }) => {
  if (posts.length > 0) {
    return (
      <div className="columns-2 md:columns-3 gap-4 w-full -mb-4">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="relative rounded shadow group overflow-clip break-inside-avoid mb-3 inline-block w-full"
          >
            <img
              src={post.image}
              alt=""
              className="bg-foreground/10 shadow-lg w-full cursor-pointer transition-all"
            />
            {/* Protect image */}
            <button
              onClick={() => handleSelectPost(index)}
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-zoom-in flex items-center gap-2 absolute top-0 bottom-0 left-0 right-0 bg-black/30 p-2"
            >
              <span className="sr-only">View post by {post.username}</span>

              {!isProfile && (
                <div className="hidden group-hover:flex transition-opacity items-center absolute top-2 left-2 right-2 p-2">
                  <div className="flex w-full h-full items-end text-sm">
                    <Link
                      to={`/${post.username}`}
                      className="flex items-center gap-4"
                    >
                      <div className="relative min-w-6 min-h-6 rounded-full">
                        <img
                          src={post.profile_pic}
                          alt={post.profile_name}
                          className={`w-8 min-w-8 h-8 shrink-0 cursor-pointer rounded-full border border-foreground/10 hover:border-foreground/15 overflow-hidden`}
                        />
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-transparent rounded-full"></div>
                      </div>

                      <p className="truncate w-full text-white">
                        {post.profile_name}
                      </p>
                    </Link>
                  </div>
                </div>
              )}

              <div className="absolute bottom-2 p-2">
                <div className="flex w-full flex-wrap gap-2">
                  <button
                    className={`flex gap-2 post-btn h-[34px] w-[34px] justify-center`}
                  >
                    <FavoriteBorderIcon fontSize="small" />
                  </button>
                  <button
                    className={`flex gap-2 post-btn h-[34px] w-[34px] justify-center`}
                  >
                    <BookmarkBorderIcon fontSize="small" />
                  </button>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
    );
  } else {
    return <div className="m-auto mt-20">No posts yet</div>;
  }
};

export default PostDisplay;
