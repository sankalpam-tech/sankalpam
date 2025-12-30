import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPass = () => {
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 8) {
            alert("Password must be at least 8 characters");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const recoveryValue = localStorage.getItem("recovery");

            if (!recoveryValue) {
                alert("Session expired. Please try again.");
                navigate("/forgot");
                return;
            }

            const res = await axios.post(
                "http://backend.sankalpam/auth/reset",
                {
                    emailOrPhone: recoveryValue,   // ✅ ADD THIS
                    newPassword: password,
                }
            );

            // backend returns true / false
            if (res.data === true) {
                alert("updated");
                localStorage.removeItem("recovery");
                navigate("/signin");
            } else {
                alert("Password update failed");
            }
        } 
        catch (error) {
            alert("Password update failed");
        }
    };

    /* ================= STYLES ================= */
    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: "#231a10",
            color: "#ffffff",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            display: "flex",
            flexDirection: "column",
        },

        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: "1px solid #684d31",
        },

        logo: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "18px",
            fontWeight: "700",
            color: "#ffffff",
        },

        backBtn: {
            height: "40px",
            padding: "0 16px",
            borderRadius: "999px",
            backgroundColor: "#f2800d",
            color: "#231a10",
            fontWeight: "700",
            border: "none",
            cursor: "pointer",
        },

        main: {
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "24px",
        },

        card: {
            width: "100%",
            maxWidth: "520px",
            background: "rgba(35, 26, 16, 0.85)",
            backdropFilter: "blur(12px)",
            borderRadius: "24px",
            border: "1px solid #684d31",
            padding: "32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        },

        icon: {
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#342618",
            border: "1px solid #684d31",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#f2800d",
            fontSize: "28px",
            margin: "0 auto 20px",
        },

        title: {
            textAlign: "center",
            fontSize: "28px",
            fontWeight: "800",
            marginBottom: "8px",
        },

        subtitle: {
            textAlign: "center",
            fontSize: "14px",
            color: "#cbad90",
            marginBottom: "32px",
        },

        label: {
            fontSize: "14px",
            marginBottom: "6px",
            color: "#ffffff",
        },

        inputGroup: {
            display: "flex",
            alignItems: "center",
            border: "1px solid #684d31",
            borderRadius: "12px",
            backgroundColor: "#342618",
            overflow: "hidden",
        },

        input: {
            flex: 1,
            padding: "14px 16px",
            background: "transparent",
            border: "none",
            color: "#ffffff",
            fontSize: "15px",
            outline: "none",
        },

        toggleBtn: {
            padding: "0 16px",
            background: "transparent",
            border: "none",
            color: "#cbad90",
            cursor: "pointer",
            fontSize: "18px",
        },

        strengthRow: {
            display: "flex",
            gap: "4px",
            marginTop: "8px",
        },

        strengthBar: (active) => ({
            flex: 1,
            height: "4px",
            borderRadius: "999px",
            backgroundColor: active ? "#f2800d" : "#342618",
        }),

        hint: {
            fontSize: "12px",
            color: "#cbad90",
            marginTop: "6px",
        },

        submitBtn: {
            marginTop: "24px",
            height: "48px",
            borderRadius: "999px",
            backgroundColor: "#f2800d",
            border: "none",
            color: "#231a10",
            fontWeight: "800",
            fontSize: "16px",
            cursor: "pointer",
        },

        cancel: {
            marginTop: "24px",
            textAlign: "center",
            fontSize: "14px",
            color: "#cbad90",
            cursor: "pointer",
        },
    };

    /* ================= JSX ================= */
    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div style={styles.logo}>Sankalpam</div>
                <button style={styles.backBtn}>Back to Home</button>
            </header>

            <main style={styles.main}>
                <div style={styles.card}>
                    <div style={styles.icon}>🔒</div>

                    <h1 style={styles.title}>Secure Your Account</h1>
                    <p style={styles.subtitle}>
                        Create a strong password to protect your account
                    </p>

                    <form onSubmit={handleSubmit}>
                        {/* NEW PASSWORD */}
                        <div style={{ marginBottom: "20px" }}>
                            <div style={styles.label}>New Password</div>
                            <div style={styles.inputGroup}>
                                <input
                                    style={styles.input}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    style={styles.toggleBtn}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>

                            <div style={styles.strengthRow}>
                                <div style={styles.strengthBar(password.length >= 4)} />
                                <div style={styles.strengthBar(password.length >= 6)} />
                                <div style={styles.strengthBar(password.length >= 8)} />
                                <div style={styles.strengthBar(password.length >= 10)} />
                            </div>

                            <div style={styles.hint}>
                                Must be at least 8 characters long
                            </div>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div>
                            <div style={styles.label}>Confirm New Password</div>
                            <div style={styles.inputGroup}>
                                <input
                                    style={styles.input}
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    style={styles.toggleBtn}
                                    onClick={() => setShowConfirm(!showConfirm)}
                                >
                                    {showConfirm ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <button style={styles.submitBtn} type="submit">
                            Reset Password →
                        </button>
                    </form>

                    <div style={styles.cancel}>
                        Cancel and return to <Link to="/signin">Sign In</Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResetPass;
