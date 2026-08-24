import { useState } from "react";
import api from "../api";

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/login", {
        email: email.trim(),
        password,
      });

      const data = response.data;

      const token = data?.token?.access_token;
      const user = data?.user;

      if (!token || !user) {
        throw new Error("Invalid login response from server.");
      }

      onLogin(user, token);
    } catch (error) {
      console.error("Login error:", error);

      const message =
        error.response?.data?.detail ||
        error.message ||
        "Unable to sign in. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="professional-auth-page">
      <div className="professional-auth-container">

        {/* =====================================================
            LEFT BRANDING PANEL
        ====================================================== */}

        <div className="auth-brand-panel">

          <div className="auth-brand-content">

            {/* Logo */}
            <div className="auth-brand-logo">
              <span>⚡</span>
            </div>

            {/* Brand */}
            <div className="auth-brand-name">
              <span className="auth-brand-title">
                Distributed
              </span>

              <span className="auth-brand-subtitle">
                Job Scheduler
              </span>
            </div>

            {/* Main Heading */}
            <div className="auth-brand-heading">
              <span className="auth-eyebrow">
                DISTRIBUTED WORKFLOW PLATFORM
              </span>

              <h1>
                Reliable job execution,
                <br />
                <span>built for scale.</span>
              </h1>

              <p>
                Schedule, execute, monitor and retry background
                jobs across distributed workers from one powerful
                platform.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="auth-feature-list">

              <div className="auth-feature-card">
                <div className="auth-feature-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Secure authentication
                  </strong>

                  <span>
                    JWT-based protected access
                  </span>
                </div>
              </div>

              <div className="auth-feature-card">
                <div className="auth-feature-icon">
                  ⚡
                </div>

                <div>
                  <strong>
                    Distributed execution
                  </strong>

                  <span>
                    Process jobs across workers
                  </span>
                </div>
              </div>

              <div className="auth-feature-card">
                <div className="auth-feature-icon">
                  ↻
                </div>

                <div>
                  <strong>
                    Automatic retries
                  </strong>

                  <span>
                    Reliable failure recovery
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom status */}
            <div className="auth-system-status">
              <span className="auth-status-dot"></span>

              <span>
                Scheduler infrastructure ready
              </span>
            </div>

          </div>

          <div className="auth-brand-footer">
            Distributed Job Scheduler
            <span>•</span>
            Production-inspired architecture
          </div>

        </div>

        {/* =====================================================
            RIGHT LOGIN PANEL
        ====================================================== */}

        <div className="auth-form-panel">

          <div className="auth-form-container">

            {/* Mobile Logo */}
            <div className="auth-mobile-brand">
              <div className="auth-mobile-logo">
                ⚡
              </div>

              <div>
                <strong>
                  Distributed
                </strong>

                <span>
                  Job Scheduler
                </span>
              </div>
            </div>

            {/* Header */}
            <div className="professional-auth-header">

              <div className="auth-welcome-label">
                WELCOME BACK
              </div>

              <h2>
                Sign in to your account
              </h2>

              <p>
                Manage your distributed jobs and monitor
                scheduler activity.
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
                    Sign in failed
                  </strong>

                  <span>
                    {error}
                  </span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form
              onSubmit={handleSubmit}
              className="professional-auth-form"
            >

              {/* Email */}
              <div className="professional-form-group">

                <label htmlFor="login-email">
                  Email address
                </label>

                <div className="professional-input-wrapper">

                  <span className="professional-input-icon">
                    @
                  </span>

                  <input
                    id="login-email"
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

                <div className="professional-label-row">

                  <label htmlFor="login-password">
                    Password
                  </label>

                </div>

                <div className="professional-input-wrapper">

                  <span className="professional-input-icon">
                    •••
                  </span>

                  <input
                    id="login-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {/* Sign In */}
              <button
                type="submit"
                className="professional-auth-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="button-arrow">
                      →
                    </span>
                  </>
                )}

              </button>

            </form>

            {/* Register */}
            <div className="professional-auth-switch">

              <span>
                New to the scheduler?
              </span>

              <button
                type="button"
                onClick={onSwitchToRegister}
                disabled={loading}
              >
                Create an account
              </button>

            </div>

            {/* Security */}
            <div className="professional-security-note">

              <div className="security-lock">
                ✓
              </div>

              <div>
                <strong>
                  Secure connection
                </strong>

                <span>
                  Your credentials are protected
                  using secure authentication.
                </span>
              </div>

            </div>

          </div>

          {/* Footer */}
          <div className="professional-auth-footer">
            © 2026 Distributed Job Scheduler
          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;