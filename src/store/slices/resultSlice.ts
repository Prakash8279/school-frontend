import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "..";

const API_URL = `${import.meta.env.VITE_API_URL}/results`;

export interface ExamResult {
  _id?: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  classname: string;
  examName: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  remarks?: string;
  academicYear?: string;
}

interface ResultState {
  results: ExamResult[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ResultState = {
  results: [],
  loading: false,
  error: null,
  success: false,
};

// Fetch Results (accepts filters object)
export const fetchResults = createAsyncThunk(
  "results/fetch",
  async (filters: { studentId?: string; classname?: string; examName?: string; admissionNo?: string } = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.userInfo?.token;
      
      // Build query string
      const params = new URLSearchParams(filters as any).toString();
      const { data } = await axios.get(`${API_URL}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch results");
    }
  }
);

export const addResult = createAsyncThunk(
  "results/add",
  async (result: ExamResult, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.userInfo?.token;
      
      const { data } = await axios.post(API_URL, result, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add result");
    }
  }
);

export const bulkAddResults = createAsyncThunk(
  "results/bulkAdd",
  async (results: ExamResult[], { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.userInfo?.token;
      
      const { data } = await axios.post(`${API_URL}/bulk`, { results }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to save results");
    }
  }
);

export const deleteResult = createAsyncThunk(
  "results/delete",
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth.userInfo?.token;
      
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete result");
    }
  }
);

const resultSlice = createSlice({
  name: "results",
  initialState,
  reducers: {
    resetResultState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchResults.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add
      .addCase(addResult.pending, (state) => { state.loading = true; })
      .addCase(addResult.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Check if exists to update, else push
        const index = state.results.findIndex(r => 
            r.admissionNo === action.payload.admissionNo && 
            r.examName === action.payload.examName && 
            r.subject === action.payload.subject
        );
        if (index >= 0) {
            state.results[index] = action.payload;
        } else {
            state.results.push(action.payload);
        }
      })
      .addCase(addResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Bulk Add
      .addCase(bulkAddResults.pending, (state) => { state.loading = true; })
      .addCase(bulkAddResults.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Refresh results from payload
        if (action.payload.results) {
          action.payload.results.forEach((newResult: ExamResult) => {
            const index = state.results.findIndex(r => 
              r.admissionNo === newResult.admissionNo && 
              r.examName === newResult.examName && 
              r.subject === newResult.subject
            );
            if (index >= 0) {
              state.results[index] = newResult;
            } else {
              state.results.push(newResult);
            }
          });
        }
      })
      .addCase(bulkAddResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteResult.fulfilled, (state, action) => {
        state.results = state.results.filter(r => r._id !== action.payload);
      });
  },
});

export const { resetResultState } = resultSlice.actions;
export default resultSlice.reducer;