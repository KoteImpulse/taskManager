import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './TaskForm.module.scss';
import TaskModalInput from '../../Inputs/TaskModalInput/TaskModalInput';
import TaskModalDateButton from '../../Buttons/TaskModalDateButton/TaskModalDateButton';
import TaskModalProjectButton from '../../Buttons/TaskModalProjectButton/TaskModalProjectButton';
import ActionButton from '../../Buttons/ActionButton/ActionButton';
import { IoFlag, IoPricetagOutline } from 'react-icons/io5';
import ProjectModalButton from '../../Buttons/ProjectModalButton/ProjectModalButton';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { addDoc, doc, writeBatch, collection, serverTimestamp } from 'firebase/firestore';
import { ModalPopUpType, ModalPopUpTypeWhere, popupModalSlice } from '../../../store/slices/PopupModalSlice';
import { selectTaskModal, taskModalSlice, TaskModalType, TaskModalTypeWhere } from '../../../store/slices/TaskModalSlice';
import db from '../../../firebase';
import { selectUser } from '../../../store/slices/UserSlice';
import { selectTasks } from '../../../store/slices/TasksSlice';
import { ITask } from '../../../types/task';
import { toastModalSlice } from '../../../store/slices/ToastModalSlice';

interface TaskFormProps extends DetailedHTMLProps<HTMLAttributes<HTMLFormElement>, HTMLFormElement> {}

const TaskForm: FC<TaskFormProps> = ({ className, ...props }) => {
	const dispatch = useAppDispatch();
	const { user } = useAppSelector(selectUser);
	const { tasks } = useAppSelector(selectTasks);
	const { taskModal } = useAppSelector(selectTaskModal);
	const buttonText = useMemo(
		() =>
			taskModal.type === TaskModalType.add || taskModal.type === TaskModalType.taskModalAdd
				? `Добавить задачу`
				: `Сохранить`,
		[taskModal.type]
	);
	const labelIcon = useMemo(() => <IoPricetagOutline />, []);
	const priorityIcon = useMemo(() => <IoFlag />, []);
	const disableButton = useMemo(() => {
		return !taskModal.taskName || taskModal.taskName.trim().length < 1;
	}, [taskModal.taskName]);

	const taskType = useMemo(
		() => (taskModal.type === TaskModalType.add ? ModalPopUpTypeWhere.add : ModalPopUpTypeWhere.edit),
		[taskModal.type]
	);

	const openPopUpModal = useCallback(
		(event: React.MouseEvent, id: string, modalType: ModalPopUpType, modalTypeWhere: ModalPopUpTypeWhere) => {
			event.stopPropagation();
			if (modalType) {
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
			}
		},
		[dispatch]
	);
	const closeTaskModal = useCallback(() => dispatch(taskModalSlice.actions.closeTaskModal()), [dispatch]);

	const submitTaskModal = useCallback(
		async (e: React.FormEvent, sectionDestinationId: string, projectDestinationId: string) => {
			e.preventDefault();
			dispatch(taskModalSlice.actions.closeTaskModal());
			const batch = writeBatch(db);
			const tasksInSec = tasks
				.filter(
					(item) =>
						!item.isArchived &&
						item.sectionId === sectionDestinationId &&
						item.projectId === projectDestinationId &&
						item.level === 1
				)
				.sort((a, b) => a.order - b.order);
			const tasksSameLvlnotArch = (task: ITask) =>
				tasks.filter(
					(item) =>
						item.projectId === task.projectId &&
						item.level === task.level &&
						item.sectionId === task.sectionId &&
						item.parentId === task.parentId &&
						!item.isArchived
				);
			const addBatchUpdate = (arr: ITask[], newLvl: number) => {
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const taskRef = doc(db, 'tasks', el.id);
					batch.update(taskRef, {
						sectionId: sectionDestinationId,
						projectId: projectDestinationId,
						projectName: taskModal.projectName,
						projectColor: taskModal.projectColor,
						level: newLvl,
					});
					if (el.parent) {
						const children = tasks.filter((item) => item.parentId === el.id);
						addBatchUpdate(children, (newLvl += 1));
					}
				}
			};

			try {
				if (taskModal.type === TaskModalType.add || taskModal.type === TaskModalType.taskModalAdd) {
					const currentTask = tasks.find((item) => item.id === taskModal.id);
					let order = tasksInSec[tasksInSec.length - 1]?.order + 1 || 1;
					let level = taskModal.level;
					let parentId = taskModal.parentId;
					let nextTasks = [] as ITask[];
					let hidden = false;
					if (
						taskModal.projectDestination !== taskModal.projectId ||
						taskModal.sectionDestination !== taskModal.sectionId
					) {
						level = 1;
						parentId = '';
					} else {
						if (taskModal.typeWhere === TaskModalTypeWhere.up) {
							order = (currentTask as ITask).order;
							nextTasks = tasksSameLvlnotArch(currentTask as ITask).filter(
								(item) => item.order >= (currentTask as ITask).order
							);
							hidden = (currentTask as ITask).hidden;
						} else if (taskModal.typeWhere === TaskModalTypeWhere.down) {
							order = (currentTask as ITask).order + 1;
							nextTasks = tasksSameLvlnotArch(currentTask as ITask).filter(
								(item) => item.order > (currentTask as ITask).order
							);
							hidden = (currentTask as ITask).hidden;
						} else if (taskModal.typeWhere === TaskModalTypeWhere.subTask) {
							if (currentTask?.level === 4) return;
							if (currentTask?.isCollapsed && currentTask?.parent) {
								hidden = true;
							}
							if (currentTask?.parent) {
								const children = tasks
									.filter((item) => item.parentId === currentTask.id && !item.isArchived)
									.sort((a, b) => a.order - b.order);
								order = children[children.length - 1]?.order + 1 || 1;
							} else {
								order = 1;
								const laRef = doc(db, 'tasks', currentTask?.id as string);
								batch.update(laRef, { parent: true });
							}
						}
						if (nextTasks.length > 0) {
							for (let i = 0; i < nextTasks.length; i++) {
								const el = nextTasks[i];
								const laRef = doc(db, 'tasks', el.id);
								batch.update(laRef, { order: el.order + 1 });
							}
						}
					}
					await addDoc(collection(db, 'tasks'), {
						parentId: parentId,
						order: order,
						level: level,
						parent: taskModal.parent,
						taskDescription: taskModal.taskDescription,
						date: serverTimestamp(),
						isArchived: false,
						userId: user.uid,
						taskName: taskModal.taskName,
						sectionId: taskModal.sectionDestination,
						projectId: taskModal.projectDestination,
						isDeleted: false,
						label: taskModal.label,
						projectColor: taskModal.projectColor,
						projectName: taskModal.projectName,
						endDate: taskModal.endDate,
						priority: taskModal.priority,
						isCollapsed: false,
						hidden: hidden,
					});
					await batch.commit();
				} else {
					const taskRef = doc(db, 'tasks', taskModal.id as string);
					let order: number;
					let level: number;
					let parentId: string;
					if (
						taskModal.projectDestination === taskModal.projectId &&
						taskModal.sectionDestination === taskModal.sectionId
					) {
						batch.update(taskRef, {
							taskName: taskModal.taskName,
							taskDescription: taskModal.taskDescription,
							endDate: taskModal.endDate,
							priority: taskModal.priority,
							label: taskModal.label,
						});
					} else {
						order = tasksInSec[tasksInSec.length - 1]?.order + 1 || 1;
						const task = tasks.find((item) => item.id === taskModal.id);
						const nextTasks = tasksSameLvlnotArch(task as ITask).filter((item) => item.order > (task as ITask).order);
						if (nextTasks.length > 0) {
							for (let i = 0; i < nextTasks.length; i++) {
								const el = nextTasks[i];
								const laRef = doc(db, 'tasks', el.id);
								batch.update(laRef, { order: el.order - 1 });
							}
						}
						level = 1;
						parentId = '';
						batch.update(taskRef, {
							taskName: taskModal.taskName,
							taskDescription: taskModal.taskDescription,
							sectionId: taskModal.sectionDestination,
							projectId: taskModal.projectDestination,
							projectName: taskModal.projectName,
							projectColor: taskModal.projectColor,
							endDate: taskModal.endDate,
							priority: taskModal.priority,
							label: taskModal.label,
							level,
							parentId,
							order,
						});
						if (taskModal.parentId !== '') {
							const parent = tasks.find((item) => item.id === taskModal.parentId);
							const children = tasks.filter((item) => item.parentId === parent?.id);
							if (children.length === 1) {
								const laRef = doc(db, 'tasks', parent?.id as string);
								batch.update(laRef, { parent: false });
							}
						}
						if (taskModal.parent) {
							const children = tasks.filter((item) => item.parentId === taskModal.id);
							let newLevel = 2;
							addBatchUpdate(children, newLevel);
						}
					}
					await batch.commit();
				}
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			}
		},
		[
			dispatch,
			taskModal.endDate,
			taskModal.id,
			taskModal.label,
			taskModal.level,
			taskModal.parent,
			taskModal.parentId,
			taskModal.priority,
			taskModal.projectColor,
			taskModal.projectDestination,
			taskModal.projectId,
			taskModal.projectName,
			taskModal.sectionDestination,
			taskModal.sectionId,
			taskModal.taskDescription,
			taskModal.taskName,
			taskModal.type,
			taskModal.typeWhere,
			tasks,
			user.uid,
		]
	);

	return (
		<form
			className={cn(className, styles.taskForm, {
				[styles.modal]: taskModal.typeWhere === TaskModalTypeWhere.quick,
				[styles.project]: taskModal.typeWhere !== TaskModalTypeWhere.quick,
			})}
			data-testid={''}
			{...props}
			onSubmit={(e) => submitTaskModal(e, taskModal?.sectionDestination || '', taskModal?.projectDestination || '')}
		>
			<section className={styles.content}>
				<div className={styles.textInputs}>
					<TaskModalInput
						value={taskModal.taskName || ''}
						setValue={taskModalSlice.actions.setTaskModalName}
						labelFor={'taskName'}
						labelText={`Название задачи`}
						maxLength={500}
						disable={false}
					/>
					<TaskModalInput
						value={taskModal.taskDescription || ''}
						setValue={taskModalSlice.actions.setTaskModalDesc}
						labelFor={'taskDesc'}
						labelText={`Описание задачи`}
						maxLength={2000}
						disable={false}
					/>
				</div>
				<div className={styles.buttonsBlock}>
					<div className={styles.leftControls}>
						<TaskModalDateButton
							clickFn={(e) => openPopUpModal(e, taskModal?.id as string, ModalPopUpType.dateSelect, taskType)}
							endDate={taskModal.endDate as number}
						/>
						<TaskModalProjectButton
							clickFn={(e) => openPopUpModal(e, taskModal?.id as string, ModalPopUpType.projectSelect, taskType)}
							projectName={taskModal.projectName as string}
							projectDestination={taskModal.projectDestination as string}
							sectionName={taskModal.sectionName as string}
							projectColor={taskModal.projectColor as string}
						/>
					</div>
					<div className={styles.rightControls}>
						<ActionButton
							ariaLabel='Задать приоритет'
							icon={priorityIcon}
							className={styles.priorityButton}
							disable={false}
							tooltipText={'Задать приоритет'}
							fontSize={20}
							withTooltip={true}
							data-priority={taskModal.priority}
							clickFn={(e) => openPopUpModal(e, taskModal?.id as string, ModalPopUpType.prioritySelect, taskType)}
						/>
					</div>
				</div>
			</section>
			<footer className={styles.buttons}>
				<ProjectModalButton
					typeButton={'button'}
					ariaLabel={`Отмена`}
					textButton={`Отмена`}
					clickFn={closeTaskModal}
					disable={false}
				/>
				<ProjectModalButton
					typeButton={'submit'}
					ariaLabel={buttonText}
					textButton={buttonText}
					disable={disableButton}
				/>
			</footer>
		</form>
	);
};

export default React.memo(TaskForm);
