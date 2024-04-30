import { Toaster, toast } from "sonner";

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
