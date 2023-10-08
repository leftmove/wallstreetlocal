import styles from "./Loading.module.css";
import LoadingSVG from "@/public/static/loading.svg";

const Loading = (props) => {
  const variant = props.variant || "default";
  return (
    <div
      className={[
        styles["loading-background"],
        variant === "clear" ? styles["no-background"] : "",
        props.className,
      ].join(" ")}
    >
      <LoadingSVG className={styles["loading"]} />
    </div>
  );
};

export default Loading;
