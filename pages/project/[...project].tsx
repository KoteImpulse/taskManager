import Head from 'next/head';
import { useRouter } from 'next/router';
import { getLayout } from '../../layouts/MainLayout/MainLayout';
import { wrapper } from '../../store';
import { fetchProject } from '../../store/slices/ProjectSlice';
import { useProject, useSectionsProject, useTasksProject } from '../../hooks/firebaseData';
import { useAppDispatch } from '../../hooks/reduxTK';
import { useEffect } from 'react';
import ProjectHeader from '../../components/Headers/ProjectHeader/ProjectHeader';
import ProjectListBox from '../../components/ProjectListBox/ProjectListBox';
import { contextModalSlice } from '../../store/slices/ContextModalSlice';
import { popupModalSlice } from '../../store/slices/PopupModalSlice';
import { taskModalSlice } from '../../store/slices/TaskModalSlice';
import { sectionEditModalSlice } from '../../store/slices/SectionEditModalSlice';
import { projectModalSlice } from '../../store/slices/ProjectModalSlice';
import { fetchTasksProject } from '../../store/slices/TasksProjectSlice';
import { fetchSectionsProject } from '../../store/slices/SectionsProjectSlice';
import { fetchTask } from '../../store/slices/TaskSlice';

const ProjectPage = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { project, projectError, newProject } = useProject();
	const { tasksProject } = useTasksProject(newProject);
	const { sectionsProject } = useSectionsProject(newProject);
	useEffect(() => {
		dispatch(taskModalSlice.actions.closeTaskModal());
		dispatch(sectionEditModalSlice.actions.closeSectionEditModal());
		dispatch(popupModalSlice.actions.closePopUpModal());
		dispatch(contextModalSlice.actions.closeContextMenuModal());
		dispatch(projectModalSlice.actions.closeProjectModal());
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [project.id]);

	return (
		<>
			<Head>
				<title>
					{!!router.query.task
						? `${`Задача ${tasksProject.find((item) => item.id === router.query.task)?.taskName}`}`
						: `${project.order > -1 ? 'Проект ' : ''}${project.projectName ?? 'Проект не найден'}`}
				</title>
				<meta
					name='description'
					content={`${project.order > -1 ? 'Страница проекта ' : ''}${project.projectName ?? 'Проект не найден'}`}
				/>
			</Head>
			{project.userId ? (
				<>
					<ProjectHeader />
					<ProjectListBox />
				</>
			) : (
				<p>error</p>
			)}
		</>
	);
};

export const getServerSideProps = wrapper.getServerSideProps((store) => async (context: any): Promise<any> => {
	try {
		await store.dispatch(
			fetchProject({
				projectId: context.query.project[0],
				userId: context.req.cookies.userId,
			})
		);
		if (!!context.query.project[2]) {
			await store.dispatch(fetchTask(context.query.project[2]));
		}
		await store.dispatch(
			fetchTasksProject({
				projectId: context.query.project[0],
				userId: context.req.cookies.userId,
			})
		);
		await store.dispatch(
			fetchSectionsProject({
				projectId: context.query.project[0],
				userId: context.req.cookies.userId,
			})
		);
		return {
			props: {},
		};
	} catch (e) {
		console.log(e);
		return {
			props: {},
			notFound: true,
		};
	}
});

ProjectPage.getLayout = getLayout;

export default ProjectPage;
