import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';
import { IProject } from '../../types/projects';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import db from '../../firebase';

interface ProjectsState {
	projects: IProject[];
	isLoading: boolean;
	error: string;
}

const initialState: ProjectsState = {
	projects: [],
	isLoading: false,
	error: '',
};

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async (userId: string, thunkAPI) => {
	try {
		const q = query(collection(db, 'projects'), where('userId', '==', userId), orderBy('order', 'asc'));
		const querySnapshot = await getDocs(q);
		const projects = querySnapshot.docs.map((doc) => ({
			order: doc.data().order,
			userId: doc.data().userId,
			projectDescription: doc.data().projectDescription,
			projectName: doc.data().projectName,
			isDeleted: doc.data().isDeleted,
			isArchived: doc.data().isArchived,
			collapsed: doc.data().collapsed,
			date: doc.data().date.toDate().getTime(),
			isFavorite: doc.data().isFavorite,
			id: doc.id,
			color: doc.data().color,
			showArchivedTasks: doc.data().showArchivedTasks,
		}));
		return projects;
	} catch (error) {
		return thunkAPI.rejectWithValue('произошла ошибка загрузки списка проектов');
	}
});

export const projectsSlice = createSlice({
	name: 'projects',
	initialState,
	reducers: {},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload.projects,
			};
		},
		[fetchProjects.fulfilled.type]: (state, action: PayloadAction<IProject[]>) => {
			state.isLoading = false;
			state.error = '';
			state.projects = action.payload;
		},
		[fetchProjects.pending.type]: (state) => {
			state.isLoading = true;
		},
		[fetchProjects.rejected.type]: (state, action: PayloadAction<string>) => {
			state.isLoading = false;
			state.error = action.payload;
		},
	},
});

export const selectProjects = (state: AppState) => state.projects;
