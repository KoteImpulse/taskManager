import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './TaskActions.module.scss';
import * as Io from 'react-icons/io5';
import ActionButton from '../Buttons/ActionButton/ActionButton';
import { ITask } from '../../types/task';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxTK';
import { selectSections } from '../../store/slices/SectionsSlice';
import { selectProject } from '../../store/slices/ProjectSlice';
import { popupModalSlice } from '../../store/slices/PopupModalSlice';
import { ContentType, contextModalSlice, ModalType } from '../../store/slices/ContextModalSlice';
import { ModalPopUpType, ModalPopUpTypeWhere } from '../../store/slices/PopupModalSlice';
import { ISection } from '../../types/sections';
import { taskModalSlice, TaskModalType, TaskModalTypeWhere } from '../../store/slices/TaskModalSlice';
import { tooltipModalSlice } from '../../store/slices/TooltipModalSlice';
import { doc, writeBatch } from 'firebase/firestore';
import db from '../../firebase';
import { selectTasks } from '../../store/slices/TasksSlice';

interface TaskActionsProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	task: ITask;
}

const TaskActions: FC<TaskActionsProps> = ({ task, className, ...props }) => {
	const dispatch = useAppDispatch();
	const { tasks } = useAppSelector(selectTasks);
	const { sections } = useAppSelector(selectSections);
	const { project } = useAppSelector(selectProject);

	const reorderTask = useCallback(
		async (task: ITask, type: 'up' | 'down') => {
			const batch = writeBatch(db);
			let taskOrder: number;
			let nextTaskOrder = task.order;
			let nextTask: ITask;
			const sameTasks = tasks.filter(
				(item) =>
					item.parentId === task.parentId &&
					item.projectId === task.projectId &&
					item.sectionId === task.sectionId &&
					item.level === task.level &&
					!item.isArchived
			);
			if (type === 'up') {
				nextTask = sameTasks?.find((item) => item.order === task.order - 1) as ITask;
			} else {
				nextTask = sameTasks?.find((item) => item.order === task.order + 1) as ITask;
			}
			if (nextTask) {
				taskOrder = nextTask.order;
				const taskRef = doc(db, 'tasks', task.id as string);
				batch.update(taskRef, {
					order: taskOrder,
				});
				const nextTaskRef = doc(db, 'tasks', nextTask.id as string);
				batch.update(nextTaskRef, {
					order: nextTaskOrder,
				});
			} else {
				return;
			}
			await batch.commit();
		},
		[tasks]
	);
	const openTaskModalAddSubTask = useCallback(
		(currentTask: ITask) => {
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			let lastChildId = currentTask.id;
			if (currentTask.parent && !currentTask.isCollapsed) {
				const children = tasks
					.filter((item) => item.parentId === currentTask.id && !item.isArchived)
					.sort((a, b) => a.order - b.order);
				if (children.length > 0) {
					lastChildId = children[children.length - 1]?.id;
				}
			}
			dispatch(
				taskModalSlice.actions.setTaskModal({
					show: true,
					whereOpen: TaskModalTypeWhere.down,
					typeWhere: TaskModalTypeWhere.subTask,
					type: TaskModalType.add,
					taskName: '',
					taskDescription: '',
					projectId: currentTask.projectId,
					projectDestination: currentTask.projectId,
					sectionDestination: currentTask.sectionId,
					projectName: currentTask.projectName,
					projectColor: currentTask.projectColor,
					sectionName: sections.find((item) => item.id === currentTask.sectionId)?.sectionName || '',
					sectionId: currentTask.sectionId,
					priority: 1,
					label: '',
					parentId: currentTask.id,
					parent: false,
					level: currentTask.level + 1,
					endDate: 0,
					upOrDownTaskId: lastChildId,
					id: currentTask.id,
					order: null,
					
				})
			);
		},
		[dispatch, sections, tasks]
	);
	const openTaskModalEdit = useCallback(
		(task: ITask, section?: ISection) => {
			dispatch(
				taskModalSlice.actions.setTaskModal({
					show: true,
					typeWhere: TaskModalTypeWhere.project,
					type: TaskModalType.edit,
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
	const openContextMenuModal = useCallback(
		(event: React.MouseEvent, id: string, modalType: ModalType, contentType: ContentType) => {
			event.stopPropagation();
			if (modalType) {
				dispatch(
					contextModalSlice.actions.setContextMenuModal({
						id: id,
						x: event.clientX,
						y: event.clientY,
						height: 0,
						width: 0,
						show: true,
						left: event.clientX,
						top: event.clientY + 15,
						modalType: modalType,
						contentType: contentType,
					})
				);
			}
		},
		[dispatch]
	);

	const editIcon = useMemo(() => <Io.IoPencilOutline />, []);
	const appointDateIcon = useMemo(() => <Io.IoCalendarOutline />, []);
	const restIcon = useMemo(() => <Io.IoEllipsisHorizontalOutline />, []);
	const subTaskIcon = useMemo(() => <Io.IoFileTrayStackedOutline />, []);
	const arrowDownIcon = useMemo(() => <Io.IoArrowDownOutline />, []);
	const arrowUpIcon = useMemo(() => <Io.IoArrowUpOutline />, []);

	const section = useMemo(() => {
		return sections.find((item) => item.id === task.sectionId);
	}, [sections, task.sectionId]);

	const contentType = useMemo(
		() =>
			task?.isArchived
				? ContentType.archived
				: project.order !== -2 && project.order !== -3
				? ContentType.standart
				: ContentType.defaultProjects,
		[project.order, task?.isArchived]
	);

	return (
		<div className={cn(className, styles.taskActions)} data-testid={''} {...props}>
			{!task.isArchived && (
				<>
					<ActionButton
						disable={false}
						ariaLabel='Изменить задачу'
						tooltipText={'Изменить задачу'}
						icon={editIcon}
						clickFn={() => openTaskModalEdit(task, section)}
					/>
					{task.level < 4 && project.order !== -2 && project.order !== -3 && (
						<ActionButton
							disable={false}
							ariaLabel='Добавить подзадачу'
							tooltipText={'Добавить подзадачу'}
							icon={subTaskIcon}
							clickFn={(e) => openTaskModalAddSubTask(task)}
						/>
					)}
					<ActionButton
						disable={false}
						ariaLabel='Назначить срок'
						tooltipText={'Назначить срок'}
						icon={appointDateIcon}
						clickFn={(e) =>
							openPopUpModal(e, task?.id as string, ModalPopUpType.dateSelect, ModalPopUpTypeWhere.quick)
						}
					/>
					{project.order !== -2 && project.order !== -3 && (
						<>
							<ActionButton
								ariaLabel={'Сменить порядок'}
								withTooltip={true}
								icon={arrowUpIcon}
								tooltipText={'Сменить порядок вверх'}
								disable={false}
								clickFn={(e) => reorderTask(task, 'up')}
								fontSize={14}
							/>
							<ActionButton
								ariaLabel={'Сменить порядок'}
								withTooltip={true}
								icon={arrowDownIcon}
								tooltipText={'Сменить порядок вниз'}
								disable={false}
								clickFn={(e) => reorderTask(task, 'down')}
								fontSize={14}
							/>
						</>
					)}
				</>
			)}
			<ActionButton
				disable={false}
				ariaLabel='Действия в задаче'
				tooltipText={'Действия в задаче'}
				icon={restIcon}
				clickFn={(e) => openContextMenuModal(e, task?.id as string, ModalType.task, contentType)}
			/>
		</div>
	);
};

export default React.memo(TaskActions);
