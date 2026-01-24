import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ============================================
// ASSIGNMENTS THUNKS
// ============================================

export const fetchAllAssignments = createAsyncThunk(
  'assignments/fetchAll',
  async (filters: { classname?: string; subject?: string; teacher_id?: string } = {}, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const params = new URLSearchParams();
    if (filters.classname) params.append('classname', filters.classname);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.teacher_id) params.append('teacher_id', filters.teacher_id);
    
    const res = await fetch(`${API_URL}/assignments?${params}`, {
      headers: { Authorization: `Bearer ${auth.userInfo?.token}` }
    });
    if (!res.ok) return rejectWithValue('Failed to fetch assignments');
    return res.json();
  }
);

export const fetchAssignmentsByClass = createAsyncThunk(
  'assignments/fetchByClass',
  async (classname: string, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const res = await fetch(`${API_URL}/assignments/class/${classname}`, {
      headers: { Authorization: `Bearer ${auth.userInfo?.token}` }
    });
    if (!res.ok) return rejectWithValue('Failed to fetch assignments');
    return res.json();
  }
);

export const createAssignment = createAsyncThunk(
  'assignments/create',
  async (data: any, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const res = await fetch(`${API_URL}/assignments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.userInfo?.token}` 
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return rejectWithValue('Failed to create assignment');
    return res.json();
  }
);

export const updateAssignment = createAsyncThunk(
  'assignments/update',
  async ({ id, data }: { id: string; data: any }, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const res = await fetch(`${API_URL}/assignments/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.userInfo?.token}` 
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return rejectWithValue('Failed to update assignment');
    return res.json();
  }
);

export const deleteAssignment = createAsyncThunk(
  'assignments/delete',
  async (id: string, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const res = await fetch(`${API_URL}/assignments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${auth.userInfo?.token}` }
    });
    if (!res.ok) return rejectWithValue('Failed to delete assignment');
    return id;
  }
);

export const submitAssignment = createAsyncThunk(
  'assignments/submit',
  async (data: any, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const res = await fetch(`${API_URL}/assignments/submit`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.userInfo?.token}` 
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return rejectWithValue('Failed to submit assignment');
    return res.json();
  }
);

export const fetchAssignmentSubmissions = createAsyncThunk(
  'assignments/fetchSubmissions',
  async (assignmentId: string, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const res = await fetch(`${API_URL}/assignments/${assignmentId}/submissions`, {
      headers: { Authorization: `Bearer ${auth.userInfo?.token}` }
    });
    if (!res.ok) return rejectWithValue('Failed to fetch submissions');
    return res.json();
  }
);

export const gradeAssignment = createAsyncThunk(
  'assignments/grade',
  async ({ id, data }: { id: string; data: any }, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const res = await fetch(`${API_URL}/assignments/submissions/${id}/grade`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.userInfo?.token}` 
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return rejectWithValue('Failed to grade assignment');
    return res.json();
  }
);

// ============================================
// QUIZZES THUNKS
// ============================================

export const fetchAllQuizzes = createAsyncThunk(
  'quizzes/fetchAll',
  async (filters: { classname?: string; subject?: string; teacher_id?: string } = {}, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const params = new URLSearchParams();
    if (filters.classname) params.append('classname', filters.classname);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.teacher_id) params.append('teacher_id', filters.teacher_id);
    
    const res = await fetch(`${API_URL}/quizzes?${params}`, {
      headers: { Authorization: `Bearer ${auth.userInfo?.token}` }
    });
    if (!res.ok) return rejectWithValue('Failed to fetch quizzes');
    return res.json();
  }
);

export const fetchQuizzesByClass = createAsyncThunk(
  'quizzes/fetchByClass',
  async (classname: string, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const res = await fetch(`${API_URL}/quizzes/class/${classname}`, {
      headers: { Authorization: `Bearer ${auth.userInfo?.token}` }
    });
    if (!res.ok) return rejectWithValue('Failed to fetch quizzes');
    return res.json();
  }
);

export const fetchQuizForTaking = createAsyncThunk(
  'quizzes/fetchForTaking',
  async (quizId: string, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const res = await fetch(`${API_URL}/quizzes/${quizId}/take`, {
      headers: { Authorization: `Bearer ${auth.userInfo?.token}` }
    });
    if (!res.ok) return rejectWithValue('Failed to fetch quiz');
    return res.json();
  }
);

export const createQuiz = createAsyncThunk(
  'quizzes/create',
  async (data: any, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const res = await fetch(`${API_URL}/quizzes`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.userInfo?.token}` 
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return rejectWithValue('Failed to create quiz');
    return res.json();
  }
);

export const updateQuiz = createAsyncThunk(
  'quizzes/update',
  async ({ id, data }: { id: string; data: any }, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const res = await fetch(`${API_URL}/quizzes/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.userInfo?.token}` 
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return rejectWithValue('Failed to update quiz');
    return res.json();
  }
);

export const deleteQuiz = createAsyncThunk(
  'quizzes/delete',
  async (id: string, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const res = await fetch(`${API_URL}/quizzes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${auth.userInfo?.token}` }
    });
    if (!res.ok) return rejectWithValue('Failed to delete quiz');
    return id;
  }
);

export const submitQuiz = createAsyncThunk(
  'quizzes/submit',
  async (data: any, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const res = await fetch(`${API_URL}/quizzes/submit`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.userInfo?.token}` 
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return rejectWithValue('Failed to submit quiz');
    return res.json();
  }
);

export const fetchQuizSubmissions = createAsyncThunk(
  'quizzes/fetchSubmissions',
  async (quizId: string, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const res = await fetch(`${API_URL}/quizzes/${quizId}/submissions`, {
      headers: { Authorization: `Bearer ${auth.userInfo?.token}` }
    });
    if (!res.ok) return rejectWithValue('Failed to fetch submissions');
    return res.json();
  }
);

export const gradeQuiz = createAsyncThunk(
  'quizzes/grade',
  async ({ id, data }: { id: string; data: any }, { getState, rejectWithValue }) => {
    const { auth } = getState() as any;
    const res = await fetch(`${API_URL}/quizzes/submissions/${id}/grade`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.userInfo?.token}` 
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return rejectWithValue('Failed to grade quiz');
    return res.json();
  }
);

// ============================================
// SLICE
// ============================================

interface AssignmentState {
  assignments: any[];
  quizzes: any[];
  currentQuiz: any | null;
  submissions: any[];
  quizSubmissions: any[];
  loading: boolean;
  error: string | null;
}

const initialState: AssignmentState = {
  assignments: [],
  quizzes: [],
  currentQuiz: null,
  submissions: [],
  quizSubmissions: [],
  loading: false,
  error: null
};

const assignmentSlice = createSlice({
  name: 'assignment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Assignments
      .addCase(fetchAllAssignments.pending, (state) => { state.loading = true; })
      .addCase(fetchAllAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchAllAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAssignmentsByClass.fulfilled, (state, action) => {
        state.assignments = action.payload;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.assignments.unshift(action.payload);
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        const idx = state.assignments.findIndex(a => a._id === action.payload._id);
        if (idx !== -1) state.assignments[idx] = action.payload;
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.assignments = state.assignments.filter(a => a._id !== action.payload);
      })
      .addCase(fetchAssignmentSubmissions.fulfilled, (state, action) => {
        state.submissions = action.payload;
      })
      // Quizzes
      .addCase(fetchAllQuizzes.pending, (state) => { state.loading = true; })
      .addCase(fetchAllQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
      })
      .addCase(fetchAllQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchQuizzesByClass.fulfilled, (state, action) => {
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizForTaking.fulfilled, (state, action) => {
        state.currentQuiz = action.payload;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.quizzes.unshift(action.payload);
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        const idx = state.quizzes.findIndex(q => q._id === action.payload._id);
        if (idx !== -1) state.quizzes[idx] = action.payload;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.quizzes = state.quizzes.filter(q => q._id !== action.payload);
      })
      .addCase(fetchQuizSubmissions.fulfilled, (state, action) => {
        state.quizSubmissions = action.payload;
      });
  }
});

export const { clearError, clearCurrentQuiz } = assignmentSlice.actions;
export default assignmentSlice.reducer;
