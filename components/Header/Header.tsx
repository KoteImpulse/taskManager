import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './Header.module.scss';
import * as Io from 'react-icons/io5';
import HeaderButton from '../Buttons/HeaderButton/HeaderButton';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxTK';
import { selectProject } from '../../store/slices/ProjectSlice';
import { selectUser } from '../../store/slices/UserSlice';
import { doc, updateDoc } from 'firebase/firestore';
import db from '../../firebase';
import { tooltipModalSlice } from '../../store/slices/TooltipModalSlice';
import { toastModalSlice } from '../../store/slices/ToastModalSlice';
import { taskModalSlice, TaskModalType, TaskModalTypeWhere } from '../../store/slices/TaskModalSlice';
import { selectProjects } from '../../store/slices/ProjectsSlice';
import { dateToTime } from '../../helpers/helpers';

interface HeaderProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const Header: FC<HeaderProps> = ({ className, ...props }) => {
	const dispatch = useAppDispatch();
	const { user } = useAppSelector(selectUser);
	const { project } = useAppSelector(selectProject);
	const { projects } = useAppSelector(selectProjects);
	const router = useRouter();

	const changeTheme = useCallback(async () => {
		dispatch(tooltipModalSlice.actions.closeTooltipModal());
		try {
			const userRef = doc(db, 'users', user?.uid);
			await updateDoc(userRef, { theme: user.theme === 'dark' ? 'light' : 'dark' });
		} catch (e) {
			console.log(e);
			dispatch(toastModalSlice.actions.setToastModalError());
		}
	}, [dispatch, user.theme, user?.uid]);

	const changeSidebarState = useCallback(async () => {
		dispatch(tooltipModalSlice.actions.closeTooltipModal());
		try {
			const userRef = doc(db, 'users', user?.uid);
			await updateDoc(userRef, { isSidebarOpen: user.isSidebarOpen === true ? false : true });
		} catch (e) {
			console.log(e);
			dispatch(toastModalSlice.actions.setToastModalError());
		}
	}, [dispatch, user.isSidebarOpen, user?.uid]);
	const homeProject = useMemo(() => projects.find((item) => item.order === -2)?.id, [projects]);
	const homePage = useCallback(() => {
		dispatch(tooltipModalSlice.actions.closeTooltipModal());
		router.push(`/project/${homeProject}`, undefined, { shallow: true });
	}, [dispatch, homeProject, router]);
	const logout = useCallback(() => {
		dispatch(tooltipModalSlice.actions.closeTooltipModal());
		router.push(`/auth`, undefined, { shallow: true });
	}, [dispatch, router]);
	const addToProject = useMemo(() => {
		if (project.order === -2 || project.order === -3) {
			return projects.find((item) => item.order === -1);
		} else {
			return project;
		}
	}, [project, projects]);
	const dateEndOfTask = useMemo(() => {
		if (project.order === -2 || project.order === -3) {
			return dateToTime(new Date()).dateMs;
		} else {
			return 0;
		}
	}, [project]);

	const addTast = useCallback(() => {
		dispatch(tooltipModalSlice.actions.closeTooltipModal());
		dispatch(
			taskModalSlice.actions.setTaskModal({
				show: true,
				typeWhere: TaskModalTypeWhere.quick,
				type: TaskModalType.add,
				taskName: '',
				taskDescription: '',
				projectId: addToProject?.id as string,
				projectDestination: addToProject?.id as string,
				sectionDestination: '',
				projectName: addToProject?.projectName as string,
				projectColor: addToProject?.color as string,
				sectionName: '',
				sectionId: '',
				priority: 1,
				label: '',
				parentId: '',
				parent: false,
				level: 1,
				endDate: dateEndOfTask,
				upOrDownTaskId: null,
				id: null,
				order: null,
				whereOpen: null,
			})
		);
	}, [addToProject?.color, addToProject?.id, addToProject?.projectName, dateEndOfTask, dispatch]);

	const menuIcon = useMemo(() => {
		return <Io.IoMenuOutline />;
	}, []);
	const homeIcon = useMemo(() => {
		return <Io.IoHomeOutline />;
	}, []);
	const addTaskIcon = useMemo(() => {
		return <Io.IoAddOutline />;
	}, []);
	const logoutIcon = useMemo(() => {
		return <Io.IoPersonOutline />;
	}, []);
	const themeIcon = useMemo(() => {
		return user.theme === 'dark' ? <Io.IoSunnyOutline /> : <Io.IoMoonOutline />;
	}, [user.theme]);
	const sidebarText = useMemo(() => {
		return user.isSidebarOpen === true ? 'Закрыть сайдбар' : 'Открыть сайдбар';
	}, [user.isSidebarOpen]);
	const themeText = useMemo(() => {
		return user.theme === 'dark' ? 'Светлая тема' : 'Темная тема';
	}, [user.theme]);

	return (
		<div className={cn(className, styles.header)} data-testid={''} {...props}>
			<div className={styles.leftControl}>
				<HeaderButton
					clickFn={() => changeSidebarState()}
					icon={menuIcon}
					ariaLabel={sidebarText}
					text={sidebarText}
					disable={false}
				/>
				<HeaderButton clickFn={homePage} icon={homeIcon} ariaLabel={`На главную`} text={`На главную`} disable={false} />
			</div>
			<div className={styles.rightControl}>
				<HeaderButton
					clickFn={() => addTast()}
					icon={addTaskIcon}
					ariaLabel={`Добавить задачу`}
					text={`Добавить задачу`}
					disable={project.userId ? false : true}
				/>
				<HeaderButton
					clickFn={() => changeTheme()}
					icon={themeIcon}
					ariaLabel={themeText}
					text={themeText}
					disable={false}
					fontSize={24}
				/>
				<HeaderButton clickFn={logout} icon={logoutIcon} ariaLabel={`Выйти`} text={`Выйти`} disable={false} />
			</div>
		</div>
	);
};

export default React.memo(Header);
