import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    id: null,
  },
  organization: {
    id: null,
  },
  company: {
    id: null,
  },
  selectedProject: {
    id: null,
  },
  projects: [],
  purposes: {},
  phases: {},
  stages: {},
  tower: {},
  selectedTowerId: null,
  levels: {},
  rooms: [],
  flatTypes: {},
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      console.log(action, "action");
      state.user.id = action.payload;
    },
    setOrganization: (state, action) => {
      if (!state.organization) {
        state.organization = {};
      }
      state.organization.id = action.payload;
    },
    setCompany: (state, action) => {
      if (!state.company) {
        state.company = {};
      }
      console.log(action.payload, "action.payload id");
      state.company.id = action.payload;
    },
    setSelectedProject: (state, action) => {
      if (!state.selectedProject) {
        state.selectedProject = {};
      }
      state.selectedProject.id = action.payload;
    },
    setProjects: (state, action) => {
      if (!state.projects) {
        state.projects = [];
      }
      console.log(action.payload, "action.payload projects");
      if (action.payload === null) {
        state.projects = [];
      } else {
        state.projects = [...action.payload];
      }
    },
    setPurposes: (state, action) => {
      if (!state.purposes) {
        state.purposes = {};
      }
      console.log(action.payload, "action.payload purposes");
      state.purposes[action.payload.project_id] = action.payload.data;
    },
    setPhases: (state, action) => {
      if (!state.phases) {
        state.phases = {};
      }
      state.phases[action.payload.project_id] = action.payload.data;
    },
    setStages: (state, action) => {
      if (!state.stages) {
        state.stages = {};
      }
      state.stages[action.payload.project_id] = action.payload.data;
    },
    setTower: (state, action) => {
      if (!state.tower) {
        state.tower = {};
      }
      state.tower[action.payload.project_id] = action.payload.data;
    },
    setSelectedTowerId: (state, action) => {
      if (!state.selectedTowerId) {
        state.selectedTowerId = null;
      }
      state.selectedTowerId = action.payload;
    },
    setLevels: (state, action) => {
      if (!state.levels) {
        state.levels = {};
      }
      state.levels[action.payload.project_id] = action.payload.data;
    },
    setRoomTypes: (state, action) => {
      console.log(action.payload, "action.payload rooms");
      if (!state.rooms) {
        state.rooms = [];
      }
      state.rooms = [...action.payload];
    },
    setFlatTypes: (state, action) => {
      if (!state.flatTypes) {
        state.flatTypes = {};
      }
      state.flatTypes[action.payload.project_id] = action.payload.data;
    },
  },
});

export const {
  setUser,
  setOrganization,
  setCompany,
  setProjects,
  setSelectedProject,
  setPurposes,
  setPhases,
  setStages,
  setTower,
  setSelectedTowerId,
  setLevels,
  setRoomTypes,
  setFlatTypes,
} = userSlice.actions;
export default userSlice.reducer;
