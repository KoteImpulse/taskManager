import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import db from '../firebase';
import { fetchProject, projectSlice, selectProject } from '../store/slices/ProjectSlice';
import { fetchProjects, selectProjects } from '../store/slices/ProjectsSlice';
import { sectionsProjectSlice, selectSectionsProject } from '../store/slices/SectionsProjectSlice';
import { fetchSections, selectSections } from '../store/slices/SectionsSlice';
import { fetchTask, selectTask, taskSlice } from '../store/slices/TaskSlice';
import { selectTasksProject, tasksProjectSlice } from '../store/slices/TasksProjectSlice';
import { fetchTasks, selectTasks } from '../store/slices/TasksSlice';
import { fetchUser, selectUser } from '../store/slices/UserSlice';
import { IProject } from '../types/projects';
import { ITask } from '../types/task';
import { useAppDispatch, useAppSelector } from './reduxTK';

export const useProject = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { project, error: projectError } = useAppSelector(selectProject);
	const { projects, error: projectsError } = useAppSelector(selectProjects);
	const { user } = useAppSelector(selectUser);

	const newProject = projects.find((item) => router.query.project && item.id === router.query.project[0]);

	useEffect(() => {
		if (!newProject) return;
		if (JSON.stringify(project) !== JSON.stringify(newProject)) {
			dispatch(projectSlice.actions.setProject(newProject as IProject));
		}
	}, [router.query, newProject, project, dispatch]);

	useEffect(() => {
		if (!newProject) return;
		if (!router.query.project) return;
		const unsubscribeProject = onSnapshot(
			doc(db, 'projects', router.query.project[0]),
			async (doc) => {
				await dispatch(
					fetchProject({
						projectId: doc.id,
						userId: user.uid,
					})
				);
			},
			(error) => {
				console.log(error);
			}
		);
		return () => unsubscribeProject();
	}, []);

	return { project, projectError, newProject };
};

export const useProjects = () => {
	const dispatch = useAppDispatch();
	const { projects, error: projectsError } = useAppSelector(selectProjects);
	const { user } = useAppSelector(selectUser);

	useEffect(() => {
		const q = query(collection(db, 'projects'), where('userId', '==', user.uid));
		const unsubscribeProjects = onSnapshot(q, async () => {
			await dispatch(fetchProjects(user.uid));
		});

		return () => unsubscribeProjects();
	}, []);

	return { projects, projectsError };
};

export const useSections = () => {
	const dispatch = useAppDispatch();
	const { sections, error: sectionsError } = useAppSelector(selectSections);
	const { user } = useAppSelector(selectUser);
	useEffect(() => {
		const q = query(collection(db, 'sections'), where('userId', '==', user.uid));
		const unsubscribeSections = onSnapshot(q, async () => {
			await dispatch(fetchSections(user.uid));
		});

		return () => unsubscribeSections();
	}, []);

	return { sections, sectionsError };
};

export const useTasks = () => {
	const dispatch = useAppDispatch();
	const { tasks, error: tasksError } = useAppSelector(selectTasks);
	const { user } = useAppSelector(selectUser);

	useEffect(() => {
		const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
		const unsubscribeTasks = onSnapshot(q, async () => {
			await dispatch(fetchTasks(user.uid));
		});

		return () => unsubscribeTasks();
	}, []);

	return { tasks, tasksError };
};

export const useTasksProject = (newProject: IProject | undefined) => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { tasks, error: tasksError } = useAppSelector(selectTasks);
	const { tasksProject, error: tasksProjectError } = useAppSelector(selectTasksProject);
	let newTasks: ITask[];

	if (newProject?.order === -2) {
		newTasks = tasks
			.filter((item) => {
				return new Date(item.endDate).toDateString() === new Date().toDateString();
			})
			?.sort((a, b) => b.endDate - a.endDate);
	} else if (newProject?.order === -3) {
		newTasks = tasks
			.filter(
				(item) =>
					item.endDate > 0 &&
					item.endDate - new Date().getTime() <= 1000 * 60 * 60 * 24 * 7 &&
					item.endDate - new Date().getTime() >= 0
			)
			?.sort((a, b) => b.endDate - a.endDate);
	} else {
		newTasks = tasks
			.filter((item) => router.query.project && item.projectId === router.query.project[0])
			.sort((a, b) => a.level - b.level);
	}

	useEffect(() => {
		if (newTasks) {
			if (JSON.stringify(tasksProject) !== JSON.stringify(newTasks)) {
				dispatch(tasksProjectSlice.actions.setTasksProject(newTasks));
			}
		} else {
			dispatch(
				tasksProjectSlice.actions.setEmptyTasksProject(
					`Задачи для проекта ${router.query.project && router.query.project[0]} не найдены`
				)
			);
		}
	}, [router.query.project, tasks]);

	return { tasksProject, tasksProjectError, newTasks };
};

export const useSectionsProject = (newProject: IProject | undefined) => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { sections, error: sectionsError } = useAppSelector(selectSections);
	const { sectionsProject, error: sectionsProjectError } = useAppSelector(selectSectionsProject);
	const newSections = sections.filter((item) => router.query.project && item.projectId === router.query.project[0]);

	useEffect(() => {
		if (newSections) {
			if (JSON.stringify(sectionsProject) !== JSON.stringify(newSections)) {
				dispatch(sectionsProjectSlice.actions.setSectionsProject(newSections));
			}
		} else {
			dispatch(
				sectionsProjectSlice.actions.setEmptysetSectionsProject(
					`Секции для проекта ${router.query.project && router.query.project[0]} не найдены`
				)
			);
		}
	}, [dispatch, newSections, router.query.project, sections, sectionsProject]);

	return { sectionsProject, sectionsProjectError, newSections };
};

export const useUserData = () => {
	const dispatch = useAppDispatch();
	const { user } = useAppSelector(selectUser);

	useEffect(() => {
		if (!user.uid) return;
		const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), async (doc) => {
			await dispatch(fetchUser(user.uid));
		});

		return () => unsubscribeUser();
	}, []);

	return { user };
};

export const useSingleTaskData = () => {
	const dispatch = useAppDispatch();
	const { task } = useAppSelector(selectTask);

	useEffect(() => {
		if (!task.id) return;
		const unsubscribeTask = onSnapshot(doc(db, 'tasks', task.id), async (doc) => {
			// if (doc.exists()) {
			// 	dispatch(
			// 		taskSlice.actions.setSingleTask({
			// 			parentId: doc.data()?.parentId,
			// 			parent: doc.data()?.parent,
			// 			order: doc.data()?.order,
			// 			taskDescription: doc.data()?.taskDescription,
			// 			date: doc.data()?.date.toDate().getTime(),
			// 			isArchived: doc.data()?.isArchived,
			// 			userId: doc.data()?.userId,
			// 			taskName: doc.data()?.taskName,
			// 			sectionId: doc.data()?.sectionId,
			// 			projectId: doc.data()?.projectId,
			// 			isDeleted: doc.data()?.isDeleted,
			// 			id: doc.id,
			// 			level: doc.data()?.level,
			// 			label: doc.data()?.label,
			// 			projectColor: doc.data()?.projectColor,
			// 			projectName: doc.data()?.projectName,
			// 			endDate: doc.data()?.endDate,
			// 			priority: doc.data()?.priority,
			// 			isCollapsed: doc.data()?.isCollapsed,
			// 			hidden: doc.data()?.hidden,
			// 		})
			// 	);
			// }
			await dispatch(fetchTask(task.id));
		});

		return () => unsubscribeTask();
	}, [task.id]);

	return { task };
};
