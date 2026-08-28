import { Box, Drawer } from "@mui/material";
import Sidebar from "./Sidebar";

const DrawerMenu = ({ show, handleClose }) => {
  return (
    <Drawer anchor="left" open={show} onClose={handleClose}>
      <Box sx={{ width: 250 }}>
        <Sidebar isOpenSidebar={true} />
      </Box>
    </Drawer>
  );
};

export default DrawerMenu;
