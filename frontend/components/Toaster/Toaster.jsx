import { Toaster } from "sonner";

import { fontLight } from "@fonts";

const Toast = () => {
  return (
    <Toaster
      className={fontLight.className}
      toastOptions={{
        style: {
          color: "var(--offwhite)",
          outline: "var(--secondary-dark)",
          borderColor: "var(--offwhite-dark)",
          background: "var(--secondary)",
        },
      }}
    />
  );
};

export default Toast;
