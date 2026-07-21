import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
      <Sidebar />
      <Navbar />

      <div
          sx={{
        transition: "margin-left 0.3s ease",
        "&:hover":{
          transform: "translateY(-5px)",
          boxshadow: "4px",
          bordercolor:"#719430",
        }
      }}  
      style={{
          marginLeft: "280px",
          marginTop: "70px",
          padding: "3px",
          background: "#F1F2EF",
          minHeight: "100vh",
          minWidth:"100v",
        }}
      >
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
