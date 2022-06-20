import React, { DetailedHTMLProps, HTMLAttributes, useMemo, ForwardedRef, forwardRef, useCallback } from 'react';
import cn from 'classnames';
import styles from './TodaySectionTaskListItem.module.scss';
import { ITask } from '../../../types/task';
import TaskCheckboxButton from '../../Buttons/TaskCheckboxButton/TaskCheckboxButton';
import TaskActions from '../../TaskActions/TaskActions';
import TaskForm from '../../Forms/TaskForm/TaskForm';
import TaskInfo from '../../TaskInfo/TaskInfo';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { selectProject } from '../../../store/slices/ProjectSlice';
import { selectTasks } from '../../../store/slices/TasksSlice';
import { useRouter } from 'next/router';
import { dateToTime } from '../../../helpers/helpers';
import { selectTaskModal, TaskModalType } from '../../../store/slices/TaskModalSlice';
import { toastModalSlice } from '../../../store/slices/ToastModalSlice';
import { doc, writeBatch } from 'firebase/firestore';
import db from '../../../firebase';
import { selectSections } from '../../../store/slices/SectionsSlice';
import { taskSlice } from '../../../store/slices/TaskSlice';

interface TodaySectionTaskListItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement> {
	task: ITask;
}

const TodaySectionTaskListItem = (
	{ task, className, ...props }: TodaySectionTaskListItemProps,
	ref: ForwardedRef<HTMLLIElement>
): JSX.Element => {
	const { taskModal } = useAppSelector(selectTaskModal);
	const { tasks } = useAppSelector(selectTasks);
	const { project } = useAppSelector(selectProject);
	const dispatch = useAppDispatch();
	const { sections } = useAppSelector(selectSections);
	const router = useRouter();

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
	}, [dispatch, sections, task, tasks]);

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
						<TaskCheckboxButton
							priority={task.priority}
							disable={project.isArchived}
							isArchived={task.isArchived}
							clickFn={archiveTask}
						/>
					</div>
					<div className={styles.content}  onClick={(e) => clickHandler(e)}>
						<div className={styles.wrapper}>
							<span className={cn(styles.nameText, { [styles.archived]: task.isArchived })}>{task.taskName}</span>
							{task.taskDescription && <span className={styles.descriptionText}>{task.taskDescription}</span>}
						</div>
						{dateToTime(task.endDate).dateMs < dateToTime(new Date()).dateMs && !task.isArchived && (
							<TaskInfo task={task} />
						)}
						<div className={styles.projectName}>
							<div
								className={styles.textContainer}
								onClick={() => router.push(`/project/${task.projectId}`, undefined, { shallow: true })}
							>
								<span className={styles.text}>{task.projectName}</span>
							</div>
							<div className={styles.dotContainer}>
								<span className={styles.dot} style={{ backgroundColor: task.projectColor }} />
							</div>
						</div>
					</div>
					<TaskActions task={task} className={styles.taskActions} />
				</>
			) : (
				<div className={styles.editTaskForm}>
					<TaskForm />
				</div>
			)}
		</li>
	);
};

export default React.memo(forwardRef(TodaySectionTaskListItem));
