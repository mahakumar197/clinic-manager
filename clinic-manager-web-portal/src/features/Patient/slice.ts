import { createSlice } from "@reduxjs/toolkit";
import PatientData from "./mock/patient.json"
import {Patient} from "./types"

const PatientSlice = createSlice({
    name:"patient",
    initialState:{
        PatientList:PatientData?.patient?.list,
        PageMeta:PatientData?.patient?.pageMeta

    },
    reducers:{
        addPatient:(state,action)=>{
            state.PatientList.push(action.payload);
        },
           setPatientList: (state, action) => {
      state.PatientList = action.payload;
    },
    }
})

export const {addPatient,setPatientList} = PatientSlice.actions
export default PatientSlice.reducer