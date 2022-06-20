import { fetchSlice } from './slices/FetchSlice';
import { projectsSlice } from './slices/ProjectsSlice';
import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { userSlice } from './slices/UserSlice';
import { projectSlice } from './slices/ProjectSlice';
import { tasksSlice } from './slices/TasksSlice';
import { tasksProjectSlice } from './slices/TasksProjectSlice';
import { sectionsSlice } from './slices/SectionsSlice';
import { sectionsProjectSlice } from './slices/SectionsProjectSlice';
import { contextModalSlice } from './slices/ContextModalSlice';
import { tooltipModalSlice } from './slices/TooltipModalSlice';
import { popupModalSlice } from './slices/PopupModalSlice';
import { toastModalSlice } from './slices/ToastModalSlice';
import { projectModalSlice } from './slices/ProjectModalSlice';
import { checkModalSlice } from './slices/CheckModalSlice';
import { taskModalSlice } from './slices/TaskModalSlice';
import { sectionEditModalSlice } from './slices/SectionEditModalSlice';
// import { singleTaskModalSlice } from './slices/SingleTaskModalSlice';
import { taskSlice } from './slices/TaskSlice';

export const makeStore = () =>
	configureStore({
		reducer: {
			[userSlice.name]: userSlice.reducer,
			[projectsSlice.name]: projectsSlice.reducer,
			[projectSlice.name]: projectSlice.reducer,
			[tasksSlice.name]: tasksSlice.reducer,
			[tasksProjectSlice.name]: tasksProjectSlice.reducer,
			[sectionsSlice.name]: sectionsSlice.reducer,
			[sectionsProjectSlice.name]: sectionsProjectSlice.reducer,
			// [singleTaskModalSlice.name]: singleTaskModalSlice.reducer,
			[fetchSlice.name]: fetchSlice.reducer,
			[contextModalSlice.name]: contextModalSlice.reducer,
			[tooltipModalSlice.name]: tooltipModalSlice.reducer,
			[popupModalSlice.name]: popupModalSlice.reducer,
			[toastModalSlice.name]: toastModalSlice.reducer,
			[projectModalSlice.name]: projectModalSlice.reducer,
			[checkModalSlice.name]: checkModalSlice.reducer,
			[taskModalSlice.name]: taskModalSlice.reducer,
			[sectionEditModalSlice.name]: sectionEditModalSlice.reducer,
			[taskSlice.name]: taskSlice.reducer,
		},
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({
				serializableCheck: false,
			}),
	});

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action>;

export const wrapper = createWrapper<AppStore>(makeStore);
