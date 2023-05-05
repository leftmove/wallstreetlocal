import styles from "./Loading.module.css";
import LoadingIcon from "./loading.svg";

const Loading = () => {
  return (
    <div className={styles["loading-background"]}>
      <LoadingIcon className={styles["loading"]} />
    </div>
  );
};

export default Loading;
