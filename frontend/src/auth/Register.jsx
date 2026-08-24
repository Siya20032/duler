
import { useState } from "react";
import api from "../api";

function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/register", {
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });

      console.log("Registration successful:", response.data);

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        onRegisterSuccess();
      }, 1200);
    } catch (error) {
      console.error("Registration error:", error);

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Unable to create account. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="professional-auth-page">
      <div className="professional-auth-container">

        {/* =====================================================
            LEFT BRAND PANEL
        ===================================================== */}

        <div className="auth-brand-panel">

          <div className="auth-brand-content">

            <div className="auth-brand-logo">
              <span>⚡</span>
            </div>

            <div className="auth-brand-name">
              <div className="auth-brand-title">
                Distributed Job Scheduler
              </div>

              <div className="auth-brand-subtitle">
                Reliable background job processing
              </div>
            </div>

            <div className="auth-brand-heading">

              <span className="auth-eyebrow">
                GET STARTED
              </span>

              <h1>
                Build reliable
                <br />
                <span>distributed jobs.</span>
              </h1>

              <p>
                Create your account and start managing
                queues, workers, scheduled jobs, retries,
                and background task execution from one
                centralized platform.
              </p>

            </div>

            {/* Feature Cards */}

            <div className="auth-feature-list">

              <div className="auth-feature-card">
                <div className="auth-feature-icon">
                  Q
                </div>

                <div>
                  <strong>Queue Management</strong>
                  <span>
                    Organize and control job queues
                  </span>
                </div>
              </div>

              <div className="auth-feature-card">
                <div className="auth-feature-icon">
                  W
                </div>

                <div>
                  <strong>Worker Processing</strong>
                  <span>
                    Execute jobs across multiple workers
                  </span>
                </div>
              </div>

              <div className="auth-feature-card">
                <div className="auth-feature-icon">
                  R
                </div>

                <div>
                  <strong>Reliable Retries</strong>
                  <span>
                    Handle failures with retry strategies
                  </span>
                </div>
              </div>

            </div>

            {/* System Status */}

            <div className="auth-system-status">
              <span className="auth-status-dot"></span>
              <span>Scheduler services operational</span>
            </div>

          </div>

          <div className="auth-brand-footer">
            Distributed Job Scheduler
            <span>•</span>
            Secure job infrastructure
          </div>

        </div>


        {/* =====================================================
            RIGHT REGISTER FORM
        ===================================================== */}

        <div className="auth-form-panel">

          <div className="auth-form-container">

            {/* Mobile Brand */}

            <div className="auth-mobile-brand">

              <div className="auth-mobile-logo">
                ⚡
              </div>

              <div>
                <strong>
                  Distributed Job Scheduler
                </strong>

                <span>
                  Job processing platform
                </span>
              </div>

            </div>


            {/* Header */}

            <div className="professional-auth-header">

              <div className="auth-welcome-label">
                CREATE ACCOUNT
              </div>

              <h2>
                Get started
              </h2>

              <p>
                Create your account to start managing
                distributed background jobs.
              </p>

            </div>


            {/* Error */}

            {error && (
              <div className="professional-auth-error">

                <div className="auth-error-icon">
                  !
                </div>

                <div>
                  <strong>
                    Registration failed
                  </strong>

                  <span>
                    {error}
                  </span>
                </div>

              </div>
            )}


            {/* Success */}

            {success && (
              <div className="professional-auth-error auth-success-message">

                <div className="auth-error-icon success-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Account created
                  </strong>

                  <span>
                    {success}
                  </span>
                </div>

              </div>
            )}


            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="professional-auth-form"
            >

              {/* Full Name */}

              <div className="professional-form-group">

                <label htmlFor="register-name">
                  Full name
                </label>

                <div className="professional-input-wrapper">

                  <span className="professional-input-icon">
                    👤
                  </span>

                  <input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    autoComplete="name"
                    disabled={loading}
                  />

                </div>

              </div>


              {/* Email */}

              <div className="professional-form-group">

                <label htmlFor="register-email">
                  Email address
                </label>

                <div className="professional-input-wrapper">

                  <span className="professional-input-icon">
                    @
                  </span>

                  <input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    autoComplete="email"
                    disabled={loading}
                  />

                </div>

              </div>


              {/* Password */}

              <div className="professional-form-group">

                <label htmlFor="register-password">
                  Password
                </label>

                <div className="professional-input-wrapper">

                  <span className="professional-input-icon">
                    •••
                  </span>

                  <input
                    id="register-password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    disabled={loading}
                  />

                </div>

              </div>


              {/* Confirm Password */}

              <div className="professional-form-group">

                <label htmlFor="register-confirm-password">
                  Confirm password
                </label>

                <div className="professional-input-wrapper">

                  <span className="professional-input-icon">
                    ✓
                  </span>

                  <input
                    id="register-confirm-password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    disabled={loading}
                  />

                </div>

              </div>


              {/* Create Account Button */}

              <button
                type="submit"
                className="professional-auth-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <span className="button-arrow">
                      →
                    </span>
                  </>
                )}

              </button>

            </form>


            {/* Login Switch */}

            <div className="professional-auth-switch">

              <span>
                Already have an account?
              </span>

              <button
                type="button"
                onClick={onSwitchToLogin}
                disabled={loading}
              >
                Sign in
              </button>

            </div>


            {/* Security Note */}

            <div className="professional-security-note">

              <div className="security-lock">
                🔒
              </div>

              <div>
                <strong>
                  Secure authentication
                </strong>

                <span>
                  Your account is protected using
                  JWT-based authentication.
                </span>
              </div>

            </div>

          </div>


          {/* Footer */}

          <div className="professional-auth-footer">
            Distributed Job Scheduler
            {" • "}
            Secure background job infrastructure
          </div>

        </div>

      </div>
    </div>
  );
}

export default Register;

