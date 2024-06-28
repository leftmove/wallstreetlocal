import { useEffect } from "react";

import { Toaster, toast } from "sonner";

import { fontLight } from "@fonts";

const Health = (props) => {
  const health = props.health || false;

  if (health === false) {
    setTimeout(() => {
      toast.warning(
        "The server doesn't seem to be healthy, you may encounter errors."
      );
    }, 1000);
  }

  useEffect(() => {
    toast.warning(
      "The server is undergoing maintenance, filers will not work currently."
    );
  });

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

export default Health;
