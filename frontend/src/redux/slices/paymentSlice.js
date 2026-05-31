import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from '../../services/paymentService';

export const createOrder = createAsyncThunk('payments/createOrder', async (orderData, thunkAPI) => {
  try {
    const { data } = await paymentService.createOrder(orderData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create order');
  }
});

export const verifyPayment = createAsyncThunk('payments/verify', async (paymentData, thunkAPI) => {
  try {
    const { data } = await paymentService.verifyPayment(paymentData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Payment verification failed');
  }
});

export const fetchProjectPayments = createAsyncThunk('payments/fetchByProject', async (projectId, thunkAPI) => {
  try {
    const { data } = await paymentService.getProjectPayments(projectId);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
  }
});

export const releasePayment = createAsyncThunk('payments/release', async (id, thunkAPI) => {
  try {
    const { data } = await paymentService.releasePayment(id);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to release payment');
  }
});

export const fetchMyEarnings = createAsyncThunk('payments/myEarnings', async (_, thunkAPI) => {
  try {
    const { data } = await paymentService.getMyEarnings();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch earnings');
  }
});

export const fetchMyPayments = createAsyncThunk('payments/myPayments', async (_, thunkAPI) => {
  try {
    const { data } = await paymentService.getMyPayments();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
  }
});

const paymentSlice = createSlice({
  name: 'payments',
  initialState: {
    payments: [],
    earnings: null,
    order: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearOrder: (state) => {
      state.order = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.isLoading = true; })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload.order;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.payments.push(action.payload.payment);
        state.order = null;
      })
      .addCase(fetchProjectPayments.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProjectPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload.payments;
      })
      .addCase(fetchProjectPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(releasePayment.fulfilled, (state, action) => {
        const updated = action.payload.payment;
        state.payments = state.payments.map((p) => (p._id === updated._id ? updated : p));
      })
      .addCase(fetchMyEarnings.fulfilled, (state, action) => {
        state.earnings = action.payload;
      })
      .addCase(fetchMyPayments.fulfilled, (state, action) => {
        state.payments = action.payload.payments;
      });
  },
});

export const { clearOrder } = paymentSlice.actions;
export default paymentSlice.reducer;
