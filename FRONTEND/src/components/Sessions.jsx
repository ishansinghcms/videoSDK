import { Link } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import styles from './session.module.css';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessions = async (pageNumber) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:3000/sessions?page=${pageNumber}&limit=5`
      );
      const data = response.data;
      const totalSessions = 22;
      const totalPages = Math.ceil(totalSessions / 5);
      setSessions(data);
      setTotalPages(totalPages);
      setPage(pageNumber);
    } catch (err) {
      setError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(page);
  }, [page]);

  const renderTableRows = useCallback(() => {
    return sessions.map((session, index) => {
      const duration = new Date(session.end) - new Date(session.start);
      const minutes = Math.floor(duration / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);
      return (
        <tr key={index}>
          <td className={styles.cell}>
            <Link to={`/session/${session.name}`}>{session.name}</Link>
          </td>
          <td className={styles.cell}>{`${minutes}m ${seconds}s`}</td>
        </tr>
      );
    });
  });

  return (
    <div className={styles.tableContainer}>
      <div>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Sessions</h1>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Session ID</th>
                <th className={styles.th}>Duration</th>
              </tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        )}

        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>

          <span className={styles.paginationText}>
            {' '}
            Page {page} of {totalPages}{' '}
          </span>

          <button
            className={styles.paginationButton}
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sessions;
