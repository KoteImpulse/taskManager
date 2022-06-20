import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';

interface IContextMenuModal {
	id: string | null;
	height: number | null;
	width: number | null;
	x: number | null;
	y: number | null;
	show: boolean | null;
	left: number | null;
	top: number | null;
	modalType: ModalType | null;
	contentType: ContentType | null;
}
export enum ModalType {
	project = 'project',
	section = 'section',
	task = 'task',
	taskModal = 'taskModal',
}
export enum ContentType {
	favorite = 'favorite',
	standart = 'standart',
	archived = 'archived',
	projectPage = 'projectPage',
	defaultProjects = 'defaultProjects',
}

interface ContextModalState {
	contextMenuModal: IContextMenuModal;
}

const initialState: ContextModalState = {
	contextMenuModal: {
		id: null,
		height: null,
		width: null,
		x: null,
		y: null,
		show: null,
		left: null,
		top: null,
		modalType: null,
		contentType: null,
	},
};

export const contextModalSlice = createSlice({
	name: 'contextModal',
	initialState,
	reducers: {
		setContextMenuModal: (state, action: PayloadAction<IContextMenuModal>) => {
			state.contextMenuModal = action.payload;
		},
		closeContextMenuModal: (state) => {
			state.contextMenuModal = {
				id: null,
				height: null,
				width: null,
				x: null,
				y: null,
				show: null,
				left: null,
				top: null,
				modalType: null,
				contentType: null,
			};
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload.contextModal,
			};
		},
	},
});

export const selectContextModal = (state: AppState) => state.contextModal;
