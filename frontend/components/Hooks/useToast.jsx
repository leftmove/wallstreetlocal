import { Toaster, toast as toastFunction } from "sonner";

import { fontLight } from "@fonts";

const useToast = (message, type, timeout = 1000) => {
  const element = () => {
    return (
      <Toaster
        className={fontLight.className}
        toastOptions={{
          style: {
            color: "var(--primary)",
            outline: "var(--secondary-dark)",
            borderColor: "var(--primary-dark)",
            background: "var(--secondary)",
          },
        }}
      />
    );
  };

  const toast = () => {
    if (message) {
      setTimeout(() => {
        if (type === "error") {
          toast.error(message);
        } else if (type === "warning") {
          toast.warning(message);
        } else {
          toast.success(message);
        }
      }, timeout);
    }

    return { element, toast };
  };
};

export default useToast;
