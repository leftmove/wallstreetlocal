import styles from "./Table.module.css";

import Loading from "components/Loading/Loading";
import Unavailable from "components/Unavailable/Unavailable";
import Row from "./Row/Row";
import Header from "./Header/Header";
import Pagination from "./Pagination/Pagination";

type TableProps = {
  items: Array<{ id: string; [key: string]: any }>;
  loading?: boolean;
  headers: Array<string>;
  sort: string;
  reverse: boolean;
  activate: (accessor: string, direction: boolean) => void;
  pagination: { sold: boolean; na: boolean; [key: string]: any };
  paginate: (p: number) => void;
  skip: (o: number) => void;
};

const Table: React.FC<TableProps> = (props) => {
  const items = props.items;
  const loading = props.loading || false;

  const headers = props.headers;
  const sort = props.sort;
  const reverse = props.reverse;
  const activate = (accessor: string, direction: boolean) => props.activate(accessor, direction);

  const pagination = props.pagination;
  const paginate = (p: number) => props.paginate(p);
  const skip = (o: number) => props.skip(o);

  return (
    <>
      {items.length <= 0 && loading == false ? (
        <Unavailable
          type="stocks"
          text="No stocks found using the supplied filters."
        />
      ) : null}
      <Pagination pagination={pagination} paginate={paginate} skip={skip} />
      <table className={styles["table"]}>
        <thead>
          {items.length <= 0 && pagination.sold && pagination.na ? null : (
            <Header
              headers={headers}
              sort={sort}
              reverse={reverse}
              activate={activate}
            />
          )}
        </thead>
        <tbody>
          {items.map((i) => (
            <Row key={i.id} item={i} headers={headers} />
          ))}
        </tbody>
        {loading ? <Loading /> : null}
      </table>
      <Pagination pagination={pagination} paginate={paginate} skip={skip} />
    </>
  );
};

export default Table;