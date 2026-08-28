// import { Column } from "@/components/common/CommonTable";

/* SUMMARY CARDS*/
export const ADMIN_ANALYTICS_CARDS = [
  {
    id: 1,
    title: "Conversion Rate",
    value: "67.8%",
    iconName: "Users",
    variant: "red",
    subtitle: "+5.2% vs last month",
  },
  {
    id: 2,
    title: "Avg Response Time",
    value: "2.7 hours",
    iconName: "FileCheck",
    variant: "green",
    subtitle: "12% faster",
  },
];

/* LINE CHART DATA */
export const APP_ENGAGEMENT_CHART = {
  data: [
    { month: "May", active: 1400, guest: 280 },
    { month: "Jun", active: 1550, guest: 350 },
    { month: "Jul", active: 1800, guest: 420 },
    { month: "Aug", active: 2050, guest: 470 },
    { month: "Sep", active: 2350, guest: 550 },
  ],
  labels: {
    active: "Active Users",
    guest: "Guest Users",
  },
  colors: {
    active: "#E9A708",
    guest: "#2563EB",
  },
};

/* BAR CHART DATA*/
export const CONTENT_PERFORMANCE_DATA = {
  data: [
    { type: "Videos", views: 3000, engagement: 2500 },
    { type: "Images", views: 1800, engagement: 700 },
    { type: "Blogs", views: 1500, engagement: 600 },
    { type: "Guides", views: 1000, engagement: 500 },
  ],
  labels: {
    views: "Total Views",
    engagement: "Engagement %",
  },
  colors: {
    views: "#E9A708",
    engagement: "#10B981",
  },
};

/* PIE CHART DATA*/
export const HEADCOUNTS_DATA = [
  { name: "Surgeon", value: 65, color: "#E9A708" },
  { name: "Coordinator", value: 25, color: "#3B82F6" },
  { name: "Nurse", value: 27, color: "#10B981" },
];

/* TABLE DATA*/
export const PERFORMANCE_USERS = {
  pageMeta: {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  },
  data: [
    {
      id: 1,
      name: "Dr. Smith",
      role: "Surgeon",
      tasks: 45,
      response: "2.3h",
      satisfaction: "98%",
    },
    {
      id: 2,
      name: "Jane Williams",
      role: "Coordinator",
      tasks: 62,
      response: "1.5h",
      satisfaction: "95%",
    },
    {
      id: 3,
      name: "Nurse Kelly",
      role: "Nurse",
      tasks: 38,
      response: "3.1h",
      satisfaction: "92%",
    },
    {
      id: 4,
      name: "Admin Team",
      role: "Admin",
      tasks: 71,
      response: "4.2h",
      satisfaction: "89%",
    },
    {
      id: 5,
      name: "Jane Williams",
      role: "Manager",
      tasks: 62,
      response: "1.5h",
      satisfaction: "95%",
    },
  ],
};

/* TABLE COLUMNS*/
export const PERFORMANCE_USER_COLUMNS = [
  { id: "name", label: "User" },
  { id: "role", label: "Role" },
  { id: "tasks", label: "Tasks Completed"},
  { id: "response", label: "Avg Response" },
  {
    id: "satisfaction",
    label: "Satisfaction",
    textColor: "#00A63E",
  },
];
