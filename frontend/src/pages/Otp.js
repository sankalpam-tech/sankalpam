import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Otp = () => {
    const navigate = useNavigate();

    const [otp, setOtp] = useState(["", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(59);
    const [loading, setLoading] = useState(false);

    const inputsRef = useRef([]);

    // email/phone saved from ForgotMail page
    const recoveryValue = localStorage.getItem("recovery");

    /* ================= TIMER ================= */
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((t) => t - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    /* ================= OTP INPUT ================= */
    const handleChange = (e, index) => {
        const value = e.target.value;

        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < otp.length - 1) {
            inputsRef.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1].focus();
        }
    };

    /* ================= VERIFY OTP ================= */
    const handleVerify = async (e) => {
        e.preventDefault();

        const enteredOtp = otp.join("");

        if (enteredOtp.length !== 4) {
            alert("Enter complete OTP");
            return;
        }

        try {
            setLoading(true);

            const res=await axios.post("https://backend.sankalpam.world/auth/otp/verify", {
                otp: enteredOtp,
                emailOrPhone: recoveryValue,
            });


            if (res.data === true) {
                navigate("/reset");
            } else {
                alert("Invalid OTP");
            }
        } catch (err) {
            alert("Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    /* ================= RESEND OTP ================= */
    const handleResend = async () => {
        if (!recoveryValue) {
            alert("Something went wrong. Please try again.");
            navigate("/forgot");
            return;
        }

        try {
            setLoading(true);

            await axios.post("https://backend.sankalpam.world/auth/otp", {
                emailOrPhone: recoveryValue,
            });

            alert("OTP resent");
            setOtp(["", "", "", ""]);
            setTimeLeft(59);
            inputsRef.current[0].focus();
        } catch (err) {
            alert("Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    /* ================= STYLES ================= */
    const styles = {
        page: {
            minHeight: "100vh",
            backgroundColor: "#221910",
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            fontFamily: "Plus Jakarta Sans, sans-serif",
        },
        header: {
            padding: "16px 24px",
            fontSize: "22px",
            fontWeight: "700",
            color: "#f27f0d",
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
            maxWidth: "420px",
            background: "rgba(35,26,16,0.75)",
            borderRadius: "22px",
            padding: "32px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        },
        title: {
            textAlign: "center",
            fontSize: "26px",
            fontWeight: "700",
            marginBottom: "8px",
        },
        subtitle: {
            textAlign: "center",
            fontSize: "14px",
            color: "rgba(255,255,255,0.6)",
            marginBottom: "28px",
        },
        otpRow: {
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "24px",
        },
        otpInput: {
            width: "56px",
            height: "64px",
            textAlign: "center",
            fontSize: "24px",
            borderRadius: "12px",
            border: "2px solid rgba(242,127,13,0.3)",
            backgroundColor: "#221910",
            color: "#fff",
        },
        timer: {
            textAlign: "center",
            marginBottom: "20px",
            color: "#f27f0d",
            fontWeight: "700",
        },
        verifyBtn: {
            width: "100%",
            height: "56px",
            borderRadius: "999px",
            border: "none",
            backgroundColor: "#f27f0d",
            color: "#221910",
            fontSize: "18px",
            fontWeight: "700",
            cursor: "pointer",
        },
        resend: {
            marginTop: "16px",
            textAlign: "center",
            fontSize: "14px",
            color: "#f27f0d",
            cursor: "pointer",
        },
        footer: {
            textAlign: "center",
            marginTop: "24px",
            fontSize: "14px",
        },
    };

    /* ================= JSX ================= */
    return (
        <div style={styles.page}>
            <header style={styles.header}>Sankalpam</header>

            <main style={styles.main}>
                <div style={styles.card}>
                    <h2 style={styles.title}>Verify OTP</h2>
                    <p style={styles.subtitle}>
                        Enter the 4-digit code sent to your email/phone
                    </p>

                    <form onSubmit={handleVerify}>
                        <div style={styles.otpRow}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputsRef.current[index] = el)}
                                    style={styles.otpInput}
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                />
                            ))}
                        </div>

                        <div style={styles.timer}>
                            00:{String(timeLeft).padStart(2, "0")}
                        </div>

                        <button type="submit" style={styles.verifyBtn} disabled={loading}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>

                    {timeLeft === 0 && (
                        <div style={styles.resend} onClick={handleResend}>
                            Resend OTP
                        </div>
                    )}

                    <div style={styles.footer}>
                        ← Back to <Link to="/signin">Login</Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Otp;
