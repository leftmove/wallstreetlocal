import { Toaster, toast } from "sonner";
import { fontLight } from "@fonts";
import React from "react";
type HealthProps = {
  health?: boolean;
};
const Health: React.FC<HealthProps> = (props) => {
  const health = props.health || false;
  if (health === false) {
    setTimeout(() => {
      toast.warning(
        "The server doesn't seem to be healthy, you may encounter errors."
      );
    }, 1000);
  }
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