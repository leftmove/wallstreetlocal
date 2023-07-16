import styles from "./Loading.module.css";
import LoadingSVG from "@/public/static/loading.svg";

const Loading = () => {
  return (
    <div className={styles["loading-background"]}>
      <LoadingSVG className={styles["loading"]} />
    </div>
  );
};

export default Loading;
