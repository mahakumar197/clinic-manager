export const ROLE_PERMISSIONS = {
  manager: ["Messages", "Tasks", "Approvals", "Analytics", "Notifications"],
  surgeon: ["Messages", "Content Upload", "Notifications"],
  coordinator: ["Messages", "Tasks", "Content Upload", "Notifications"],
  nurse: ["Messages", "Tasks", "Notifications"],
  marketing: ["Content Upload", "Analytics"],
  admin: [
    "Messages",
    "Tasks",
    "Approvals",
    "Content Upload",
    "Analytics",
    "Notifications",
  ],
};
