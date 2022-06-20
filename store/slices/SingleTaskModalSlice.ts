import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { HYDRATE } from 'next-redux-wrapper';
// import { AppState } from '..';

// interface ISingleTaskModal {
// 	show: boolean | null;
// }

// interface ModalsState {
// 	singleTaskModal: ISingleTaskModal;
// }

// const initialState: ModalsState = {
// 	singleTaskModal: {
// 		show: null,
// 	},
// };

// export const singleTaskModalSlice = createSlice({
// 	name: 'singleTaskModal',
// 	initialState,
// 	reducers: {
// 		setSingleTaskModal: (state, action: PayloadAction<ISingleTaskModal>) => {
// 			state.singleTaskModal = action.payload;
// 		},

// 		closeSingleTaskModal: (state) => {
// 			state.singleTaskModal = {
// 				show: null,
// 			};
// 		},
// 	},
// 	extraReducers: {
// 		[HYDRATE]: (state, action) => {
// 			console.log('HYDRATE', action.payload);
// 			return {
// 				...state,
// 				...action.payload.singleTaskModal,
// 			};
// 		},
// 	},
// });

// export const selectSingleTaskModal = (state: AppState) => state.singleTaskModal;
