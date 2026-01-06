import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { getAllBookings, updateBookingStatus, addAdminNote } from "../services/booking.service";
import "../styles/Admin.css";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "in-progress",
  "completed",
  "cancelled",
  "rejected",
];

const statusColor = {
  pending: "#f59e0b",
  confirmed: "#10b981",
  "in-progress": "#3b82f6",
  completed: "#059669",
  cancelled: "#ef4444",
  rejected: "#dc2626",
};

const Bookings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllBookings();
      const list = res?.data?.data || res?.data || [];
      setBookings(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Fetch bookings failed", e);
      setError(e.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
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
      b?._id?.toLowerCase().includes(term) ||
      b?.puja?.name?.toLowerCase().includes(term);
    return matchesStatus && matchesTerm;
  });

  const handleStatus = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
      );
      if (selected?._id === bookingId) {
        setSelected({ ...selected, status });
      }
    } catch (e) {
      console.error("Status update failed", e);
      alert(e.response?.data?.message || "Failed to update status");
    }
  };

  const handleAddNote = async () => {
    if (!selected?._id || !note.trim()) return;
    try {
      const res = await addAdminNote(selected._id, note.trim());
      const updated = res?.data || selected;
      setBookings((prev) =>
        prev.map((b) => (b._id === selected._id ? updated : b))
      );
      setSelected(updated);
      setNote("");
    } catch (e) {
      console.error("Add note failed", e);
      alert(e.response?.data?.message || "Failed to add note");
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Bookings" subtitle="Loading bookings..." />
        <div className="content-area" style={{ padding: 24 }}>Loading...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Bookings" subtitle="Manage puja bookings" />
        <div className="content-area" style={{ padding: 24, color: "#b91c1c" }}>
          {error}
          <div style={{ marginTop: 12 }}>
            <button className="primary-btn" onClick={fetchData}>
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Bookings"
        subtitle={`Total: ${bookings.length} bookings`}
      />
      <div className="content-area" style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Search by user, email, phone, puja, or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px 14px",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              minWidth: 260,
              flex: "1 1 260px",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              background: "white",
            }}
          >
            <option value="all">All status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#6b7280" }}>
              No bookings found
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th className="table-th">ID</th>
                    <th className="table-th">User</th>
                    <th className="table-th">Contact</th>
                    <th className="table-th">Puja</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr
                      key={b._id}
                      className="table-tr"
                      onClick={() => setSelected(b)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="table-td">{b._id?.slice(0, 8)}...</td>
                      <td className="table-td">
                        {b?.user?.name || "Unknown"}
                        <div style={{ color: "#6b7280", fontSize: 12 }}>
                          {b?.user?.email || "—"}
                        </div>
                      </td>
                      <td className="table-td">{b?.user?.phone || "—"}</td>
                      <td className="table-td">{b?.puja?.name || "—"}</td>
                      <td className="table-td">
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: `${statusColor[b.status] || "#6b7280"}20`,
                            color: statusColor[b.status] || "#374151",
                            fontWeight: 600,
                            fontSize: 12,
                            textTransform: "capitalize",
                          }}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="table-td">
                        {new Date(b.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                maxWidth: 720,
                width: "100%",
                maxHeight: "90vh",
                overflow: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>Booking Details</h3>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 20,
                    cursor: "pointer",
                    color: "#6b7280",
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
                <Info label="Puja" value={selected?.puja?.name} />
                <Info label="Price" value={selected?.puja?.price ? `₹${selected.puja.price}` : "—"} />
                <Info label="Created" value={new Date(selected.createdAt).toLocaleString()} />
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Update Status</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatus(selected._id, s)}
                      disabled={selected.status === s}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "none",
                        cursor: selected.status === s ? "not-allowed" : "pointer",
                        background: selected.status === s ? "#e5e7eb" : statusColor[s] || "#374151",
                        color: selected.status === s ? "#6b7280" : "#fff",
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {s}
                    </button>
                  ))}
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
                  <button className="primary-btn" onClick={handleAddNote} disabled={!note.trim()}>
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
                          {new Date(n.createdAt).toLocaleString()}
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
    </>
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

export default Bookings;

