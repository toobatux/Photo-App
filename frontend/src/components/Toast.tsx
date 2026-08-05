import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";

const Toast = ({ toast, setToast, isTop }) => {
  if (toast)
    return (
      <div className={`fixed ${isTop ? "top-16" : "bottom-16"} right-0 left-0 z-50`}>
        <div className="max-w-5xl mx-auto w-full relative">
          <div
            className={`absolute right-2 top-0 flex w-fit p-3 text-sm text-foreground shadow font-semibold rounded-xl bg-background border border-foreground/10 ${toast.type === "success" && "-green-600"} ${toast.type === "error" && "border-red-600"}`}
          >
            <div className="flex items-center justify-between gap-6">
              <div className="flex gap-3 items-center">
                {toast.type === "success" && (
                  <div className="flex justify-center items-center p-1 rounded-lg bg-green-500/10">
                    <CheckIcon fontSize="small" className="text-green-600" />
                  </div>
                )}
                {toast.type === "error" && (
                  <div className="flex justify-center items-center p-1 rounded-lg bg-red-500/10">
                    <ErrorIcon fontSize="small" className="text-red-600" />
                  </div>
                )}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => setToast(null)}
                className="flex items-center p-1 rounded-full hover:bg-foreground/5 cursor-pointer text-foreground/70 hover:text-foreground"
              >
                <CloseIcon sx={{ fontSize: "18px" }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Toast;
