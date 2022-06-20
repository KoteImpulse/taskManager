import { doc, writeBatch } from 'firebase/firestore';
import { motion, Reorder, useDragControls } from 'framer-motion';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ActionButton from '../components/Buttons/ActionButton/ActionButton';
import TaskCheckboxButton from '../components/Buttons/TaskCheckboxButton/TaskCheckboxButton';
import ToastModal from '../components/Modals/ToastModal/ToastModal';
import TolltipModal from '../components/Modals/TolltipModal/TolltipModal';
import db from '../firebase';
import { uuid } from '../helpers/helpers';
import { useAppDispatch, useAppSelector } from '../hooks/reduxTK';
import { projectsSlice, selectProjects } from '../store/slices/ProjectsSlice';
import { IProject } from '../types/projects';
import * as Io from 'react-icons/io5';
import TaskActions from '../components/TaskActions/TaskActions';
import TaskListItem from '../components/ListItems/TaskListItem/TaskListItem';
import { selectTasks } from '../store/slices/TasksSlice';
import { useSections, useTasks } from '../hooks/firebaseData';
import SectionListItem from '../components/ListItems/SectionListItem/SectionListItem';
import SectionAddSectionButton from '../components/Buttons/SectionAddSectionButton/SectionAddSectionButton';

interface TestPageProps {}

const TestPage: NextPage<TestPageProps> = () => {
	const { projects } = useAppSelector(selectProjects);
	// const [isDrag, setIsDrag] = useState(false);
	// const [raplaced, setRaplaced] = useState(false);
	// const allProjects = useMemo(() => {
	// 	return projects.filter((item) => item.order >= 0 && !item.isArchived);
	// }, [projects]);

	// const dispatch = useAppDispatch();
	// const setNewOrder = useCallback(
	// 	(newOrder: IProject[]) => {
	// 		setRaplaced(true);
	// 		console.log('object');
	// dispatch(projectsSlice.actions.setAllProjects(newOrder));
	// 	},
	// 	[dispatch]
	// );
	// console.log(allProjects);

	// const controls = useDragControls();
	// const fetchDB = async () => {
	// 	if (isDrag && raplaced) {
	// 		const batch = writeBatch(db);
	// 		allProjects.map((item, index) => {
	// 			const projRef = doc(db, 'projects', item.id);
	// 			batch.update(projRef, { order: index });
	// 		});
	// 		await batch.commit();
	// 		setIsDrag(false);
	// 		setRaplaced(false);
	// 	}
	// };

	const { tasks } = useTasks();
	const { sections } = useSections();

	const [isArchived, setIsArchived] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const editTasktIcon = useMemo(() => <Io.IoPencilOutline />, []);
	const appointTaskDateIcon = useMemo(() => <Io.IoCalendarOutline />, []);
	const restIcon = useMemo(() => <Io.IoEllipsisHorizontalOutline />, []);
	const collapseIcon = useMemo(
		() => (isCollapsed ? <Io.IoChevronForwardOutline /> : <Io.IoChevronDownOutline />),
		[isCollapsed]
	);
	// const { tasks } = useAppSelector(selectTasks);


	return (
		<>
			<Head>
				<title>{'Страница для тестов'}</title>
				<meta name='description' content={`Страница для тестов  `} />
			</Head>
			<div>
				<ul style={{ display: 'flex', flexDirection: 'column' }}>
					{/* {newArray.map((item) => (
						<li key={item.parent + item.taskDescription}>{item.taskDescription}</li>
					))} */}
				</ul>
				{/* {sections.map((item) => {
					return <SectionListItem key={item.id} section={item} tasks={} withoutSection/>;
				})} */}

				{/* <Reorder.Group values={allProjects} onReorder={(newOrder: IProject[]) => setNewOrder(newOrder)} axis='y'>
					{allProjects.map((item) => (
						<Reorder.Item key={item.id} value={item}>
							<motion.div
								onPointerDown={(e) => {
									controls.start(e);
									setIsDrag(true);
								}}
								onPointerUp={() => fetchDB()}
							>
								<span style={{ color: 'blue' }}>{item.projectName}</span>
							</motion.div>
						</Reorder.Item>
					))}
				</Reorder.Group> */}
				<ToastModal />
				<TolltipModal />
			</div>
		</>
	);
};

export default TestPage;
