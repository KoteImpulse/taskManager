import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';
import { collection, doc, DocumentData, getDoc, getDocs, orderBy, Query, query, where } from 'firebase/firestore';
import db from '../../firebase';
import { ITask } from '../../types/task';

interface TasksProjectState {
	tasksProject: ITask[];
	isLoading: boolean;
	error: string;
}

const initialState: TasksProjectState = {
	tasksProject: [],
	isLoading: false,
	error: '',
};

export const fetchTasksProject = createAsyncThunk(
	'tasks/fetchTasksProject',
	async (ids: { projectId: string; userId: string }, thunkAPI) => {
		try {
			const projectRef = doc(db, 'projects', ids.projectId);
			const projectSnapshot = await getDoc(projectRef);

			let q: Query<DocumentData>;
			if (projectSnapshot?.data()?.order === -2) {
				const yestarday = new Date();
				const today = Number(new Date().getTime());
				yestarday.setDate(yestarday.getDate() - 1);
				const yestday = Number(yestarday.getTime());
				q = query(
					collection(db, 'tasks'),
					where('userId', '==', ids.userId),
					where('endDate', '<=', today),
					where('endDate', '>=', yestday)
				);
			} else if (projectSnapshot?.data()?.order === -3) {
				let today = new Date();
				today.setDate(today.getDate() + 7);
				q = query(
					collection(db, 'tasks'),
					where('userId', '==', ids.userId),
					where('endDate', '<=', today.getTime()),
					where('endDate', '>=', new Date().getTime())
				);
			} else {
				q = query(collection(db, 'tasks'), where('userId', '==', ids.userId), where('projectId', '==', ids.projectId));
			}
			const querySnapshot = await getDocs(q);
			const tasksProject = querySnapshot.docs.map((doc) => ({
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
			if (projectSnapshot?.data()?.order === -2) {
				return tasksProject.sort((a, b) => b.endDate - a.endDate);
			} else if (projectSnapshot?.data()?.order === -3) {
				return tasksProject.sort((a, b) => b.endDate - a.endDate);
			} else {
				return tasksProject.sort((a, b) => a.level - b.level);
			}
		} catch (error) {
			return thunkAPI.rejectWithValue('произошла ошибка загрузки задач');
		}
	}
);

export const tasksProjectSlice = createSlice({
	name: 'tasksProject',
	initialState,
	reducers: {
		setTasksProject: (state, action: PayloadAction<ITask[]>) => {
			state.tasksProject = action.payload;
			state.error = '';
		},
		setEmptyTasksProject: (state, action: PayloadAction<string>) => {
			state.tasksProject = [] as ITask[];
			state.error = action.payload;
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload.tasksProject,
			};
		},
		[fetchTasksProject.fulfilled.type]: (state, action: PayloadAction<ITask[]>) => {
			state.isLoading = false;
			state.error = '';
			state.tasksProject = action.payload;
		},
		[fetchTasksProject.pending.type]: (state) => {
			state.isLoading = true;
		},
		[fetchTasksProject.rejected.type]: (state, action: PayloadAction<string>) => {
			state.isLoading = false;
			state.error = action.payload;
		},
	},
});

export const selectTasksProject = (state: AppState) => state.tasksProject;
