import React, { useEffect, useState } from "react";
import {
  getAllBookings,
  updateBookingStatus,
  addAdminNote
} 
from "../../services/booking.service";

const PujaBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await getAllBookings();
      setBookings(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.msg ||
          "Failed to load bookings"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b))
      );
      if (selected?._id === id) setSelected({ ...selected, status });
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.response?.data?.msg ||
          "Failed to update status"
      );
    }
  };

  const handleAddNote = async (id) => {
    if (!note.trim()) return;
    try {
      const res = await addAdminNote(id, note.trim());
      const updated = res?.data || bookings.find((b) => b._id === id);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, ...updated } : b))
      );
      if (selected?._id === id) setSelected({ ...selected, ...updated });
      setNote("");
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.response?.data?.msg ||
          "Failed to add note"
      );
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const term = search.trim().toLowerCase();
    const matchesTerm =
      !term ||
      b?.user?.name?.toLowerCase().includes(term) ||
      b?.user?.email?.toLowerCase().includes(term) ||
      b?.user?.phone?.toLowerCase().includes(term) ||
      b?.puja?.name?.toLowerCase().includes(term) ||
      b?._id?.toLowerCase().includes(term);
    return matchesStatus && matchesTerm;
  });

  if (loading) return <div className="content-area" style={{ padding: 24 }}>Loading bookings...</div>;
  if (error) return <div className="content-area" style={{ padding: 24, color: "#b91c1c" }}>{error}</div>;

  return (
    <div className="content-area" style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by user, email, phone, puja, or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            minWidth: 240,
            flex: "1 1 240px",
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "10px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            background: "white",
          }}
        >
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Contact</th>
              <th>Puja</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 16 }}>
                  No bookings found
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b._id} onClick={() => setSelected(b)} style={{ cursor: "pointer" }}>
                  <td>{b._id?.slice(0, 8)}...</td>
                  <td>{b.user?.name || "N/A"}</td>
                  <td>{b.user?.phone || "—"}</td>
                  <td>{b.puja?.name || b.puja?.title || "N/A"}</td>
                  <td style={{ textTransform: "capitalize" }}>{b.status}</td>
                  <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 24,
              width: "100%",
              maxWidth: 700,
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Booking Details</h3>
              <button
                onClick={() => setSelected(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Info label="Booking ID" value={selected._id} />
              <Info label="Status" value={selected.status} />
              <Info label="User" value={selected?.user?.name} />
              <Info label="Email" value={selected?.user?.email} />
              <Info label="Phone" value={selected?.user?.phone} />
              <Info label="Puja" value={selected?.puja?.name || selected?.puja?.title} />
              <Info label="Price" value={selected?.puja?.price ? `₹${selected.puja.price}` : "—"} />
              <Info
                label="Created"
                value={selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "—"}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Update Status</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["pending", "confirmed", "in-progress", "completed", "cancelled", "rejected"].map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selected._id, s)}
                      disabled={selected.status === s}
                      className="primary-btn"
                      style={{
                        background: selected.status === s ? "#e5e7eb" : "#c41e3a",
                        color: selected.status === s ? "#6b7280" : "#fff",
                        cursor: selected.status === s ? "not-allowed" : "pointer",
                      }}
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Admin Notes</div>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  resize: "vertical",
                }}
              />
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button className="primary-btn" onClick={() => handleAddNote(selected._id)} disabled={!note.trim()}>
                  Add Note
                </button>
                <button className="secondary-btn" onClick={() => setNote("")}>
                  Clear
                </button>
              </div>

              {selected.adminNotes?.length ? (
                <div style={{ marginTop: 12, borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
                  {selected.adminNotes.map((n, idx) => (
                    <div key={idx} style={{ marginBottom: 8, color: "#111827" }}>
                      <div style={{ fontWeight: 600 }}>{n.note}</div>
                      <div style={{ color: "#6b7280", fontSize: 12 }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: 8, color: "#6b7280", fontSize: 14 }}>No notes yet</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", marginBottom: 4 }}>
      {label}
    </div>
    <div style={{ fontWeight: 600, color: "#111827" }}>{value || "—"}</div>
  </div>
);

export default PujaBooking;
