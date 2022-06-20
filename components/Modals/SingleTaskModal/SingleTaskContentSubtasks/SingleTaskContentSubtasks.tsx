import React, { FC, DetailedHTMLProps, HTMLAttributes, useState, useMemo, MutableRefObject, useCallback } from 'react';
import cn from 'classnames';
import styles from './SingleTaskContentSubtasks.module.scss';
import CollapseSingleTaskButton from '../../../Buttons/CollapseSngleTaskButton/CollapseSingleTaskButton';
import HideSingleTaskButton from '../../../Buttons/HideSingleTaskButton/HideSingleTaskButton';
import { useAppDispatch, useAppSelector } from '../../../../hooks/reduxTK';
import { selectTasksProject } from '../../../../store/slices/TasksProjectSlice';
import { selectTask } from '../../../../store/slices/TaskSlice';
import SubTaskListItem from '../../../ListItems/SubTaskListItem/SubTaskListItem';
import { useListItemsContext } from '../../../../hooks/modals';
import { ContentType, ModalType } from '../../../../store/slices/ContextModalSlice';
import SectionsAddTaskButton from '../../../Buttons/SectionAddTaskButton/SectionsAddTaskButton';
import { selectTaskModal, taskModalSlice, TaskModalType, TaskModalTypeWhere } from '../../../../store/slices/TaskModalSlice';
import { selectProject } from '../../../../store/slices/ProjectSlice';
import TaskForm from '../../../Forms/TaskForm/TaskForm';
import { selectSections } from '../../../../store/slices/SectionsSlice';

interface SingleTaskContentSubtasksProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const SingleTaskContentSubtasks: FC<SingleTaskContentSubtasksProps> = ({ className, ...props }) => {
	const [collapse, setCollapse] = useState(false);
	const [hide, setHide] = useState(false);
	const dispatch = useAppDispatch();
	const { project } = useAppSelector(selectProject);
	const { sections } = useAppSelector(selectSections);
	const { tasksProject } = useAppSelector(selectTasksProject);
	const { taskModal } = useAppSelector(selectTaskModal);
	const { task } = useAppSelector(selectTask);
	const { listRef, refListItem } = useListItemsContext(ModalType.taskModal, ContentType.standart);

	const newTasks = useMemo(() => {
		return hide
			? tasksProject
					.filter((item) => !item.isArchived && item.parentId === task.id)
					.sort((a, b) => {
						if (a.level < b.level) return -1;
						if (a.level > b.level) return 1;
						if (a.isArchived < b.isArchived) return -1;
						if (a.isArchived > b.isArchived) return 1;
						if (a.order < b.order) return -1;
						if (a.order > b.order) return 1;
						return 0;
					})
			: tasksProject
					.filter((item) => item.parentId === task.id)
					.sort((a, b) => {
						if (a.level < b.level) return -1;
						if (a.level > b.level) return 1;
						if (a.isArchived < b.isArchived) return -1;
						if (a.isArchived > b.isArchived) return 1;
						if (a.order < b.order) return -1;
						if (a.order > b.order) return 1;
						return 0;
					});
	}, [hide, task.id, tasksProject]);
	const tasksArr = useMemo(() => {
		const arr = tasksProject.filter((item) => item.parentId === task.id);
		return arr.every((item) => !item.isArchived);
	}, [task.id, tasksProject]);
	const subtasksArr = useMemo(() => {
		return tasksProject.filter((item) => item.parentId === task.id);
	}, [task.id, tasksProject]);
	const complitedSubtasksArr = useMemo(() => {
		return tasksProject.filter((item) => item.isArchived && item.parentId === task.id);
	}, [task.id, tasksProject]);
	const showTaskModal = useMemo(() => {
		return (
			taskModal.typeWhere === TaskModalTypeWhere.subTask &&
			taskModal.type === TaskModalType.taskModalAdd &&
			taskModal.show &&
			taskModal.sectionId === task.sectionId
		);
	}, [task.sectionId, taskModal.sectionId, taskModal.show, taskModal.type, taskModal.typeWhere]);
	const openTaskModalAddSubtask = useCallback(() => {
		let lastChildId = task.id;
		if (task.parent && !task.isCollapsed) {
			const children = tasksProject
				.filter((item) => item.parentId === task.id && !item.isArchived)
				.sort((a, b) => a.order - b.order);
			if (children.length > 0) {
				lastChildId = children[children.length - 1]?.id;
			}
		}
		dispatch(
			taskModalSlice.actions.setTaskModal({
				show: true,
				typeWhere: TaskModalTypeWhere.subTask,
				type: TaskModalType.taskModalAdd,
				taskName: '',
				taskDescription: '',
				projectId: task.projectId,
				projectDestination: task.projectId,
				sectionDestination: task.sectionId,
				projectName: task.projectName,
				projectColor: task.projectColor,
				sectionName: sections.find((item) => item.id === task.sectionId)?.sectionName || '',
				sectionId: task.sectionId,
				priority: 1,
				label: '',
				parentId: task.id,
				parent: false,
				level: task.level + 1,
				endDate: 0,
				upOrDownTaskId: lastChildId,
				id: task.id,
				order: null,
				whereOpen: TaskModalTypeWhere.down,
			})
		);
	}, [
		dispatch,
		sections,
		task.id,
		task.isCollapsed,
		task.level,
		task.parent,
		task.projectColor,
		task.projectId,
		task.projectName,
		task.sectionId,
		tasksProject,
	]);

	return (
		<div className={cn(className, styles.singleTaskContentSubtasks)} data-testid={''} {...props}>
			<div className={styles.buttons}>
				<div className={styles.buttonCollapse}>
					{subtasksArr && subtasksArr.length > 0 && (
						<CollapseSingleTaskButton
							isCollapsed={collapse}
							clickFn={() => setCollapse(!collapse)}
							subtasks={subtasksArr.length}
							complited={complitedSubtasksArr.length}
						/>
					)}
				</div>
				{!collapse && !tasksArr && (
					<div className={styles.buttonHide}>
						<HideSingleTaskButton isHided={hide} clickFn={() => setHide(!hide)} />
					</div>
				)}
			</div>
			{!collapse && (
				<div className={styles.tasks}>
					<ul className={styles.listItems} ref={listRef}>
						{newTasks &&
							newTasks.length > 0 &&
							newTasks.map((task) => (
								<SubTaskListItem
									key={task.id}
									className={styles.listItem}
									task={task}
									ref={(el: HTMLLIElement) => {
										if (!refListItem?.current.includes(el) && el !== null) {
											return (refListItem as MutableRefObject<Array<HTMLLIElement | null>>).current.push(
												el
											);
										}
									}}
								/>
							))}
						{task.level < 4 && !task.isArchived &&(
							<li className={styles.addTask}>
								{!showTaskModal ? (
									<SectionsAddTaskButton
										disable={false}
										clickFn={openTaskModalAddSubtask}
										text={`Добавить подзадачу`}
									/>
								) : (
									<div className={styles.addTaskForm}>
										<TaskForm />
									</div>
								)}
							</li>
						)}
					</ul>
				</div>
			)}
		</div>
	);
};

export default SingleTaskContentSubtasks;
