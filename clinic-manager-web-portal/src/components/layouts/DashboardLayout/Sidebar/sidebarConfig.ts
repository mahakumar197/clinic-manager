export const SIDEBAR_WIDTH = {
  open: 260,
  closed: 80,
};

export interface MenuItem {
  id?: string;
  title: string;
  path: string;
  icon?: string;
  isLogout?: boolean;
  badgeCount?: number;
  permissionKey?: string;
}
