import { createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';

interface ModalsState {
	isLoadingHeader: boolean;
	isLoadingSidebar: boolean;
	error: string;
}

const initialState: ModalsState = {
	isLoadingHeader: false,
	isLoadingSidebar: false,
	error: '',
};

export const fetchSlice = createSlice({
	name: 'fetch',
	initialState,
	reducers: {
		setFetchHeaderStart: (state) => {
			state.isLoadingHeader = true;
		},
		setFetchHeaderEnd: (state) => {
			state.isLoadingHeader = false;
		},
		setFetchSidebarStart: (state) => {
			state.isLoadingSidebar = true;
		},
		setFetchSidebarEnd: (state) => {
			state.isLoadingSidebar = false;
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload,
			};
		},
	},
});

export const selectFetch = (state: AppState) => state.fetch;
