import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../../services/chatService';

export const fetchChats = createAsyncThunk('chat/fetchAll', async (_, thunkAPI) => {
  try {
    const { data } = await chatService.getChats();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
  }
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (chatId, thunkAPI) => {
  try {
    const { data } = await chatService.getMessages(chatId);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
  }
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ chatId, content }, thunkAPI) => {
  try {
    const { data } = await chatService.sendMessage(chatId, { content });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to send message');
  }
});

export const createChat = createAsyncThunk('chat/create', async (chatData, thunkAPI) => {
  try {
    const { data } = await chatService.createChat(chatData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create chat');
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
    activeChat: null,
    messages: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      // Update last message in chat list
      const chatIndex = state.chats.findIndex((c) => c._id === action.payload.chat);
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = action.payload.content;
        state.chats[chatIndex].lastMessageAt = action.payload.createdAt;
      }
    },
    clearMessages: (state) => {
      state.messages = [];
      state.activeChat = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => { state.isLoading = true; })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chats = action.payload.chats;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchMessages.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload.message);
      })
      .addCase(createChat.fulfilled, (state, action) => {
        const existing = state.chats.find((c) => c._id === action.payload.chat._id);
        if (!existing) {
          state.chats.unshift(action.payload.chat);
        }
        state.activeChat = action.payload.chat;
      });
  },
});

export const { setActiveChat, addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
