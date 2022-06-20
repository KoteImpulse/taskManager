import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import db from '../../firebase';
import { ISection } from '../../types/sections';

interface SectionsState {
	sections: ISection[];
	isLoading: boolean;
	error: string;
}

const initialState: SectionsState = {
	sections: [],
	isLoading: false,
	error: '',
};

export const fetchSections = createAsyncThunk('sections/fetchSections', async (userId: string, thunkAPI) => {
	try {
		const q = query(collection(db, 'sections'), where('userId', '==', userId), orderBy('order', 'asc'));
		const querySnapshot = await getDocs(q);
		const sections = querySnapshot.docs.map((doc) => ({
			id: doc.id,
			isCollapsed: doc.data().isCollapsed,
			isArchived: doc.data().isArchived,
			isDeleted: doc.data().isDeleted,
			sectionName: doc.data().sectionName,
			order: doc.data().order,
			projectId: doc.data().projectId,
			userId: doc.data().userId,
		}));
		return sections;
	} catch (error) {
		return thunkAPI.rejectWithValue('произошла ошибка загрузки списка секций');
	}
});

export const sectionsSlice = createSlice({
	name: 'sections',
	initialState,
	reducers: {},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload.sections,
			};
		},
		[fetchSections.fulfilled.type]: (state, action: PayloadAction<ISection[]>) => {
			state.isLoading = false;
			state.error = '';
			state.sections = action.payload;
		},
		[fetchSections.pending.type]: (state) => {
			state.isLoading = true;
		},
		[fetchSections.rejected.type]: (state, action: PayloadAction<string>) => {
			state.isLoading = false;
			state.error = action.payload;
		},
	},
});

export const selectSections = (state: AppState) => state.sections;
