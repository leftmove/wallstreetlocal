import styles from "./Loading.module.css";
import LoadingSVG from "@/public/static/loading.svg";

interface LoadingProps {
  className?: string;
}

const Loading: React.FC<LoadingProps> = (props) => {
  return (
    <div className={[styles["loading-background"], props.className].join(" ")}>
      <LoadingSVG className={styles["loading"]} />
    </div>
  );
};

export default Loading;