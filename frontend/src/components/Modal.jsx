"use client";
import React, { ReactNode, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

// interface ModalProps {
//   children: ReactNode;
//   isOpen: boolean;
//   onClose: () => void;
//   size: "sm" | "md" | "lg"
//   header?: ReactNode;
// }

const Modal = ({
  children,
  isOpen,
  onClose,
  size = "md",
  isClosable = true,
  header,
}) => {
  const contentRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e) => {
    if (e.currentTarget.scrollTop > 0) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  if (isOpen) {
    return (
      <div
        onClick={() => isClosable && onClose()}
        id="bg"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      >
        <span className="sr-only">Close modal</span>
        <div
          onClick={(e) => e.stopPropagation()}
          onScroll={handleScroll}
          id="modal"
          className={`
        w-full bg-background rounded-2xl shadow-lg overflow-y-auto max-h-[95vh]
        ${size === "sm" ? "max-w-sm" : ""}
        ${size === "md" ? "max-w-md" : ""} 
        ${size === "lg" ? "max-w-lg" : ""} 
        ${size === "xl" ? "max-w-4xl" : ""}
      `}
        >
          {header && (
            <div
              className={`flex sticky top-0 z-20 bg-background w-full justify-between items-center font-semibold p-4 md:p-6 ${isScrolled ? "shadow dark:shadow-lg transition-shadow" : "border-b border-foreground/5"}`}
            >
              {header}
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-full text-foreground/60 hover:bg-foreground/10 cursor-pointer hover:text-foreground transition-colors"
              >
                <span className="sr-only">Close</span>
                <CloseIcon fontSize="small" />
              </button>
            </div>
          )}

          <div ref={contentRef}>{children}</div>
        </div>
      </div>
    );
  }
};

export default Modal;
