import { toast } from "sonner";

import Toaster from "components/Toaster/Toaster";

const Health = (props) => {
  if ((props.health || false) === false) {
    setTimeout(() => {
      toast.warning(
        "The server doesn't seem to be healthy, you may encounter errors."
      );
    }, 1000);
  }
  return <Toaster />;
};

export default Health;
