import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function Layout({ children }) {
  const location = useLocation();
  const isAuthRoute = location.pathname === "/auth" || location.pathname === "/login";
  const hideFooter = location.pathname === "/analysis" || isAuthRoute;

  return (
    <>
      {!isAuthRoute && <Navbar />}

      {children}

      {!hideFooter && <Footer />}
    </>
  );
}

export default Layout;