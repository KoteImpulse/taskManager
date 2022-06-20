import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, MutableRefObject, useCallback } from 'react';
import cn from 'classnames';
import styles from './TodaySectionListItem.module.scss';
import { ITask } from '../../../types/task';
import SectionsAddTaskButton from '../../Buttons/SectionAddTaskButton/SectionsAddTaskButton';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { selectProject } from '../../../store/slices/ProjectSlice';
import TaskForm from '../../Forms/TaskForm/TaskForm';
import { useListItemsContext } from '../../../hooks/modals';
import { selectProjects } from '../../../store/slices/ProjectsSlice';
import { IProject } from '../../../types/projects';
import TodaySectionTaskListItem from '../TodaySectionTaskListItem/TodaySectionTaskListItem';
import { dateToTime } from '../../../helpers/helpers';
import { selectTaskModal, taskModalSlice, TaskModalType, TaskModalTypeWhere } from '../../../store/slices/TaskModalSlice';
import { ContentType, ModalType } from '../../../store/slices/ContextModalSlice';

interface TodaySectionListItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement> {
	tasks?: ITask[];
}

const TodaySectionListItem: FC<TodaySectionListItemProps> = ({ tasks, className, ...props }) => {
	const dispatch = useAppDispatch();
	const { project } = useAppSelector(selectProject);
	const { projects } = useAppSelector(selectProjects);
	const { taskModal } = useAppSelector(selectTaskModal);
	const { listRef, refListItem } = useListItemsContext(ModalType.task, ContentType.defaultProjects);
	const { listRef: listRef1, refListItem: refListItem1 } = useListItemsContext(ModalType.task, ContentType.defaultProjects);
	const inboxProject = projects.find((item) => item.order === -1);

	const showTaskModal = useMemo(
		() =>
			taskModal.typeWhere === TaskModalTypeWhere.project &&
			new Date().toDateString() === new Date(taskModal.endDate as number).toDateString() &&
			taskModal.type === TaskModalType.add &&
			taskModal.show &&
			taskModal.sectionId === '',

		[taskModal.endDate, taskModal.sectionId, taskModal.show, taskModal.type, taskModal.typeWhere]
	);

	const tasksD = useMemo(() => tasks && tasks?.length > 0, [tasks]);
	const oldTasks = useMemo(() => tasks?.filter((item) => item.endDate < dateToTime(new Date()).dateMs), [tasks]);

	const openTaskModalAdd = useCallback(
		(project: IProject, date?: number) => {
			dispatch(
				taskModalSlice.actions.setTaskModal({
					show: true,
					typeWhere: TaskModalTypeWhere.project,
					type: TaskModalType.add,
					taskName: '',
					taskDescription: '',
					projectId: project.id,
					projectDestination: project.id,
					sectionDestination: '',
					projectName: project.projectName,
					projectColor: project.color,
					sectionName: '',
					sectionId: '',
					priority: 1,
					label: '',
					parentId: '',
					parent: false,
					level: 1,
					endDate: date ? date : 0,
					upOrDownTaskId: null,
					id: null,
					order: null,
					whereOpen: null,
				})
			);
		},
		[dispatch]
	);

	return (
		<li className={cn(className, styles.sectionListItem)} data-testid={''} {...props}>
			<section className={styles.sectionContent}>
				<div className={styles.sectionTasks}>
					{oldTasks && oldTasks.length > 0 && (
						<>
							<h2 className={styles.header}>Просрочено:</h2>
							<ul className={styles.tasksList} ref={listRef1}>
								{tasksD &&
									tasks
										?.filter((item) => item.endDate < dateToTime(new Date()).dateMs)
										.map((item) => (
											<TodaySectionTaskListItem
												key={item.id}
												task={item}
												ref={(el: HTMLLIElement) => {
													if (!refListItem1?.current.includes(el) && el !== null) {
														return (
															refListItem1 as MutableRefObject<Array<HTMLLIElement | null>>
														).current.push(el);
													}
												}}
											/>
										))}
							</ul>
						</>
					)}
					<h2 className={styles.header}>Сегодня:</h2>
					<ul className={styles.tasksList} ref={listRef}>
						{tasksD &&
							tasks
								?.filter((item) => item.endDate === dateToTime(new Date()).dateMs)
								.map((item) => (
									<TodaySectionTaskListItem
										key={item.id}
										task={item}
										ref={(el: HTMLLIElement) => {
											if (!refListItem?.current.includes(el) && el !== null) {
												return (
													refListItem as MutableRefObject<Array<HTMLLIElement | null>>
												).current.push(el);
											}
										}}
									/>
								))}
						<li className={styles.addTask}>
							{!showTaskModal ? (
								<SectionsAddTaskButton
									disable={project.isArchived}
									clickFn={() => openTaskModalAdd(inboxProject as IProject, dateToTime(new Date()).dateMs)}
									text={`Добавить задачу`}
								/>
							) : (
								<div className={styles.addTaskForm}>
									<TaskForm />
								</div>
							)}
						</li>
					</ul>
				</div>
			</section>
		</li>
	);
};

export default React.memo(TodaySectionListItem);
