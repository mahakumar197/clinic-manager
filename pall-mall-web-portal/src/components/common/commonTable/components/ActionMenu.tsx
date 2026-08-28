import { useState } from "react";
import { Menu, MenuItem, Typography, useTheme } from "@mui/material";
import CommonIcon from "../../CommonIcon";
import CommonIconButton from "../../CommonIconButton";
import { Column } from "../types";

interface ActionMenuProps {
  col: Column;
  row: any;
}

export const ActionMenu = ({ col, row }: ActionMenuProps) => {
  const theme = useTheme();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  return (
    <>
      <CommonIconButton
        size="small"
        icon={<CommonIcon name="EllipsisVertical" />}
        onClick={(e) => setAnchor(e.currentTarget)}
      />

      <Menu
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        sx={{
          "& .MuiPaper-root": {
            [theme.breakpoints.down("sm")]: {
              minWidth: "120px !important",
            },
          },
          "& .MuiList-root": {
            [theme.breakpoints.down("sm")]: {
              paddingTop: "4px",
              paddingBottom: "4px",
            },
          },
          "& .MuiMenuItem-root": {
            [theme.breakpoints.down("sm")]: {
              minHeight: "36px",
              paddingY: "6px",
              paddingX: "12px",
            },
          },
        }}
      >
        {col.menuItems?.map((item, i) => {
          const isDisabled = item.disabled?.(row) ?? false;
          
          return (
            <MenuItem
              key={i}
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) {
                  item.onClick?.(row);
                  setAnchor(null);
                }
              }}
              sx={{
                color: item.color || "inherit",
                display: "flex",
                justifyContent: "space-between",
                gap: 1.5,
                opacity: isDisabled ? 0.5 : 1,
              }}
            >
              <Typography sx={{ fontWeight: theme.typography.h6.fontWeight, fontSize: 14 }}>
                {item.label}
              </Typography>
              {item.icon && <CommonIcon name={item.icon} size={18} />}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};