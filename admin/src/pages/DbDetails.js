import React, { useEffect, useState } from "react";
import axios from "axios";

function PujaDocs() {
  const [pujas, setPujas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPujas = async () => {
      try {
        const res = await axios.get("http://backend.sankalpam.world/api/pujas");
        setPujas(res.data);
      } catch (error) {
        console.error("Failed to fetch puja records", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPujas();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Puja Bookings</h2>

      {pujas.map((item) => (
        <div key={item._id} style={styles.card}>
          <div style={styles.row}>
            <span style={styles.label}>Puja Name</span>
            <span>{item.pujaName}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Karta Name</span>
            <span>{item.kartaName}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Phone</span>
            <span>{item.phone}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Price</span>
            <span>{item.price}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Transaction ID</span>
            <span>{item.transactionId}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Status</span>
            <span
              style={{
                ...styles.status,
                backgroundColor:
                  item.status === "success" ? "#d1e7dd" : "#fff3cd",
                color:
                  item.status === "success" ? "#0f5132" : "#856404",
              }}
            >
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "25px",
    color: "#2c3e50",
  },
  card: {
    backgroundColor: "#fff",
    maxWidth: "700px",
    margin: "0 auto 20px",
    padding: "18px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
  },
  label: {
    fontWeight: "bold",
    color: "#555",
    width: "40%",
  },
  status: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
};

export default PujaDocs;
