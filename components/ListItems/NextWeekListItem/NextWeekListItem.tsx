import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, MutableRefObject, useCallback } from 'react';
import cn from 'classnames';
import styles from './NextWeekListItem.module.scss';
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
import { ContentType, ModalType } from '../../../store/slices/ContextModalSlice';
import { selectTaskModal, taskModalSlice, TaskModalType, TaskModalTypeWhere } from '../../../store/slices/TaskModalSlice';
import { ISection } from '../../../types/sections';

interface NextWeekListItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement> {
	date: string;
	tasks?: ITask[];
}

const NextWeekListItem: FC<NextWeekListItemProps> = ({ date, tasks, className, ...props }) => {
	const { project } = useAppSelector(selectProject);
	const { projects } = useAppSelector(selectProjects);
	const { taskModal } = useAppSelector(selectTaskModal);
	const { listRef, refListItem } = useListItemsContext(ModalType.task, ContentType.defaultProjects);
	const dispatch = useAppDispatch();

	const openTaskModalAdd = useCallback(
		(project: IProject, section?: ISection, date?: number) => {
			dispatch(
				taskModalSlice.actions.setTaskModal({
					show: true,
					typeWhere: TaskModalTypeWhere.project,
					type: TaskModalType.add,
					taskName: '',
					taskDescription: '',
					projectId: project.id,
					projectDestination: project.id,
					sectionDestination: section?.id || '',
					projectName: project.projectName,
					projectColor: project.color,
					sectionName: section?.sectionName || '',
					sectionId: section?.id || '',
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
	const inboxProject = projects.find((item) => item.order === -1);

	const showTaskModal = useMemo(
		() =>
			taskModal.typeWhere === TaskModalTypeWhere.project &&
			taskModal.type === TaskModalType.add &&
			new Date(date).toDateString() === new Date(taskModal.endDate as number).toDateString() &&
			taskModal.show,

		[date, taskModal.endDate, taskModal.show, taskModal.type, taskModal.typeWhere]
	);

	const tasksD = useMemo(() => tasks && tasks?.length > 0, [tasks]);

	return (
		<li className={cn(className, styles.sectionListItem)} data-testid={''} {...props}>
			<section className={styles.sectionContent}>
				<header className={styles.sectionHeader}>
					<h2 className={styles.date}>
						{new Date(date).toLocaleDateString('ru', {
							day: '2-digit',
							month: 'long',
							weekday: 'long',
							year: 'numeric',
						})}
					</h2>
				</header>
				<div className={styles.sectionTasks}>
					<ul className={styles.tasksList} ref={listRef}>
						{tasksD &&
							tasks?.map((item) => (
								<TodaySectionTaskListItem
									key={item.id}
									task={item}
									ref={(el: HTMLLIElement) => {
										if (!refListItem?.current.includes(el) && el !== null) {
											return (refListItem as MutableRefObject<Array<HTMLLIElement | null>>).current.push(
												el
											);
										}
									}}
								/>
							))}
						<li className={styles.addTask}>
							{!showTaskModal ? (
								<SectionsAddTaskButton
									disable={project.isArchived}
									clickFn={() => openTaskModalAdd(inboxProject as IProject, undefined, dateToTime(date).dateMs)}
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

export default React.memo(NextWeekListItem);
