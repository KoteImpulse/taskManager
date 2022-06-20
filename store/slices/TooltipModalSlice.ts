import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';

interface ITooltipModal {
	show: boolean | null;
	text: string | null;
	height: number | null;
	width: number | null;
	x: number | null;
	y: number | null;
	left: number | null;
	top: number | null;
}

interface TooltipModalState {
	tooltipModal: ITooltipModal;
}

const initialState: TooltipModalState = {
	tooltipModal: {
		show: null,
		text: null,
		height: null,
		width: null,
		x: null,
		y: null,
		left: null,
		top: null,
	},
};

export const tooltipModalSlice = createSlice({
	name: 'tooltipModal',
	initialState,
	reducers: {
		setTooltipModal: (state, action: PayloadAction<ITooltipModal>) => {
			state.tooltipModal = action.payload;
		},
		setTooltipModalText: (state, action: PayloadAction<string>) => {
			state.tooltipModal.text = action.payload;
		},
		closeTooltipModal: (state) => {
			state.tooltipModal = {
				show: null,
				text: null,
				height: null,
				width: null,
				x: null,
				y: null,
				left: null,
				top: null,
			};
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload.tooltipModal,
			};
		},
	},
});

export const selectTooltipModal = (state: AppState) => state.tooltipModal;
