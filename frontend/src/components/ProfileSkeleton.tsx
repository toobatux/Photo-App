const ProfileSkeleton = () => {
  const skeletonHeights = ["h-40", "h-52", "h-64", "h-48", "h-60"];

  return (
    <div className="flex w-full flex-col z-10">
      {/* Heading */}
      <div className="py-6 md:p-12 border-b border-foreground/10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-12">
          {/* Profile picture */}
          <div className="rounded-full shadow shadow-black/40 bg-foreground/10 animate-pulse w-[110px] h-[110px] md:w-[150px] md:h-[150px] object-cover"></div>

          <div className="flex-1 flex w-full">
            <div className="flex w-full">
              <div className="flex w-full flex-col gap-2 md:gap-4">
                {/* Name */}
                <div className="w-1/2 h-8 bg-foreground/10 rounded animate-pulse"></div>

                {/* Bio */}
                <div className="flex h-5 w-2/3 bg-foreground/10 rounded animate-pulse"></div>

                <div className="flex flex-wrap items-center gap-4 text-xs mt-4">
                  {/* Follow button */}
                  <div className="nav-btn-primary px-4 w-18 h-8.5 pointer-events-none select-none">
                    Follow
                  </div>

                  <div className="flex gap-2">
                    <div className="flex gap-1">
                      <div className="h-4 w-6 rounded bg-foreground/10 animate-pulse"></div>
                      Followers
                    </div>
                    <p className="text-foreground/60">•</p>
                    <div className="flex gap-1">
                      <div className="h-4 w-6 rounded bg-foreground/10 animate-pulse"></div>
                      Following
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post display */}
      <div className="pt-6 md:pt-12">
        <div className="columns-2 md:columns-3 gap-4 w-full -mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((post, index) => {
            const randomHeight = skeletonHeights[(index * 4) % skeletonHeights.length];

            return (
              <div
                key={index}
                className={`relative w-full ${randomHeight} bg-foreground/10 animate-pulse rounded shadow group overflow-clip break-inside-avoid mb-3 inline-block`}
              >
                <div className="bg-foreground/10 shadow-lg w-full cursor-pointer transition-all"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
