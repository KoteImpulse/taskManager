import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';

interface IProjectModal {
	id: string | null;
	show: boolean | null;
	type: ProjectModalType | null;
	projectName: string | null;
	projectDescription: string | null;
	color: string | null;
	isFavorite: boolean | null;
}
export enum ProjectModalType {
	add = 'add',
	edit = 'edit',
	addUp = 'addUp',
	addDown = 'addDown',
}

interface ModalsState {
	projectModal: IProjectModal;
}

const initialState: ModalsState = {
	projectModal: {
		id: null,
		show: null,
		type: null,
		projectName: null,
		projectDescription: null,
		color: null,
		isFavorite: null,
	},
};

export const projectModalSlice = createSlice({
	name: 'projectModal',
	initialState,
	reducers: {
		setProjectModal: (state, action: PayloadAction<IProjectModal>) => {
			state.projectModal = action.payload;
		},
		setProjectModalName: (state, action: PayloadAction<string>) => {
			state.projectModal.projectName = action.payload;
		},
		setProjectModalDesc: (state, action: PayloadAction<string>) => {
			state.projectModal.projectDescription = action.payload;
		},
		setProjectModalColor: (state, action: PayloadAction<string>) => {
			state.projectModal.color = action.payload;
		},
		setProjectModalIsFav: (state, action: PayloadAction<boolean>) => {
			state.projectModal.isFavorite = action.payload;
		},
		closeProjectModal: (state) => {
			state.projectModal = {
				id: null,
				show: null,
				type: null,
				projectName: null,
				projectDescription: null,
				color: null,
				isFavorite: null,
			};
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload.projectModal,
			};
		},
	},
});

export const selectProjectModal = (state: AppState) => state.projectModal;
