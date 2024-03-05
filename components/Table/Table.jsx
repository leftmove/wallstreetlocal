import styles from "./Table.module.css";

import Loading from "@/components/Loading/Loading";
import Row from "./Row/Row";
import Header from "./Header/Header";

const Table = (props) => {
  const items = props.items;
  const loading = props.loading || false;

  const headers = props.headers;
  const sort = props.sort;
  const reverse = props.reverse;
  const activate = (accessor, direction) => props.activate(accessor, direction);

  return (
    <table className={styles["table"]}>
      <thead>
        <Header
          headers={headers}
          sort={sort}
          reverse={reverse}
          activate={activate}
        />
      </thead>
      <tbody>
        {items.map((i) => (
          <Row key={i.id} item={i} headers={headers} />
        ))}
      </tbody>
      {loading ? <Loading /> : null}
    </table>
  );
};

export default Table;
