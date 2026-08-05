import { useEffect, useState } from "react";

const useToast = () => {
    const [toast, setToast] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
      };
      useEffect(() => {
        if (toast) {
          const timer = setTimeout(() => setToast(null), 6000);
          return () => clearTimeout(timer);
        }
      }, [toast]
    );

    return {toast, setToast, showToast};
}

export default useToast;