import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';

interface ITaskModal {
	id: string | null;
	show: boolean | null;
	type: TaskModalType | null;
	typeWhere: TaskModalTypeWhere | null;
	taskName: string | null;
	taskDescription: string | null;
	projectColor: string | null;
	projectName: string | null;
	sectionName: string | null;
	projectId: string | null;
	sectionId: string | null;
	endDate: number | null;
	priority: number | null;
	label: string | null;
	parentId: string | null;
	parent: boolean | null;
	level: number | null;
	upOrDownTaskId: string | null;
	projectDestination: string | null;
	sectionDestination: string | null;
	order: number | null;
	whereOpen: TaskModalTypeWhere | null;
}
export enum TaskModalType {
	add = 'add',
	edit = 'edit',
	taskModalEdit = 'taskModalEdit',
	taskModalAdd = 'taskModalAdd',
}
export enum TaskModalTypeWhere {
	quick = 'quick',
	project = 'project',
	up = 'up',
	down = 'down',
	subTask = 'subTask',
	taskModal = 'taskModal',
}

interface ModalsState {
	taskModal: ITaskModal;
}

const initialState: ModalsState = {
	taskModal: {
		id: null,
		show: null,
		type: null,
		typeWhere: null,
		taskName: null,
		taskDescription: null,
		projectColor: null,
		projectName: null,
		sectionName: null,
		projectId: null,
		sectionId: null,
		endDate: null,
		priority: null,
		label: null,
		parentId: null,
		parent: null,
		level: null,
		upOrDownTaskId: null,
		projectDestination: null,
		sectionDestination: null,
		order: null,
		whereOpen: null,
	},
};

export const taskModalSlice = createSlice({
	name: 'taskModal',
	initialState,
	reducers: {
		setTaskModal: (state, action: PayloadAction<ITaskModal>) => {
			state.taskModal = action.payload;
		},
		setTaskModalName: (state, action: PayloadAction<string>) => {
			state.taskModal.taskName = action.payload;
		},
		setTaskModalDesc: (state, action: PayloadAction<string>) => {
			state.taskModal.taskDescription = action.payload;
		},
		setTaskModalProjectId: (state, action: PayloadAction<string>) => {
			state.taskModal.projectId = action.payload;
		},
		setTaskModalSectionId: (state, action: PayloadAction<string>) => {
			state.taskModal.sectionId = action.payload;
		},
		setTaskModalSectionName: (state, action: PayloadAction<string>) => {
			state.taskModal.sectionName = action.payload;
		},
		setTaskModalSectionDestination: (state, action: PayloadAction<string>) => {
			state.taskModal.sectionDestination = action.payload;
		},
		setTaskModalEndDate: (state, action: PayloadAction<number>) => {
			state.taskModal.endDate = action.payload;
		},
		setTaskModalPriority: (state, action: PayloadAction<number>) => {
			state.taskModal.priority = action.payload;
		},
		setTaskModalLabel: (state, action: PayloadAction<string>) => {
			state.taskModal.label = action.payload;
		},
		setTaskModalParentId: (state, action: PayloadAction<string>) => {
			state.taskModal.parentId = action.payload;
		},
		setTaskModalParent: (state, action: PayloadAction<boolean>) => {
			state.taskModal.parent = action.payload;
		},
		setTaskModalLevel: (state, action: PayloadAction<number>) => {
			state.taskModal.level = action.payload;
		},
		setTaskModalProjectColor: (state, action: PayloadAction<string>) => {
			state.taskModal.projectColor = action.payload;
		},
		setTaskModalProjectName: (state, action: PayloadAction<string>) => {
			state.taskModal.projectName = action.payload;
		},
		setTaskModalProjectDestination: (state, action: PayloadAction<string>) => {
			state.taskModal.projectDestination = action.payload;
		},
		closeTaskModal: (state) => {
			state.taskModal = {
				id: null,
				show: null,
				type: null,
				typeWhere: null,
				taskName: null,
				taskDescription: null,
				projectColor: null,
				projectName: null,
				sectionName: null,
				projectId: null,
				sectionId: null,
				endDate: null,
				priority: null,
				label: null,
				parentId: null,
				parent: null,
				level: null,
				upOrDownTaskId: null,
				projectDestination: null,
				sectionDestination: null,
				order: null,
				whereOpen: null,
			};
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload.taskModal,
			};
		},
	},
});

export const selectTaskModal = (state: AppState) => state.taskModal;
