import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import db from '../../firebase';
import { ITask } from '../../types/task';

interface TasksState {
	tasks: ITask[];
	isLoading: boolean;
	error: string;
}

const initialState: TasksState = {
	tasks: [],
	isLoading: false,
	error: '',
};

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (userId: string, thunkAPI) => {
	try {
		const q = query(collection(db, 'tasks'), where('userId', '==', userId));
		const querySnapshot = await getDocs(q);
		const tasks = querySnapshot.docs.map((doc) => ({
			parentId: doc.data()?.parentId,
			parent: doc.data()?.parent,
			order: doc.data()?.order,
			taskDescription: doc.data()?.taskDescription,
			date: doc.data()?.date.toDate().getTime(),
			isArchived: doc.data()?.isArchived,
			userId: doc.data()?.userId,
			taskName: doc.data()?.taskName,
			sectionId: doc.data()?.sectionId,
			projectId: doc.data()?.projectId,
			isDeleted: doc.data()?.isDeleted,
			id: doc.id,
			level: doc.data()?.level,
			label: doc.data()?.label,
			projectColor: doc.data()?.projectColor,
			projectName: doc.data()?.projectName,
			endDate: doc.data()?.endDate,
			priority: doc.data()?.priority,
			isCollapsed: doc.data()?.isCollapsed,
			hidden: doc.data()?.hidden,
		}));
		return tasks;
	} catch (error) {
		return thunkAPI.rejectWithValue('произошла ошибка загрузки задач');
	}
});

export const tasksSlice = createSlice({
	name: 'tasks',
	initialState,
	reducers: {},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload.tasks,
			};
		},
		[fetchTasks.fulfilled.type]: (state, action: PayloadAction<ITask[]>) => {
			state.isLoading = false;
			state.error = '';
			state.tasks = action.payload;
		},
		[fetchTasks.pending.type]: (state) => {
			state.isLoading = true;
		},
		[fetchTasks.rejected.type]: (state, action: PayloadAction<string>) => {
			state.isLoading = false;
			state.error = action.payload;
		},
	},
});

export const selectTasks = (state: AppState) => state.tasks;
