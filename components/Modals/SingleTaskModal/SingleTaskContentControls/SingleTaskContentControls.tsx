import React, { FC, DetailedHTMLProps, HTMLAttributes, useCallback, useMemo } from 'react';
import cn from 'classnames';
import styles from './SingleTaskContentControls.module.scss';
import { useAppDispatch, useAppSelector } from '../../../../hooks/reduxTK';
import { selectTask } from '../../../../store/slices/TaskSlice';
import { ModalPopUpType, ModalPopUpTypeWhere, popupModalSlice } from '../../../../store/slices/PopupModalSlice';
import TaskModalProjectButton from '../../../Buttons/TaskModalProjectButton/TaskModalProjectButton';
import { selectSections } from '../../../../store/slices/SectionsSlice';
import TaskModalDateButton from '../../../Buttons/TaskModalDateButton/TaskModalDateButton';
import ActionButton from '../../../Buttons/ActionButton/ActionButton';
import { IoFlag, IoTrashOutline } from 'react-icons/io5';
import { ITask } from '../../../../types/task';
import { tooltipModalSlice } from '../../../../store/slices/TooltipModalSlice';
import { contextModalSlice } from '../../../../store/slices/ContextModalSlice';
import { toastModalSlice } from '../../../../store/slices/ToastModalSlice';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import db from '../../../../firebase';
import { checkModalSlice } from '../../../../store/slices/CheckModalSlice';
import { selectTasks } from '../../../../store/slices/TasksSlice';
import { useRouter } from 'next/router';

interface SingleTaskContentControlsProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const SingleTaskContentControls: FC<SingleTaskContentControlsProps> = ({ className, ...props }) => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { task } = useAppSelector(selectTask);
	const { tasks } = useAppSelector(selectTasks);
	const { sections } = useAppSelector(selectSections);
	const currentSection = useMemo(() => sections.find((item) => item.id === task.sectionId), [sections, task.sectionId]);

	const priorityIcon = useMemo(() => <IoFlag />, []);
	const deleteIcon = useMemo(() => <IoTrashOutline />, []);
	const openPopUpModal = useCallback(
		(event: React.MouseEvent, id: string, modalType: ModalPopUpType, modalTypeWhere: ModalPopUpTypeWhere) => {
			event.stopPropagation();
			dispatch(
				popupModalSlice.actions.setPopUpModal({
					id: id,
					x: event.clientX,
					y: event.clientY,
					height: 0,
					width: 0,
					show: true,
					left: event.clientX,
					top: event.clientY + 15,
					modalType,
					modalTypeWhere,
				})
			);
		},
		[dispatch]
	);
	const arr = useMemo(() => [1, 2, 3, 4], []);
	const setPriorityTask = useCallback(
		async (task: ITask, priority: number) => {
			dispatch(popupModalSlice.actions.closePopUpModal());
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			dispatch(tooltipModalSlice.actions.closeTooltipModal());
			try {
				const laRef = doc(db, 'tasks', task.id);
				await updateDoc(laRef, { priority });
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			}
		},
		[dispatch]
	);
	const clickPriorituItem = useCallback((priority: number) => setPriorityTask(task, priority), [setPriorityTask, task]);

	const openCheckModal = useCallback(
		(event: React.MouseEvent, text: string, buttonText: string, cbFunc: () => Promise<void>) => {
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			event.stopPropagation();
			dispatch(
				checkModalSlice.actions.setCheckModal({
					show: true,
					text,
					buttonText,
					cbFunc,
					id: null,
					disable: null,
				})
			);
		},
		[dispatch]
	);

	const deleteTask = useCallback(
		async (task: ITask) => {
			const batch = writeBatch(db);
			const tasksSameLvlNotArch = (task: ITask) =>
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
			const addBatchDelete = (arr: ITask[] | ITask[]) => {
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const laRef = doc(db, 'tasks', el.id);
					batch.delete(laRef);
					if (el.parent) {
						const children = tasks.filter((item) => item.projectId === el.projectId && item.parentId === el.id);
						addBatchDelete(children);
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
			try {
				router.push(`/project/[...project]?project=${task.projectId}`, `/project/${task.projectId}`, {
					shallow: true,
				});
				const sectionInTasks = tasks.filter((item) => item.sectionId === task.sectionId);
				const taskRef = doc(db, 'tasks', task.id);
				batch.delete(taskRef);
				if (task.parent) {
					addBatchDelete(sectionInTasks.filter((item) => item.parentId === task.id));
				}
				let nextTasks: ITask[];
				if (task.isArchived) {
					nextTasks = tasksSameLvlArch(task).filter((item) => item.order > task.order);
				} else {
					nextTasks = tasksSameLvlNotArch(task).filter((item) => item.order > task.order);
				}
				if (nextTasks.length > 0) {
					addBatchUpdate(nextTasks);
				}
				if (task.parentId !== '') {
					const parent = tasks.find((item) => item.id === task.parentId);
					const children = tasks.filter((item) => item.parentId === parent?.id);
					if (children.length <= 1) {
						const taskRef = doc(db, 'tasks', parent?.id as string);
						batch.update(taskRef, { parent: false });
					}
				}
				await batch.commit();
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			} finally {
				dispatch(checkModalSlice.actions.closeCheckModal());
			}
		},
		[dispatch, router, tasks]
	);
	return (
		<div className={cn(className, styles.singleTaskContentControls)} data-testid={''} {...props}>
			<div className={styles.controls}>
				<div className={styles.item}>
					<span className={styles.text}>Проект</span>
					<TaskModalProjectButton
						projectName={task.projectName}
						projectDestination={task.projectId}
						sectionName={currentSection?.sectionName || ''}
						projectColor={task.projectColor}
						clickFn={(e) =>
							openPopUpModal(e, task?.id as string, ModalPopUpType.projectSelect, ModalPopUpTypeWhere.quick)
						}
					/>
				</div>
				<div className={styles.item}>
					<span className={styles.text}>Срок выполнения</span>
					<TaskModalDateButton
						endDate={task.endDate}
						clickFn={(e) =>
							openPopUpModal(e, task?.id as string, ModalPopUpType.dateSelect, ModalPopUpTypeWhere.quick)
						}
					/>
				</div>
				<div className={styles.priority}>
					<span className={styles.text}>Задать приоритет</span>
					<div className={styles.buttons}>
						{arr.map((item) => (
							<ActionButton
								key={item}
								ariaLabel='Задать приоритет'
								icon={priorityIcon}
								className={cn(styles.priorityButton, {
									[styles.active]: task.priority === item,
								})}
								disable={false}
								tooltipText={`Задать приоритет ${item}`}
								fontSize={20}
								withTooltip={true}
								data-priority={item}
								clickFn={() => clickPriorituItem(item)}
							/>
						))}
					</div>
				</div>
				<div className={styles.item}>
					<span className={styles.text}>Удалить задачу</span>
					<ActionButton
						ariaLabel={`Удалить задачу  ${task.taskName}`}
						icon={deleteIcon}
						disable={false}
						tooltipText={`Удалить задачу`}
						fontSize={20}
						withTooltip={true}
						clickFn={(e) => openCheckModal(e, `Удалить задачу?`, 'Удалить', () => deleteTask(task as ITask))}
					/>
				</div>
				<div className={styles.alarm}></div>
			</div>
		</div>
	);
};

export default SingleTaskContentControls;
