import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api, type Scan, type Finding } from "../../lib/api";

interface ScansState {
  list: Scan[];
  currentScan: Scan | null;
  findings: Finding[];
  loading: boolean;
  error: string | null;
}

const initialState: ScansState = {
  list: [],
  currentScan: null,
  findings: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchScans = createAsyncThunk(
  "scans/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getScans();
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch scans"
      );
    }
  }
);

export const createScan = createAsyncThunk(
  "scans/create",
  async (
    { name, type, target }: { name: string; type: string; target: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.createScan(name, type, target);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create scan"
      );
    }
  }
);

export const fetchScanDetails = createAsyncThunk(
  "scans/fetchDetails",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.getScan(id);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch scan details"
      );
    }
  }
);

export const fetchScanFindings = createAsyncThunk(
  "scans/fetchFindings",
  async (scanId: string, { rejectWithValue }) => {
    try {
      const response = await api.getFindings(scanId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch findings"
      );
    }
  }
);

const scansSlice = createSlice({
  name: "scans",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentScan: (state) => {
      state.currentScan = null;
      state.findings = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch all scans
    builder
      .addCase(fetchScans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScans.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchScans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create scan
    builder
      .addCase(createScan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createScan.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload); // Add new scan to start of list
      })
      .addCase(createScan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch scan details
    builder
      .addCase(fetchScanDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScanDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentScan = action.payload;
      })
      .addCase(fetchScanDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch findings
    builder
      .addCase(fetchScanFindings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScanFindings.fulfilled, (state, action) => {
        state.loading = false;
        state.findings = action.payload;
      })
      .addCase(fetchScanFindings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentScan } = scansSlice.actions;
export default scansSlice.reducer;
