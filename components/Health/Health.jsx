import { Toaster, toast } from "sonner";

import { font, fontLight } from "@fonts";
import { internalMutate } from "swr/_internal";

const Health = (props) => {
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
      toastOptions={{
        style: {
          font: font.className,
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
