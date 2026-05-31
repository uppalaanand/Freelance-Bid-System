import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import projectService from '../../services/projectService';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (params, thunkAPI) => {
  try {
    const { data } = await projectService.getProjects(params);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
  }
});

export const fetchProject = createAsyncThunk('projects/fetchOne', async (id, thunkAPI) => {
  try {
    const { data } = await projectService.getProject(id);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch project');
  }
});

export const createProject = createAsyncThunk('projects/create', async (projectData, thunkAPI) => {
  try {
    const { data } = await projectService.createProject(projectData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create project');
  }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, projectData }, thunkAPI) => {
  try {
    const { data } = await projectService.updateProject(id, projectData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update project');
  }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id, thunkAPI) => {
  try {
    await projectService.deleteProject(id);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete project');
  }
});

export const fetchMyProjects = createAsyncThunk('projects/fetchMine', async (_, thunkAPI) => {
  try {
    const { data } = await projectService.getMyProjects();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
  }
});

export const fetchAssignedProjects = createAsyncThunk('projects/fetchAssigned', async (_, thunkAPI) => {
  try {
    const { data } = await projectService.getAssignedProjects();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch assigned projects');
  }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    project: null,
    myProjects: [],
    assignedProjects: [],
    totalPages: 1,
    currentPage: 1,
    total: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearProject: (state) => {
      state.project = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.projects;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.project = action.payload.project;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.myProjects.unshift(action.payload.project);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const updated = action.payload.project;
        state.myProjects = state.myProjects.map((p) => (p._id === updated._id ? updated : p));
        if (state.project?._id === updated._id) state.project = updated;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.myProjects = state.myProjects.filter((p) => p._id !== action.payload);
      })
      .addCase(fetchMyProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myProjects = action.payload.projects;
      })
      .addCase(fetchMyProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAssignedProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAssignedProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignedProjects = action.payload.projects;
      })
      .addCase(fetchAssignedProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProject, clearError } = projectSlice.actions;
export default projectSlice.reducer;
