import { Box, useMediaQuery } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import TopBar from "./TopBar";
import { Suspense, useState, useRef } from "react";
import DrawerMenu from "./Sidebar/drawer";
import { LoadingSpinner } from "@/components/common";
import { useEffect } from "react";
import { useAppDispatch } from "@/app/store";
import { fetchMessageCounts } from "@/features/messages/thunks";

const DashboardLayout = () => {
  const isMobile = useMediaQuery("(max-width:992px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const topBarHeight = {
    xs: "8vh",
    sm: "8vh",
    md: "10vh",
    lg: "10vh",
  };

  // Fetch global message counts on layout mount
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchMessageCounts());
  }, [dispatch]);

  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Instantly scroll back to the top whenever the URL path changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    if (isMobile) {
      setTimeout(() => {
        setIsDrawerOpen(true);
      }, 200);
    } else {
      setIsSidebarOpen((prev) => !prev);
    }
  };



  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      {/* Sidebar */}
      {!isMobile && <Sidebar isOpenSidebar={isSidebarOpen} />}

      {/* Mobile drawer */}
      {isMobile && (
        <DrawerMenu
          show={isDrawerOpen}
          handleClose={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          ml: !isMobile ? (isSidebarOpen ? "250px" : "80px") : "0px",
          transition: "margin-left 0.3s ease",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100vh",
        }}
      >
        {/* Top Bar (fixed) */}
        <TopBar
          height={topBarHeight}
          isMobile={isMobile}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        {/* Page Content (only this scrolls) */}
        <Box
          ref={scrollContainerRef}
          sx={{
            mt: topBarHeight,
            height: {
              xs: `calc(100vh - ${topBarHeight.xs})`,
              sm: `calc(100vh - ${topBarHeight.sm})`,
              md: `calc(100vh - ${topBarHeight.md})`,
              lg: `calc(100vh - ${topBarHeight.lg})`,
            },
            overflow: "auto",
            scrollBehavior: "smooth",
          }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
