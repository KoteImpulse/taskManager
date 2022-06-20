import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';
import { uuid } from '../../helpers/helpers';

interface IToastModal {
	show: boolean | null;
	text: string | null;
	title: string | null;
	mode: string | null;
	canClose: boolean | null;
	id: string | null;
	autoClose: boolean | null;
	autoCloseTime: number | null;
	showProgress: boolean | null;
	pauseOnHover: boolean | null;
	pauseOnOutFocus: boolean | null;
}
export interface IToast {
	id: string;
	text: string;
	title: string;
	mode: string;
	canClose: boolean;
	autoClose: boolean;
	autoCloseTime: number;
	showProgress: boolean;
	pauseOnHover: boolean;
	pauseOnOutFocus: boolean;
}

interface ToastModalsState {
	toastModal: IToastModal;
}

const initialState: ToastModalsState = {
	toastModal: {
		show: null,
		text: null,
		title: null,
		mode: null,
		canClose: true,
		id: null,
		autoClose: true,
		autoCloseTime: 5000,
		showProgress: true,
		pauseOnHover: true,
		pauseOnOutFocus: true,
	},
};

export const toastModalSlice = createSlice({
	name: 'toastModal',
	initialState,
	reducers: {
		setToastModal: (state, action: PayloadAction<IToastModal>) => {
			state.toastModal = action.payload;
		},
		setToastModalError: (state) => {
			state.toastModal.show = true;
			state.toastModal.text = `Произошла непредвиденная ошибка`;
			state.toastModal.title = 'Ошибка';
			state.toastModal.mode = 'error';
			state.toastModal.id = uuid(4, 3);
		},
		setToastModalWarning:(state, action: PayloadAction<string>)=>{
			state.toastModal.show = true;
			state.toastModal.text = action.payload;
			state.toastModal.title = 'Предупреждение';
			state.toastModal.mode = 'warning';
			state.toastModal.id = uuid(4, 3);
		},
		setToastModalSuccess:(state, action: PayloadAction<string>)=>{
			state.toastModal.show = true;
			state.toastModal.text = action.payload;
			state.toastModal.title = 'Успех';
			state.toastModal.mode = 'success';
			state.toastModal.id = uuid(4, 3);
		},
		closeToastModal: (state) => {
			state.toastModal = {
				show: null,
				text: null,
				title: null,
				mode: null,
				canClose: true,
				id: null,
				autoClose: true,
				autoCloseTime: 5000,
				showProgress: true,
				pauseOnHover: true,
				pauseOnOutFocus: true,
			};
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload.toastModal,
			};
		},
	},
});

export const selectToastModal = (state: AppState) => state.toastModal;
