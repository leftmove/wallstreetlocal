import styles from "./Table.module.css";

import Loading from "components/Loading/Loading";
import Unavailable from "components/Unavailable/Unavailable";
import Row from "./Row/Row";
import Header from "./Header/Header";
import Pagination from "./Pagination/Pagination";

const Table = (props) => {
  const items = props.items;
  const loading = props.loading || false;

  const headers = props.headers;
  const sort = props.sort;
  const reverse = props.reverse;
  const activate = (accessor, direction) => props.activate(accessor, direction);

  const pagination = props.pagination;
  const paginate = (p) => props.paginate(p);
  const skip = (o) => props.skip(o);

  // const randomString = Math.random().toString(36).substring(7);
  // console.log(items, randomString);

  return (
    <>
      {items.length <= 0 && loading == false ? (
        <Unavailable
          type="stocks"
          text="No stocks found using the supplied filters."
        />
      ) : null}
      <Pagination pagination={pagination} paginate={paginate} skip={skip} />
      <div className="overflow-x-auto">
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
        </table>
        {loading ? <Loading /> : null}
      </div>

      <Pagination pagination={pagination} paginate={paginate} skip={skip} />
    </>
  );
};

export default Table;
