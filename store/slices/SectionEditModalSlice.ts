import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';

interface ISectionEditModal {
	id: string | null;
	show: boolean | null;
	type: SectionEditModalType | null;
	sectionName: string | null;
	projectId: string | null;
	userId: string | null;
	order: number | null;
}
export enum SectionEditModalType {
	add = 'add',
	edit = 'edit',
}

interface ModalsState {
	sectionEditModal: ISectionEditModal;
}

const initialState: ModalsState = {
	sectionEditModal: {
		id: null,
		show: null,
		type: null,
		sectionName: null,
		projectId: null,
		userId: null,
		order: null,
	},
};

export const sectionEditModalSlice = createSlice({
	name: 'sectionEditModal',
	initialState,
	reducers: {
		setSectionEditModal: (state, action: PayloadAction<ISectionEditModal>) => {
			state.sectionEditModal = action.payload;
		},
		setSectionEditModalName: (state, action: PayloadAction<string>) => {
			state.sectionEditModal.sectionName = action.payload;
		},
		closeSectionEditModal: (state) => {
			state.sectionEditModal = {
				id: null,
				show: null,
				type: null,
				sectionName: null,
				projectId: null,
				userId: null,
				order: null,
			};
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload.sectionEditModal,
			};
		},
	},
});

export const selectSectionEditModal = (state: AppState) => state.sectionEditModal;
