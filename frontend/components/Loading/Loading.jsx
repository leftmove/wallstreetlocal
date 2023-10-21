import styles from "./Loading.module.css";
import LoadingSVG from "@/public/static/loading.svg";

const Loading = (props) => {
  return (
    <div className={[styles["loading-background"], props.className].join(" ")}>
      <LoadingSVG className={styles["loading"]} />
    </div>
  );
};

export default Loading;
