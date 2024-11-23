import styles from "./Pagination.module.css";
import {
  LuChevronFirst,
  LuChevronLeft,
  LuChevronRight,
  LuChevronLast,
} from "react-icons/lu";

export default function Pagination({
  currentPage,
  setCurrentPage,
  totalItems,
  itemsPerPage,
}: {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className={styles.pagination}>
      <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
        <LuChevronFirst color="#000" size={20} />
      </button>
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        <LuChevronLeft color="#000" size={20} />
      </button>

      <span>
        {currentPage} / {totalPages}
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        <LuChevronRight color="#000" size={20} />
      </button>
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(totalPages)}
      >
        <LuChevronLast color="#000" size={20} />
      </button>
    </div>
  );
}
