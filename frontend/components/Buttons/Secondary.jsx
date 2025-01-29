import { fontLight } from "fonts";
import { cn } from "components/ui/utils";

const Primary = ({ children, className, ...rest }) => {
  return (
    <button
      className={cn(
        "text-offwhite-one border-2 font-switzer duration-150 border-solid transition-colors font-semibold px-2 py-1 bg-black-one hover:bg-black-two rounded-md text-nowrap",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Primary;
