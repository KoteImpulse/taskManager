import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';
import { doc, getDoc } from 'firebase/firestore';
import db from '../../firebase';
import { ITask } from '../../types/task';

interface TasksProjectState {
	task: ITask;
	isLoading: boolean;
	error: string;
}

const initialState: TasksProjectState = {
	task: {} as ITask,
	isLoading: false,
	error: '',
};

export const fetchTask = createAsyncThunk('tasks/fetchTask', async (id: string, thunkAPI) => {
	try {
		const taskRef = doc(db, 'tasks', id);
		const taskSnapshot = await getDoc(taskRef);
		if (taskSnapshot.exists()) {
			const task = {
				parentId: taskSnapshot.data()?.parentId,
				parent: taskSnapshot.data()?.parent,
				order: taskSnapshot.data()?.order,
				taskDescription: taskSnapshot.data()?.taskDescription,
				date: taskSnapshot.data()?.date.toDate().getTime(),
				isArchived: taskSnapshot.data()?.isArchived,
				userId: taskSnapshot.data()?.userId,
				taskName: taskSnapshot.data()?.taskName,
				sectionId: taskSnapshot.data()?.sectionId,
				projectId: taskSnapshot.data()?.projectId,
				isDeleted: taskSnapshot.data()?.isDeleted,
				id: taskSnapshot.id,
				level: taskSnapshot.data()?.level,
				label: taskSnapshot.data()?.label,
				projectColor: taskSnapshot.data()?.projectColor,
				projectName: taskSnapshot.data()?.projectName,
				endDate: taskSnapshot.data()?.endDate,
				priority: taskSnapshot.data()?.priority,
				isCollapsed: taskSnapshot.data()?.isCollapsed,
				hidden: taskSnapshot.data()?.hidden,
			};
			return task;
		} else {
			return {} as ITask;
		}
	} catch (error) {
		return thunkAPI.rejectWithValue('произошла ошибка загрузки задачи');
	}
});

export const taskSlice = createSlice({
	name: 'task',
	initialState,
	reducers: {
		setSingleTask: (state, action: PayloadAction<ITask>) => {
			state.task = action.payload;
			state.error = '';
		},
		setEmptyTask: (state, action: PayloadAction<string>) => {
			state.task = {} as ITask;
			state.error = action.payload;
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload.task,
			};
		},
		[fetchTask.fulfilled.type]: (state, action: PayloadAction<ITask>) => {
			state.isLoading = false;
			state.error = '';
			state.task = action.payload;
		},
		[fetchTask.pending.type]: (state) => {
			state.isLoading = true;
		},
		[fetchTask.rejected.type]: (state, action: PayloadAction<string>) => {
			state.isLoading = false;
			state.error = action.payload;
		},
	},
});

export const selectTask = (state: AppState) => state.task;
