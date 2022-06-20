import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';

interface ICheckModal {
	id: string | null;
	show: boolean | null;
	text: string | null;
	buttonText: string | null;
	cbFunc: (() => Promise<void>) | null;
	disable: boolean | null;
}

interface ModalsState {
	checkModal: ICheckModal;
}

const initialState: ModalsState = {
	checkModal: {
		id: null,
		show: null,
		text: null,
		buttonText: null,
		cbFunc: null,
		disable: null,
	},
};

export const checkModalSlice = createSlice({
	name: 'checkModal',
	initialState,
	reducers: {
		setCheckModal: (state, action: PayloadAction<ICheckModal>) => {
			state.checkModal = action.payload;
		},
		closeCheckModal: (state) => {
			state.checkModal = {
				id: null,
				show: null,
				text: null,
				buttonText: null,
				cbFunc: null,
				disable: null,
			};
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload.checkModal,
			};
		},
	},
});

export const selectCheckModal = (state: AppState) => state.checkModal;
