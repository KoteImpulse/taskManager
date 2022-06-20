import { IUser } from '../../types/user';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { AppState } from '..';
import { doc, getDoc } from 'firebase/firestore';
import db from '../../firebase';

interface UserState {
	user: IUser;
	isLoading: boolean;
	error: string;
}

const initialState: UserState = {
	user: {} as IUser,
	isLoading: false,
	error: '',
};

export const fetchUser = createAsyncThunk('user/fetchUser', async (userId: string, thunkAPI) => {
	try {
		const docRef = doc(db, 'users', userId);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists() && docSnap.id) {
			const result = {
				user: {
					uid: userId,
					theme: docSnap.data()?.theme,
					sidebarSize: docSnap.data()?.sidebarSize,
					startPage: docSnap.data()?.startPage,
					firstName: docSnap.data()?.firstName,
					lastName: docSnap.data()?.lastName,
					isFavOpen: docSnap.data()?.isFavOpen,
					isProjectsOpen: docSnap.data()?.isProjectsOpen,
					language: docSnap.data()?.language,
					isSidebarOpen: docSnap.data()?.isSidebarOpen,
					isArchivedOpen: docSnap.data()?.isArchivedOpen,
					numberOfProjects: docSnap.data()?.numberOfProjects,
					numberOfSectionsInProject: docSnap.data()?.numberOfSectionsInProject,
					numberOfTasksInSection: docSnap.data()?.numberOfTasksInSection,
				},
			};
			return result.user;
		} else {
			return thunkAPI.rejectWithValue('произошла ошибка загрузки профиля пользователя');
		}
	} catch (error) {
		return thunkAPI.rejectWithValue('произошла ошибка загрузки профиля пользователя');
	}
});

export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setEmptyUser: (state) => {
			state.user = {} as IUser;
			state.error = '';
			state.isLoading = false;
		},
	},
	extraReducers: {
		[HYDRATE]: (state, action) => {
			// console.log('HYDRATE', action.payload);
			return {
				...state,
				...action.payload.user,
			};
		},
		[fetchUser.fulfilled.type]: (state, action: PayloadAction<IUser>) => {
			state.isLoading = false;
			state.error = '';
			state.user = action.payload;
		},
		[fetchUser.pending.type]: (state) => {
			state.isLoading = true;
		},
		[fetchUser.rejected.type]: (state, action: PayloadAction<string>) => {
			state.isLoading = false;
			state.error = action.payload;
		},
	},
});

export const selectUser = (state: AppState) => state.user;
