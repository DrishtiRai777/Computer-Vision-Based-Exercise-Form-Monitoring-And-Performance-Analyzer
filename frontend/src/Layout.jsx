import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function Layout({ children }) {
  const location = useLocation();

  // 1. Identify if we are on an Auth or Login page
  const isAuthRoute = location.pathname === "/auth" || location.pathname === "/login";

  // 2. Keep your existing logic for the analysis page footer
  const hideFooter = location.pathname === "/analysis" || isAuthRoute;

  return (
    <>
      {/* The Navbar will now hide ONLY on /auth and /login */}
      {!isAuthRoute && <Navbar />}

      {children}

      {/* The Footer stays hidden on /analysis AND /auth/login */}
      {!hideFooter && <Footer />}
    </>
  );
}

export default Layout;