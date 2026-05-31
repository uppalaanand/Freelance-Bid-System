import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bidService from '../../services/bidService';

export const submitBid = createAsyncThunk('bids/submit', async (bidData, thunkAPI) => {
  try {
    const { data } = await bidService.submitBid(bidData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to submit bid');
  }
});

export const fetchProjectBids = createAsyncThunk('bids/fetchByProject', async (projectId, thunkAPI) => {
  try {
    const { data } = await bidService.getProjectBids(projectId);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch bids');
  }
});

export const fetchMyBids = createAsyncThunk('bids/fetchMine', async (_, thunkAPI) => {
  try {
    const { data } = await bidService.getMyBids();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch bids');
  }
});

export const acceptBid = createAsyncThunk('bids/accept', async (id, thunkAPI) => {
  try {
    const { data } = await bidService.acceptBid(id);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to accept bid');
  }
});

export const rejectBid = createAsyncThunk('bids/reject', async (id, thunkAPI) => {
  try {
    const { data } = await bidService.rejectBid(id);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to reject bid');
  }
});

const bidSlice = createSlice({
  name: 'bids',
  initialState: {
    bids: [],
    projectBids: [],
    myBids: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearBids: (state) => {
      state.projectBids = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitBid.pending, (state) => { state.isLoading = true; })
      .addCase(submitBid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myBids.unshift(action.payload.bid);
      })
      .addCase(submitBid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProjectBids.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProjectBids.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projectBids = action.payload.bids;
      })
      .addCase(fetchProjectBids.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyBids.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMyBids.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myBids = action.payload.bids;
      })
      .addCase(fetchMyBids.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(acceptBid.fulfilled, (state, action) => {
        const accepted = action.payload.bid;
        state.projectBids = state.projectBids.map((b) =>
          b._id === accepted._id ? accepted : { ...b, status: 'rejected' }
        );
      })
      .addCase(rejectBid.fulfilled, (state, action) => {
        const rejected = action.payload.bid;
        state.projectBids = state.projectBids.map((b) =>
          b._id === rejected._id ? rejected : b
        );
      });
  },
});

export const { clearBids } = bidSlice.actions;
export default bidSlice.reducer;
