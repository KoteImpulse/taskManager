import React, { DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './SingleTaskItem.module.scss';
import { ITask } from '../../../types/task';
import TaskCheckboxButton from '../../Buttons/TaskCheckboxButton/TaskCheckboxButton';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { selectProject } from '../../../store/slices/ProjectSlice';
import { selectTaskModal, taskModalSlice, TaskModalType, TaskModalTypeWhere } from '../../../store/slices/TaskModalSlice';
import { tooltipModalSlice } from '../../../store/slices/TooltipModalSlice';
import SingleTaskForm from '../../Forms/SingleTaskForm/SingleTaskForm';
import { selectTask } from '../../../store/slices/TaskSlice';
import { ISection } from '../../../types/sections';
import { useRouter } from 'next/router';
import { doc, writeBatch } from 'firebase/firestore';
import db from '../../../firebase';
import { selectSections } from '../../../store/slices/SectionsSlice';
import { selectTasks } from '../../../store/slices/TasksSlice';
import { toastModalSlice } from '../../../store/slices/ToastModalSlice';

interface SingleTaskItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const SingleTaskItem = ({ className, ...props }: SingleTaskItemProps): JSX.Element => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { task } = useAppSelector(selectTask);
	const { project } = useAppSelector(selectProject);
	const { taskModal } = useAppSelector(selectTaskModal);
	const { sections } = useAppSelector(selectSections);
	const { tasks } = useAppSelector(selectTasks);

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
	const archiveTask = useCallback(
		async (task: ITask) => {
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
		},
		[archiveSection, dispatch, sections, tasks]
	);

	const openTaskModalEdit = useCallback(
		(task: ITask, section?: ISection) => {
			dispatch(
				taskModalSlice.actions.setTaskModal({
					show: true,
					typeWhere: TaskModalTypeWhere.taskModal,
					type: TaskModalType.taskModalEdit,
					taskName: task.taskName,
					taskDescription: task.taskDescription,
					projectId: task.projectId,
					projectDestination: task.projectId,
					sectionDestination: task.sectionId,
					projectName: task.projectName,
					projectColor: task.projectColor,
					sectionName: section?.sectionName || '',
					sectionId: task.sectionId,
					priority: task.priority,
					label: task.label,
					parentId: task.parentId,
					parent: task.parent,
					level: task.level,
					endDate: task.endDate,
					id: task.id,
					order: task.order,
					whereOpen: null,
					upOrDownTaskId: null,
				})
			);
			dispatch(tooltipModalSlice.actions.closeTooltipModal());
		},
		[dispatch]
	);
	const taskShow = useMemo(
		() =>
			taskModal.show &&
			taskModal.type === TaskModalType.taskModalEdit &&
			taskModal.typeWhere === TaskModalTypeWhere.taskModal &&
			task.id === taskModal.id &&
			!task.isArchived,
		[task.id, task.isArchived, taskModal.id, taskModal.show, taskModal.type, taskModal.typeWhere]
	);

	return (
		<div className={cn(className, styles.singleTaskItem)} data-testid={''} {...props} id={task.id}>
			{!taskShow ? (
				<>
					<div className={styles.buttons}>
						<TaskCheckboxButton
							priority={task.priority}
							disable={project.isArchived}
							isArchived={task.isArchived}
							clickFn={() => archiveTask(task)}
						/>
					</div>
					<div className={styles.content}>
						<div className={styles.wrapper}>
							<span
								className={cn(styles.nameText, {
									[styles.archived]: task.isArchived,
								})}
								onClick={() => openTaskModalEdit(task)}
							>
								{task.taskName}
							</span>
							{task.taskDescription && (
								<span
									className={cn(styles.descriptionText, {
										[styles.archived]: task.isArchived,
									})}
									onClick={() => openTaskModalEdit(task)}
								>
									{task.taskDescription}
								</span>
							)}
						</div>
					</div>
				</>
			) : (
				<div className={styles.editTaskForm}>
					<SingleTaskForm />
				</div>
			)}
		</div>
	);
};

export default React.memo(SingleTaskItem);
