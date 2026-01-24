import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL}/bus`;

// ============================================
// INTERFACES
// ============================================

export interface BusRoute {
  _id: string;
  id?: number;
  bus_name: string;
  route_number: string;
  driver_name: string;
  driver_contact: string;
  capacity: number;
  notes?: string;
}

export interface BusAssignment {
  _id: string;
  id?: number;
  student_id: number;
  student_name?: string;
  classname?: string;
  admission_no?: string;
  bus_id: number | null;
  bus_name: string | null;
  start_date: string;
  end_date: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BusFeeConfig {
  _id: string;
  is_bus_fee_enabled: boolean;
  applicable_from_month: string;
  applicable_from_year: number;
  removable_from_month: string | null;
  removable_from_year: number | null;
}

interface BusState {
  routes: BusRoute[];
  assignments: BusAssignment[];
  config: BusFeeConfig | null;
  studentBusAssignment: BusAssignment | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: BusState = {
  routes: [],
  assignments: [],
  config: null,
  studentBusAssignment: null,
  loading: false,
  error: null,
  success: false,
};

// ============================================
// ASYNC THUNKS - BUS ROUTES
// ============================================

export const fetchBusRoutes = createAsyncThunk(
  "bus/fetchRoutes",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching bus routes from:", `${API_BASE}/routes`);
      const response = await axios.get(`${API_BASE}/routes`);
      console.log("Bus routes fetched successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching bus routes:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        fullError: error.message
      });
      return rejectWithValue(
        error.response?.data?.message || 
        error.message ||
        "Failed to fetch bus routes"
      );
    }
  }
);

export const createBusRoute = createAsyncThunk(
  "bus/createRoute",
  async (routeData: Omit<BusRoute, "_id">, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE}/routes`, routeData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create bus route");
    }
  }
);

export const updateBusRoute = createAsyncThunk(
  "bus/updateRoute",
  async ({ id, ...routeData }: BusRoute, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${API_BASE}/routes/${id}`, routeData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update bus route");
    }
  }
);

export const deleteBusRoute = createAsyncThunk(
  "bus/deleteRoute",
  async (id: number | string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE}/routes/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete bus route");
    }
  }
);

// ============================================
// ASYNC THUNKS - BUS FEE CONFIGURATION
// ============================================

export const fetchBusFeeConfig = createAsyncThunk(
  "bus/fetchConfig",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/config`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch bus fee config");
    }
  }
);

export const updateBusFeeConfig = createAsyncThunk(
  "bus/updateConfig",
  async (configData: Omit<BusFeeConfig, "_id">, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${API_BASE}/config`, configData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update bus fee config");
    }
  }
);

// ============================================
// ASYNC THUNKS - BUS ASSIGNMENTS
// ============================================

export const fetchAllBusAssignments = createAsyncThunk(
  "bus/fetchAssignments",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/assignments`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch bus assignments");
    }
  }
);

export const fetchStudentBusAssignment = createAsyncThunk(
  "bus/fetchStudentAssignment",
  async (studentId: number | string, { rejectWithValue }) => {
    try {
      if (!studentId) {
        return null;
      }
      const response = await axios.get(`${API_BASE}/assignments/${studentId}`);
      return response.data || null;
    } catch (error: any) {
      console.error("Bus assignment fetch error:", error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        "Failed to fetch student bus assignment"
      );
    }
  }
);

export const assignBusToStudent = createAsyncThunk(
  "bus/assignToStudent",
  async (assignmentData: {
    admission_no: string;
    bus_id: number | null;
    bus_name: string | null;
    start_date: string;
  }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE}/assignments`, assignmentData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to assign bus");
    }
  }
);

export const removeBusFromStudent = createAsyncThunk(
  "bus/removeFromStudent",
  async ({ studentId, end_date }: { studentId: number | string; end_date: string }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${API_BASE}/assignments/${studentId}/remove`, { end_date });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove bus assignment");
    }
  }
);

// ============================================
// SLICE
// ============================================

const busSlice = createSlice({
  name: "bus",
  initialState,
  reducers: {
    clearBusError: (state) => {
      state.error = null;
    },
    clearBusSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch Bus Routes
    builder
      .addCase(fetchBusRoutes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusRoutes.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload;
      })
      .addCase(fetchBusRoutes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Bus Route
    builder
      .addCase(createBusRoute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBusRoute.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.routes.push(action.payload);
      })
      .addCase(createBusRoute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Bus Route
    builder
      .addCase(updateBusRoute.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.routes.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.routes[index] = action.payload;
        }
      })
      .addCase(updateBusRoute.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Bus Route
    builder
      .addCase(deleteBusRoute.fulfilled, (state, action) => {
        state.success = true;
        state.routes = state.routes.filter(r => r._id !== action.payload);
      })
      .addCase(deleteBusRoute.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch Bus Fee Config
    builder
      .addCase(fetchBusFeeConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusFeeConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(fetchBusFeeConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Bus Fee Config
    builder
      .addCase(updateBusFeeConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBusFeeConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.config = action.payload;
      })
      .addCase(updateBusFeeConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch All Bus Assignments
    builder
      .addCase(fetchAllBusAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBusAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchAllBusAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Student Bus Assignment
    builder
      .addCase(fetchStudentBusAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.studentBusAssignment = null;
      })
      .addCase(fetchStudentBusAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.studentBusAssignment = action.payload;
      })
      .addCase(fetchStudentBusAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.studentBusAssignment = null;
      });

    // Assign Bus to Student
    builder
      .addCase(assignBusToStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignBusToStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.studentBusAssignment = action.payload;
        // Also add to assignments list
        const existingIndex = state.assignments.findIndex(a => a.student_id === action.payload.student_id);
        if (existingIndex !== -1) {
          state.assignments[existingIndex] = action.payload;
        } else {
          state.assignments.push(action.payload);
        }
      })
      .addCase(assignBusToStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove Bus from Student
    builder
      .addCase(removeBusFromStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeBusFromStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.studentBusAssignment = null;
      })
      .addCase(removeBusFromStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBusError, clearBusSuccess } = busSlice.actions;
export default busSlice.reducer;
