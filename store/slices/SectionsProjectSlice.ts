import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import db from '../../firebase';
import { ISection } from '../../types/sections';

interface SectionsProjctState {
	sectionsProject: ISection[];
	isLoading: boolean;
	error: string;
}

const initialState: SectionsProjctState = {
	sectionsProject: [],
	isLoading: false,
	error: '',
};

export const fetchSectionsProject = createAsyncThunk(
	'sectionsProject/fetchSectionsProject',
	async (ids: { projectId: string; userId: string }, thunkAPI) => {
		try {
			const q = query(
				collection(db, 'sections'),
				where('userId', '==', ids.userId),
				where('projectId', '==', ids.projectId),
				orderBy('order', 'asc')
			);
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
	}
);

export const sectionsProjectSlice = createSlice({
	name: 'sectionsProject',
	initialState,
	reducers: {
		setSectionsProject: (state, action: PayloadAction<ISection[]>) => {
			state.sectionsProject = action.payload;
			state.error = '';
		},
		setEmptysetSectionsProject: (state, action: PayloadAction<string>) => {
			state.sectionsProject = [] as ISection[];
			state.error = action.payload;
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload.sectionsProject,
			};
		},
		[fetchSectionsProject.fulfilled.type]: (state, action: PayloadAction<ISection[]>) => {
			state.isLoading = false;
			state.error = '';
			state.sectionsProject = action.payload;
		},
		[fetchSectionsProject.pending.type]: (state) => {
			state.isLoading = true;
		},
		[fetchSectionsProject.rejected.type]: (state, action: PayloadAction<string>) => {
			state.isLoading = false;
			state.error = action.payload;
		},
	},
});

export const selectSectionsProject = (state: AppState) => state.sectionsProject;
