const Footer = () => {
  return (
    <div>
      {/* <div className="ps-0 pe-0">
        <svg viewBox="0 45 310 35" width="100%">
          <path fill="#121212" />
          <path
            d="M0 47v75h375v-14.99c-78.339-72.46-180.105-42.829-231.209-35.956C98.397 77.159 41 80.764 0 47"
            fill="#121212"
          />
          <g clipPath="url(#a)" fill="#121212">
            <path d="" />
          </g>
          <defs>
            <clipPath id="a">
              <path fill="#121212" d="" />
            </clipPath>
          </defs>
        </svg>
      </div> */}
      <footer className="p-4 md:p-6 border-t border-foreground/10">
        <div className="flex w-full max-w-5xl m-auto justify-between">
          <p className="text-xs text-foreground/60">ShowMe ©{new Date().getFullYear().toString()} </p>
          <p className="text-xs text-foreground/60">Made by Tom Krusinski</p>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
