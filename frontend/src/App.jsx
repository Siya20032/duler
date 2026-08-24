import { useEffect, useState } from "react";
import api from "./api";

import Login from "./auth/Login";
import Register from "./auth/Register";

import Dashboard from "./pages/Dashboard";
import Organizations from "./pages/Organizations";
import Projects from "./pages/Projects";
import Queues from "./pages/Queues";
import Jobs from "./pages/Jobs";
import Workers from "./pages/Workers";
import ScheduledJobs from "./pages/ScheduledJobs";
import DeadLetterQueue from "./pages/DeadLetterQueue";
import Metrics from "./pages/Metrics";
import Settings from "./pages/Settings";

import Sidebar from "./layout/Sidebar";
import Header from "./layout/Header";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  const [authPage, setAuthPage] = useState("login");

  const [currentPage, setCurrentPage] =
    useState("Dashboard");

  const [loading, setLoading] = useState(true);

  /*
  ========================================================
  CHECK EXISTING LOGIN
  ========================================================
  */

  useEffect(() => {
    const token =
      localStorage.getItem("access_token");

    /*
     * No token means the user is not logged in.
     *
     * Therefore show Login page.
     */
    if (!token) {
      setLoading(false);
      setAuthPage("login");
      return;
    }

    /*
     * Token exists.
     *
     * Verify it with backend.
     */
    const loadUser = async () => {
      try {
        const response =
          await api.get("/me");

        setUser(response.data);

        localStorage.setItem(
          "user",
          JSON.stringify(response.data)
        );

        setCurrentPage("Dashboard");
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        /*
         * Invalid/expired token.
         */
        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem("user");

        setUser(null);
        setAuthPage("login");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /*
  ========================================================
  LOGIN
  ========================================================
  */

  const handleLogin = (
    loggedInUser,
    token
  ) => {
    /*
     * Store token only after LOGIN.
     */
    localStorage.setItem(
      "access_token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );

    /*
     * Now user is authenticated.
     */
    setUser(loggedInUser);

    /*
     * Open Dashboard.
     */
    setCurrentPage("Dashboard");
  };

  /*
  ========================================================
  REGISTRATION SUCCESS
  ========================================================
  */

  const handleRegisterSuccess = () => {
    /*
     * IMPORTANT:
     *
     * Registration does NOT log the user in.
     *
     * We simply switch to Login.
     */
    setAuthPage("login");
  };

  /*
  ========================================================
  LOGOUT
  ========================================================
  */

  const handleLogout = () => {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem("user");

    setUser(null);

    setAuthPage("login");

    setCurrentPage("Dashboard");
  };

  /*
  ========================================================
  PAGE RENDERING
  ========================================================
  */

  const renderPage = () => {
    switch (currentPage) {
      case "Dashboard":
        return <Dashboard />;

      case "Organizations":
        return <Organizations />;

      case "Projects":
        return <Projects />;

      case "Queues":
        return <Queues />;

      case "Jobs":
        return <Jobs />;

      case "Workers":
        return <Workers />;

      case "Scheduled Jobs":
        return <ScheduledJobs />;

      case "Dead Letter Queue":
        return <DeadLetterQueue />;

      case "Metrics":
        return <Metrics />;

      case "Settings":
        return (
          <Settings user={user} />
        );

      default:
        return <Dashboard />;
    }
  };

  /*
  ========================================================
  LOADING SCREEN
  ========================================================
  */

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-card">

          <div className="loading-spinner"></div>

          <h2>
            Distributed Job Scheduler
          </h2>

          <p>
            Checking authentication...
          </p>

        </div>
      </div>
    );
  }

  /*
  ========================================================
  AUTHENTICATION PAGES
  ========================================================
  */

  if (!user) {

    /*
     * REGISTER PAGE
     */
    if (authPage === "register") {
      return (
        <Register
          onRegisterSuccess={
            handleRegisterSuccess
          }
          onSwitchToLogin={() =>
            setAuthPage("login")
          }
        />
      );
    }

    /*
     * LOGIN PAGE
     */
    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() =>
          setAuthPage("register")
        }
      />
    );
  }

  /*
  ========================================================
  MAIN APPLICATION
  ========================================================
  */

  return (
    <div className="app-layout">

      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />

      <div className="main-area">

        <Header
          user={user}
          currentPage={currentPage}
          onLogout={handleLogout}
        />

        <main className="page-content">
          {renderPage()}
        </main>

      </div>

    </div>
  );
}

export default App;