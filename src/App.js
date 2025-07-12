import React, { useState, useEffect } from "react";
import { ToastContainer, Bounce } from "react-toastify";
import { BrowserRouter, useLocation } from "react-router-dom";
import { Box, Toolbar, useMediaQuery } from "@mui/material";

import Routers from "./component/Routes";
import Sidebar from "./component/Sidebar/sidebar";
import Navbar from "./component/Navbar/navbar";
import { SearchProvider } from "./component/Search/search";

import "react-toastify/dist/ReactToastify.css";

const AppContent = () => {
  const location = useLocation();
  const isHiddenLayoutPage =
    location.pathname === "/" || location.pathname === "/helpdesk";

  const isMobile = useMediaQuery('(max-width:768px)');
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebarWidth = 200;
  const collapsedWidth = 80;

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
  const handleToggle = () => setCollapsed((prev) => !prev);
  window.addEventListener("toggleCollapse", handleToggle);
  return () => window.removeEventListener("toggleCollapse", handleToggle);
}, []);

  return (
    <Box sx={{ display: "flex" }}>
      {!isHiddenLayoutPage && (
        <Sidebar
          isMobile={isMobile}
          drawerOpen={drawerOpen}
          toggleDrawer={toggleDrawer}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
        />
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 1,
          marginLeft: !isHiddenLayoutPage
            ? isMobile
              ? 0
              : collapsed
              ? `${collapsedWidth}px`
              : `${sidebarWidth}px`
            : 0,
          transition: "margin-left 0.3s ease-in-out",
          width: "100%",
          backgroundColor: "#f9f9f9",
          minHeight: "100vh",
        }}
      >
        {!isHiddenLayoutPage && <Navbar toggleDrawer={toggleDrawer} />}
        {!isHiddenLayoutPage && <Toolbar />}
        <Routers />
      </Box>
    </Box>
  );
};

function App() {
  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        transition={Bounce}
      />
      <BrowserRouter>
        <SearchProvider>
          <AppContent />
        </SearchProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
