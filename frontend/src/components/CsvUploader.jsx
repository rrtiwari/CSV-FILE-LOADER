import React, { useState, useEffect } from "react";
import "../App.css";

const CsvUploader = () => {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const fetchTableData = async (currentPage, searchQuery = "") => {
    try {
      const response = await fetch(
        `https://csv-file-loader.onrender.com/api/data?page=${currentPage}&limit=50&search=${encodeURIComponent(searchQuery)}`,
      );
      const result = await response.json();

      if (response.ok && result.data) {
        setCsvData(result.data);
        setTotalPages(result.totalPages);
      } else {
        setCsvData([]);
        setTotalPages(1);
      }
    } catch (error) {
      setCsvData([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    fetchTableData(page, activeSearch);
  }, [page, activeSearch]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://csv-file-loader.onrender.com/api/upload",
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setPage(1);
        setActiveSearch("");
        setSearchTerm("");
        fetchTableData(1, "");
      } else {
        setMessage(data.error || "Upload failed");
      }
    } catch (error) {
      setMessage("Server error during upload");
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all records? This cannot be undone.",
      )
    )
      return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://csv-file-loader.onrender.com/api/clear",
        {
          method: "DELETE",
        },
      );
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setCsvData([]);
        setTotalPages(1);
        setPage(1);
        setActiveSearch("");
        setSearchTerm("");
      } else {
        setMessage(data.error || "Clear failed");
      }
    } catch (error) {
      setMessage("Server error during clear");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setActiveSearch(searchTerm);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const filterSystemKeys = (key) => {
    return !["_id", "__v", "createdAt", "updatedAt"].includes(key);
  };

  return (
    <div className="app-container">
      <div className="header-actions">
        <div className="upload-section" style={{ marginBottom: 0 }}>
          <input
            type="file"
            accept=".csv"
            className="file-input"
            onChange={handleFileChange}
          />
          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Processing..." : "Upload and Show"}
          </button>
        </div>

        <button
          className="clear-button"
          onClick={handleClearData}
          disabled={loading || csvData.length === 0}
        >
          Clear All Data
        </button>
      </div>

      <div className="search-section" style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Search records..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {message && (
        <div className="status-message" style={{ marginTop: "20px" }}>
          {message}
        </div>
      )}

      {csvData.length > 0 && (
        <>
          <div className="table-container" style={{ marginTop: "20px" }}>
            <table className="csv-table">
              <thead>
                <tr>
                  {Object.keys(csvData[0])
                    .filter(filterSystemKeys)
                    .map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, index) => (
                  <tr key={index}>
                    {Object.entries(row)
                      .filter(([key]) => filterSystemKeys(key))
                      .map(([key, val], i) => (
                        <td key={i}>{val}</td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages === 0 ? 1 : totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CsvUploader;
