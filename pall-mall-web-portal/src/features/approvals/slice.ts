import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApprovalsState } from "./types";
import { mockApprovals } from "./mock";

const initialState: ApprovalsState = {
  approvals: mockApprovals,
  selectedId: mockApprovals[0]?.id ?? null,
  viewMode: "details",
    isFormModalOpen: false, 
    isMobileViewingDetails: false,
};

const approvalsSlice = createSlice({
  name: "approvals",
  initialState,
  reducers: {
    // When user clicks on a new approval from the left list
    selectApproval: (state, action: PayloadAction<string>) => {
      state.selectedId = action.payload;
      state.viewMode = "details"; // always go back to details view
    },

    // When user clicks "View Form"
    openFormView: (state) => {
      state.viewMode = "form";
    },

    // When user clicks Close on the form
    closeFormView: (state) => {
      state.viewMode = "details";
    },
    openFormModal: (state) => {
  state.isFormModalOpen = true;
},

closeFormModal: (state) => {
  state.isFormModalOpen = false;
},

setMobileViewingDetails: (state, action) => {
  state.isMobileViewingDetails = action.payload;
},

clearSelectedApproval: (state) => {
  state.selectedId = null; // go back to list in mobile
  state.isMobileViewingDetails = false;
},



  },
});

export const { selectApproval, openFormView, closeFormView,  openFormModal, closeFormModal, setMobileViewingDetails, clearSelectedApproval } =
  approvalsSlice.actions;

export default approvalsSlice.reducer;
