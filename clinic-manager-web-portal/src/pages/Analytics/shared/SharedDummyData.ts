/* SUMMARY CARDS*/
export const DASHBOARD_CARDS = [
  {
    id: 1,
    title: "Total Approvals",
    value: 88,
    iconName: "CircleCheck",
    variant: "orange",
    subtitle: "+12% vs last month",
  },
  {
    id: 2,
    title: "This Week",
    value: 24,
    iconName: "Calendar",
    variant: "blue",
    subtitle: "+8% vs last week",
  },
  {
    id: 3,
    title: "Avg Response Time",
    value: "1.5h",
    iconName: "Clock",
    variant: "red",
    subtitle: "-20% improvement",
  },
  {
    id: 4,
    title: "Outstanding Forms",
    value: 12,
    iconName: "FileText",
    variant: "green",
    subtitle: "Awaiting review",
  },
];

/* RESPONSE TIME CHART*/
export const RESPONSE_TIME_CHART = {
  data: [
    { month: "Jan", value: 2.6 },
    { month: "Feb", value: 2.0 },
    { month: "Mar", value: 1.7 },
    { month: "Apr", value: 1.4 },
  ],
  labels: {
    value: "Response Time (hrs)",
  },
  colors: {
    value: "#E9A708",
  },
};

/* WEEKLY APPROVALS CHART*/
export const WEEKLY_APPROVALS_DATA = {
  data: [
    { month: "Mon", approved: 12 },
    { month: "Tue", approved: 15 },
    { month: "Wed", approved: 18 },
    { month: "Thu", approved: 14 },
    { month: "Fri", approved: 16 },
    { month: "Sat", approved: 8 },
    { month: "Sun", approved: 5 },
  ],
  labels: {
    approved: "Forms Approved",
  },
  colors: {
    approved: "#E9A708",
  },
};

/* FORM TYPES BREAKDOWN*/
export const FORM_TYPES_PROGRESS = [
  {
    label: "Health Questionnaire",
    value: 45,
    count: 45,
    color: "primary.main",
    showDot: true,
  },
  {
    label: "Recovery Form",
    value: 35,
    count: 35,
    color: "#00C950",
    showDot: true,
  },
  {
    label: "Pre-Op Assessment",
    value: 20,
    count: 20,
    color: "#3B82F6",
    showDot: true,
  },
];

/* PERFORMANCE SUMMARY */
export const PERFORMANCE_PROGRESS = [
  {
    label: "Completion Rate",
    value: 88,
    subLabel: "Above team average (82%)",
  },
  {
    label: "Quality Score",
    value: 95,
    subLabel: "Excellent performance rating",
  },
];
