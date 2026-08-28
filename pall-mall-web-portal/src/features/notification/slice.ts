// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import notificationsData from "./mock/notifications.json";
// import { NotificationRule } from "./types"

// interface NotificationsState {
//   list: NotificationRule[];
//   selectedRuleId: string | null;
// }

// const initialState: NotificationsState = {
//   list: notificationsData,
//   selectedRuleId: null,
// };

// const notificationsSlice = createSlice({
//   name: "notifications",
//   initialState,
//   reducers: {
//     setSelectedRule: (state, action: PayloadAction<string>) => {
//       state.selectedRuleId = action.payload;
//     },

//     toggleStatus: (state, action: PayloadAction<string>) => {
//       const rule = state.list.find(r => r.id === action.payload);
//       if (rule) rule.status = !rule.status;
//     },

//     updateRule: (state, action: PayloadAction<NotificationRule>) => {
//       const index = state.list.findIndex(r => r.id === action.payload.id);
//       if (index !== -1) {
//         state.list[index] = action.payload;
//       }
//     }
//   }
// });

// export const { setSelectedRule, toggleStatus, updateRule } = notificationsSlice.actions;
// export default notificationsSlice.reducer;



import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import notificationsData from "./mock/notifications.json";
import escalationsData from "./mock/escalations.json";
import { NotificationRule, EscalationRule } from "./types";

interface NotificationsState {
  list: NotificationRule[];            // existing notifications
  escalationList: EscalationRule[];    // NEW escalation rules
  selectedRuleId: string | null;
  selectedType: "notification" | "escalation" | null;
}

const initialState: NotificationsState = {
  list: notificationsData,
  escalationList: escalationsData,     // NEW
  selectedRuleId: null,
  selectedType: null,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // ⭐ SELECT rule with type
    setSelectedRule: (
      state,
      action: PayloadAction<{ id: string; type: "notification" | "escalation" }>
    ) => {
      state.selectedRuleId = action.payload.id;
      state.selectedType = action.payload.type;
    },

    // ⭐ Toggle ON/OFF for both lists
    toggleStatus: (
      state,
      action: PayloadAction<{ id: string; type: "notification" | "escalation" }>
    ) => {
      if (action.payload.type === "notification") {
        const rule = state.list.find((r) => r.id === action.payload.id);
        if (rule) rule.status = !rule.status;
      } else {
        const rule = state.escalationList.find((r) => r.id === action.payload.id);
        if (rule) rule.status = !rule.status;
      }
    },

    // ⭐ Update rule in correct list
    updateRule: (
      state,
      action: PayloadAction<{
        data: NotificationRule | EscalationRule;
        type: "notification" | "escalation";
      }>
    ) => {
      const { data, type } = action.payload;
      const list = type === "notification" ? state.list : state.escalationList;

      const index = list.findIndex((r) => r.id === data.id);
      if (index !== -1) list[index] = data as any;
    },
  },
});

export const { setSelectedRule, toggleStatus, updateRule } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
