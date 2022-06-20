import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';

interface IPopUpModal {
	id: string | null;
	height: number | null;
	width: number | null;
	x: number | null;
	y: number | null;
	show: boolean | null;
	left: number | null;
	top: number | null;
	modalType: ModalPopUpType | null;
	modalTypeWhere: ModalPopUpTypeWhere | null;
}
export enum ModalPopUpType {
	projectSelect = 'projectSelect',
	dateSelect = 'dateSelect',
	prioritySelect = 'prioritySelect',
	projectSectionSelect = 'projectSectionSelect',
}
export enum ModalPopUpTypeWhere {
	add = 'add',
	edit = 'edit',
	quick = 'quick',
}

interface PopupModalsState {
	popUpModal: IPopUpModal;
}

const initialState: PopupModalsState = {
	popUpModal: {
		id: null,
		height: null,
		width: null,
		x: null,
		y: null,
		show: null,
		left: null,
		top: null,
		modalType: null,
		modalTypeWhere: null,
	},
};

export const popupModalSlice = createSlice({
	name: 'popupModal',
	initialState,
	reducers: {
		setPopUpModal: (state, action: PayloadAction<IPopUpModal>) => {
			state.popUpModal = action.payload;
		},
		closePopUpModal: (state) => {
			state.popUpModal = {
				id: null,
				height: null,
				width: null,
				x: null,
				y: null,
				show: null,
				left: null,
				top: null,
				modalType: null,
				modalTypeWhere: null,
			};
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload.popupModal,
			};
		},
	},
});

export const selectPopupModal = (state: AppState) => state.popupModal;
