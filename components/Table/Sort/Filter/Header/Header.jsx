import styles from "./Header.module.css";

import { font } from "@fonts";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Header = (props) => {
  const header = props.header;
  const activate = props.activate;
  const fixed = props.fixed || false;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: header.accessor });
  const style = fixed
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  return (
    <button
      key={header.display}
      className={[
        styles["filter-item"],
        header.active ? styles["filter-clicked"] : "",
        fixed ? styles["filter-fixed"] : "",
        !fixed && isDragging ? styles["filter-dragging"] : "",
      ].join(" ")}
      onClick={() => activate()}
      style={style}
      {...listeners}
      {...attributes}
      ref={setNodeRef}
    >
      <span className={[font.className, styles["filter-text"]].join(" ")}>
        {header.display}
      </span>
    </button>
  );
};

export default Header;
