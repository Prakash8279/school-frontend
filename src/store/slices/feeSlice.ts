import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/fees`;

export interface FeeRecord {
  _id?: string;
  admissionNo: string;  // Changed from studentId to admissionNo for consistency
  studentId?: string;   // Keep for backward compatibility
  studentName: string;
  classname: string;
  roll_no: string;
  month: string;
  year: string;
  usesBus: boolean;
  monthly_fees: number;
  exam_fees: number;
  admission_fees?: number;
  other_fee: number;
  bus_fee?: number;
  dress_fee?: number;
  book_fee?: number;
  fine: number;
  late_fee?: number;
  discount?: number;
  scholarship?: number;
  totalAmount: number;
  paymentMode: string;
  receiptNo: string;
  date: string;
  notes: string;
  is_partial?: boolean;
  payment_type?: 'full' | 'partial' | 'advance';
  academic_year?: string;
}

export interface FeeAnalytics {
  academicYear: number;
  totalCollection: number;
  todayCollection: { amount: number; transactions: number };
  thisMonthCollection: { amount: number; transactions: number };
  monthlyBreakdown: Array<{ month: string; total: number; transactions: number }>;
  classWise: Array<{ classname: string; total: number; students: number }>;
  paymentModes: Array<{ mode: string; total: number; count: number }>;
  feeTypes: {
    monthly: number;
    bus: number;
    exam: number;
    admission: number;
    dress: number;
    book: number;
    other: number;
    fine: number;
    totalDiscount: number;
  };
}

export interface Defaulter {
  admission_no: string;
  student_name: string;
  classname: string;
  roll_no: string;
  father_name: string;
  contact: string;
  monthlyPending: number;
  busPending: number;
  admissionPending: number;
  examPending: number;
  dressPending: number;
  bookPending: number;
  totalPending: number;
  lastPaymentDate: string | null;
}

interface FeeState {
  history: FeeRecord[];
  analytics: FeeAnalytics | null;
  defaulters: Defaulter[];
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: FeeState = {
  history: [],
  analytics: null,
  defaulters: [],
  loading: false,
  success: false,
  error: null,
};

// --- API ACTIONS ---

export const payFees = createAsyncThunk(
  "fees/pay",
  async (feeData: FeeRecord, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/pay`, feeData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to process payment");
    }
  }
);

export const getFeeHistory = createAsyncThunk(
  "fees/history",
  async (filters?: { academic_year?: string; classname?: string; month?: string; payment_mode?: string }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.academic_year) params.append('academic_year', filters.academic_year);
      if (filters?.classname) params.append('classname', filters.classname);
      if (filters?.month) params.append('month', filters.month);
      if (filters?.payment_mode) params.append('payment_mode', filters.payment_mode);
      
      const { data } = await axios.get(`${API_URL}${params.toString() ? '?' + params.toString() : ''}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to load history");
    }
  }
);

export const getFeeAnalytics = createAsyncThunk(
  "fees/analytics",
  async (academicYear?: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/analytics${academicYear ? `?academic_year=${academicYear}` : ''}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to load analytics");
    }
  }
);

export const getDefaultersList = createAsyncThunk(
  "fees/defaulters",
  async (filters?: { classname?: string; min_pending?: number }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.classname) params.append('classname', filters.classname);
      if (filters?.min_pending) params.append('min_pending', filters.min_pending.toString());
      
      const { data } = await axios.get(`${API_URL}/defaulters${params.toString() ? '?' + params.toString() : ''}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to load defaulters");
    }
  }
);

export const deleteFeeRecord = createAsyncThunk(
  "fees/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete record");
    }
  }
);

const feeSlice = createSlice({
  name: "fees",
  initialState,
  reducers: {
    resetFeeState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(payFees.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(payFees.fulfilled, (state, action) => { 
        state.loading = false; 
        state.success = true; 
        state.history.unshift(action.payload);
      })
      .addCase(payFees.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
      })
      .addCase(getFeeHistory.pending, (state) => { state.loading = true; })
      .addCase(getFeeHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(getFeeHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getFeeAnalytics.pending, (state) => { state.loading = true; })
      .addCase(getFeeAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(getFeeAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getDefaultersList.pending, (state) => { state.loading = true; })
      .addCase(getDefaultersList.fulfilled, (state, action) => {
        state.loading = false;
        state.defaulters = action.payload;
      })
      .addCase(getDefaultersList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteFeeRecord.fulfilled, (state, action) => {
        state.history = state.history.filter(h => h._id !== action.payload);
      });
  },
});

export const { resetFeeState } = feeSlice.actions;
export default feeSlice.reducer;