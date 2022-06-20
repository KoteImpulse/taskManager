import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';
import { IProject } from '../../types/projects';
import { doc, getDoc } from 'firebase/firestore';
import db from '../../firebase';

interface ProjectState {
	project: IProject;
	isLoading: boolean;
	error: string;
}

const initialState: ProjectState = {
	project: {} as IProject,
	isLoading: false,
	error: '',
};

export const fetchProject = createAsyncThunk(
	'project/fetchProject',
	async (ids: { projectId: string; userId: string }, thunkAPI) => {
		try {
			const projectRef = doc(db, 'projects', ids.projectId);
			const projectSnapshot = await getDoc(projectRef);
			if (projectSnapshot.id && projectSnapshot?.data()?.userId === ids.userId) {
				const result = {
					order: projectSnapshot.data()?.order,
					userId: projectSnapshot.data()?.userId,
					projectDescription: projectSnapshot.data()?.projectDescription,
					projectName: projectSnapshot.data()?.projectName,
					isDeleted: projectSnapshot.data()?.isDeleted,
					isArchived: projectSnapshot.data()?.isArchived,
					collapsed: projectSnapshot.data()?.collapsed,
					date: projectSnapshot.data()?.date.toDate().getTime(),
					isFavorite: projectSnapshot.data()?.isFavorite,
					id: projectSnapshot.id,
					color: projectSnapshot.data()?.color,
					showArchivedTasks: projectSnapshot.data()?.showArchivedTasks,
				};
				return result;
			} else {
				return thunkAPI.rejectWithValue('произошла ошибка загрузки проекта');
			}
		} catch (error) {
			return thunkAPI.rejectWithValue('произошла ошибка загрузки проекта');
		}
	}
);

export const projectSlice = createSlice({
	name: 'project',
	initialState,
	reducers: {
		setProject: (state, action: PayloadAction<IProject>) => {
			state.project = action.payload;
			state.error = '';
		},
		setEmptyProject: (state, action: PayloadAction<string>) => {
			state.project = {} as IProject;
			state.error = action.payload;
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload.project,
			};
		},
		[fetchProject.fulfilled.type]: (state, action: PayloadAction<IProject>) => {
			state.isLoading = false;
			state.error = '';
			state.project = action.payload;
		},
		[fetchProject.pending.type]: (state) => {
			state.isLoading = true;
		},
		[fetchProject.rejected.type]: (state, action: PayloadAction<string>) => {
			state.isLoading = false;
			state.error = action.payload;
		},
	},
});

export const selectProject = (state: AppState) => state.project;
