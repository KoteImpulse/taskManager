import React, { DetailedHTMLProps, HTMLAttributes, useMemo, ForwardedRef, forwardRef, useCallback } from 'react';
import cn from 'classnames';
import styles from './TaskListItem.module.scss';
import { ITask } from '../../../types/task';
import ActionButton from '../../Buttons/ActionButton/ActionButton';
import * as Io from 'react-icons/io5';
import TaskCheckboxButton from '../../Buttons/TaskCheckboxButton/TaskCheckboxButton';
import TaskActions from '../../TaskActions/TaskActions';
import TaskForm from '../../Forms/TaskForm/TaskForm';
import TaskInfo from '../../TaskInfo/TaskInfo';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { selectProject } from '../../../store/slices/ProjectSlice';
import { selectTasks } from '../../../store/slices/TasksSlice';
import { selectTaskModal, TaskModalType, TaskModalTypeWhere } from '../../../store/slices/TaskModalSlice';
import { selectSections } from '../../../store/slices/SectionsSlice';
import { toastModalSlice } from '../../../store/slices/ToastModalSlice';
import { doc, writeBatch } from 'firebase/firestore';
import db from '../../../firebase';
import { checkModalSlice } from '../../../store/slices/CheckModalSlice';
import { ISection } from '../../../types/sections';
import { useRouter } from 'next/router';
import { taskSlice } from '../../../store/slices/TaskSlice';

interface TaskListItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement> {
	task: ITask;
}

const TaskListItem = ({ task, className, ...props }: TaskListItemProps, ref: ForwardedRef<HTMLLIElement>): JSX.Element => {
	const dispatch = useAppDispatch();
	const { sections } = useAppSelector(selectSections);
	const { tasks } = useAppSelector(selectTasks);
	const { project } = useAppSelector(selectProject);
	const { taskModal } = useAppSelector(selectTaskModal);

	const ariaLabelText = useMemo(() => (task?.isCollapsed ? 'Разввернуть список' : 'Свернуть список'), [task?.isCollapsed]);
	const collapseIcon = useMemo(
		() => (task.isCollapsed ? <Io.IoChevronForwardOutline /> : <Io.IoChevronDownOutline />),
		[task.isCollapsed]
	);
	const taskChildernIsArchived = useMemo(() => {
		if (task.parent) {
			const children = tasks.filter((item) => item.parentId === task.id && !item.isArchived);
			return children?.every((item) => item.isArchived);
		}
	}, [task.id, task.parent, tasks]);

	const taskShow = useMemo(
		() => taskModal.show && taskModal.type === TaskModalType.edit && task.id === taskModal.id,
		[task.id, taskModal.id, taskModal.show, taskModal.type]
	);
	const taskUp = useMemo(
		() =>
			!project.isArchived &&
			taskModal.whereOpen === TaskModalTypeWhere.up &&
			taskModal.type === TaskModalType.add &&
			taskModal.show &&
			taskModal.upOrDownTaskId === task.id,
		[project.isArchived, task.id, taskModal.show, taskModal.type, taskModal.upOrDownTaskId, taskModal.whereOpen]
	);
	const taskDown = useMemo(
		() =>
			!project.isArchived &&
			taskModal.whereOpen === TaskModalTypeWhere.down &&
			taskModal.type === TaskModalType.add &&
			taskModal.show &&
			taskModal.upOrDownTaskId === task.id,
		[project.isArchived, task.id, taskModal.show, taskModal.type, taskModal.upOrDownTaskId, taskModal.whereOpen]
	);
	const changeCollapsed = useCallback(
		async (task: ITask) => {
			const batch = writeBatch(db);
			const reqArr = (arr: ITask[], value: boolean) => {
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const taskRef = doc(db, 'tasks', el.id);
					batch.update(taskRef, { hidden: value });
					if (el.parent) {
						const childrenArr = tasks.filter((item) => item.projectId === el.projectId && item.parentId === el.id);
						if (!el.isCollapsed) {
							reqArr(childrenArr, value);
						}
					}
				}
			};
			try {
				const taskRef = doc(db, 'tasks', task.id);
				if (task.parent) {
					const childrenArr = tasks.filter((item) => item.projectId === task.projectId && item.parentId === task.id);
					const value = task.isCollapsed ? false : true;
					reqArr(childrenArr, value);
				}
				batch.update(taskRef, { isCollapsed: task.isCollapsed ? false : true });
				await batch.commit();
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			}
		},
		[dispatch, tasks]
	);
	const archiveSection = useCallback(
		async (selectedSection: ISection) => {
			const batch = writeBatch(db);
			const addBatch = (arr: ITask[]) => {
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const laRef = doc(db, 'tasks', el.id);
					batch.update(laRef, { isArchived: true });
				}
			};
			const addBatchUpdate = (arr: ISection[]) => {
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const laRef = doc(db, 'sections', el.id);
					batch.update(laRef, { order: el.order - 1 });
				}
			};
			try {
				const sectionTasks = tasks.filter((item) => item.sectionId === selectedSection.id);
				const sectionRef = doc(db, 'sections', selectedSection.id);
				const archivedSections = sections.filter(
					(item) => item.projectId === selectedSection.projectId && item.isArchived
				);
				const notArchivedSections = sections.filter(
					(item) => item.projectId === selectedSection.projectId && !item.isArchived
				);
				let order = 1;
				let isArchived: boolean;
				let nextSections: ISection[];
				if (!selectedSection.isArchived) {
					addBatch(sectionTasks);
					nextSections = notArchivedSections.filter((item) => item.order > selectedSection.order);
					order = archivedSections?.length + 1;
					isArchived = true;
				} else {
					nextSections = archivedSections.filter((item) => item.order > selectedSection.order);
					order = notArchivedSections?.length + 1;
					isArchived = false;
				}
				if (nextSections.length > 0) {
					addBatchUpdate(nextSections);
				}
				batch.update(sectionRef, {
					isArchived: isArchived,
					order: order,
				});
				await batch.commit();
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			} finally {
				dispatch(checkModalSlice.actions.closeCheckModal());
				dispatch(
					toastModalSlice.actions.setToastModalWarning(
						selectedSection.isArchived
							? `Радел ${selectedSection.sectionName} разархивирован`
							: `Радел ${selectedSection.sectionName} добавлен в архив`
					)
				);
			}
		},
		[dispatch, sections, tasks]
	);
	const archiveTask = useCallback(async () => {
		const batch = writeBatch(db);
		const tasksSameLvlnotArch = (task: ITask) =>
			tasks.filter(
				(item) =>
					item.projectId === task.projectId &&
					item.level === task.level &&
					item.sectionId === task.sectionId &&
					item.parentId === task.parentId &&
					!item.isArchived
			);
		const tasksSameLvlArch = (task: ITask) =>
			tasks.filter(
				(item) =>
					item.projectId === task.projectId &&
					item.level === task.level &&
					item.sectionId === task.sectionId &&
					item.parentId === task.parentId &&
					item.isArchived
			);
		const reqArr = (arr: ITask[]) => {
			for (let i = 0; i < arr.length; i++) {
				const el = arr[i];
				const taskRef = doc(db, 'tasks', el.id);
				batch.update(taskRef, { isArchived: true });
				if (el.parent) {
					const childrenArr = tasks.filter((item) => item.parentId === el.id);
					reqArr(childrenArr);
				}
			}
		};
		const addBatchUpdate = (arr: ITask[]) => {
			for (let i = 0; i < arr.length; i++) {
				const el = arr[i];
				const laRef = doc(db, 'tasks', el.id);
				batch.update(laRef, { order: el.order - 1 });
			}
		};
		const reqParent = (task: ITask) => {
			const taskRef = doc(db, 'tasks', task.id);
			let nextTasks: ITask[];
			let order: number;
			let isArchived = false;
			if (task.parentId !== '') {
				const parent = tasks.find((item) => item.id === task.parentId);
				nextTasks = tasksSameLvlArch(task).filter((item) => item.order > task.order);
				order = tasksSameLvlnotArch(task).length + 1;
				if (parent?.isArchived) {
					reqParent(parent as ITask);
					batch.update(taskRef, { isArchived, order });
				} else {
					if (task.isArchived) {
						batch.update(taskRef, { isArchived, order });
					}
				}
				if (nextTasks) {
					addBatchUpdate(nextTasks);
				}
			} else {
				if (task.isArchived) {
					nextTasks = tasksSameLvlArch(task).filter((item) => item.order > task.order);
					order = tasksSameLvlnotArch(task).length + 1;
					batch.update(taskRef, { isArchived, order });
					if (nextTasks) {
						addBatchUpdate(nextTasks);
					}
				}
			}
		};

		try {
			const taskRef = doc(db, 'tasks', task.id);
			const section = sections.find((item) => item.id === task.sectionId);
			if (task.isArchived && task.sectionId !== '' && section?.isArchived) {
				archiveSection(section);
			}
			let nextTasks: ITask[];
			let order: number;
			let isArchived: boolean;
			if (task.parent && !task.isArchived) {
				const childrenArr = tasks.filter((item) => item.projectId === task.projectId && item.parentId === task.id);
				nextTasks = tasksSameLvlnotArch(task).filter((item) => item.order > task.order);
				reqArr(childrenArr);
				order = tasksSameLvlArch(task).length + 1;
				isArchived = true;
			} else if (task.parentId !== '' && task.isArchived) {
				const parent = tasks.find((item) => item.projectId === task.projectId && item.id === task.parentId);
				nextTasks = tasksSameLvlArch(task).filter((item) => item.order > task.order);
				reqParent(parent as ITask);
				order = tasksSameLvlnotArch(task).length + 1;
				isArchived = false;
			} else {
				if (task.isArchived) {
					nextTasks = tasksSameLvlArch(task).filter((item) => item.order > task.order);
					order = tasksSameLvlnotArch(task).length + 1;
					isArchived = false;
				} else {
					nextTasks = tasksSameLvlnotArch(task).filter((item) => item.order > task.order);
					order = tasksSameLvlArch(task).length + 1;
					isArchived = true;
				}
			}
			batch.update(taskRef, { isArchived, order });
			if (nextTasks.length > 0) {
				addBatchUpdate(nextTasks);
			}
			await batch.commit();
		} catch (e) {
			console.log(e);
			dispatch(toastModalSlice.actions.setToastModalError());
		} finally {
		}
	}, [archiveSection, dispatch, sections, task, tasks]);
	const router = useRouter();

	const clickHandler = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			if (project.isArchived) return;
			dispatch(taskSlice.actions.setSingleTask({ ...task }));
			router.push(
				`/project/[...project]?project=${router.query.project && router.query.project[0]}&task=${task.id}`,
				`/project/${router.query.project && router.query.project[0]}/task/${task.id}`,
				{
					shallow: true,
				}
			);
		},
		[dispatch, project.isArchived, router, task]
	);

	return (
		<>
			{taskUp && (
				<li className={cn(className, styles.taskListItem)} data-level={taskModal.level}>
					<div className={styles.editTaskForm}>
						<TaskForm />
					</div>
				</li>
			)}
			<li
				className={cn(className, styles.taskListItem, {
					[styles.notParent]: !task.parent,
					[styles.hiddenTasks]: taskChildernIsArchived && !project.showArchivedTasks,
					[styles.archivedProject]: project.isArchived,
				})}
				data-testid={''}
				{...props}
				data-level={task.level}
				id={task.id}
				ref={ref}
			>
				{!taskShow ? (
					<>
						<div className={styles.buttons}>
							{!project.isArchived && project.showArchivedTasks
								? task.parent && (
										<ActionButton
											ariaLabel={ariaLabelText}
											withTooltip={false}
											icon={collapseIcon}
											disable={project.isArchived}
											clickFn={(e) => changeCollapsed(task)}
											fontSize={14}
										/>
								  )
								: task.parent &&
								  !taskChildernIsArchived && (
										<ActionButton
											ariaLabel={ariaLabelText}
											withTooltip={false}
											icon={collapseIcon}
											disable={project.isArchived}
											clickFn={(e) => changeCollapsed(task)}
											fontSize={14}
										/>
								  )}
							<TaskCheckboxButton
								priority={task.priority}
								disable={project.isArchived}
								isArchived={task.isArchived}
								clickFn={archiveTask}
							/>
						</div>
						<div className={styles.content} onClick={(e) => clickHandler(e)}>
							<div className={styles.wrapper}>
								<span className={cn(styles.nameText, { [styles.archived]: task.isArchived })}>
									{task.taskName}
								</span>
								{task.taskDescription && <span className={styles.descriptionText}>{task.taskDescription}</span>}
							</div>
							{!project.isArchived && <TaskInfo task={task} />}
						</div>
						{!project.isArchived && <TaskActions task={task} className={styles.taskActions} />}
					</>
				) : (
					<div className={styles.editTaskForm}>
						<TaskForm />
					</div>
				)}
			</li>
			{taskDown && (
				<li className={cn(className, styles.taskListItem)} data-level={taskModal.level}>
					<div className={styles.editTaskForm}>
						<TaskForm />
					</div>
				</li>
			)}
		</>
	);
};

export default React.memo(forwardRef(TaskListItem));
