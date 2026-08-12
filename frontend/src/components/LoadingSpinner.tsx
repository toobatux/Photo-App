export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <svg
      className={`${sizeClasses[size]} animate-spin text-primary`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      {/* Background ring (faint) */}
      <circle
        className="opacity-25 stroke-current"
        cx="12"
        cy="12"
        r="10"
        strokeWidth="4"
      />
      {/* Spinning arc (solid notch) */}
      <path
        className="opacity-75 fill-current"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}