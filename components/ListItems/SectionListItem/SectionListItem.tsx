import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, MutableRefObject, useCallback } from 'react';
import cn from 'classnames';
import styles from './SectionListItem.module.scss';
import { ITask } from '../../../types/task';
import SectionsAddTaskButton from '../../Buttons/SectionAddTaskButton/SectionsAddTaskButton';
import SectionAddSectionButton from '../../Buttons/SectionAddSectionButton/SectionAddSectionButton';
import { ISection } from '../../../types/sections';
import TaskListItem from '../TaskListItem/TaskListItem';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { selectProject } from '../../../store/slices/ProjectSlice';
import TaskForm from '../../Forms/TaskForm/TaskForm';
import SectionForm from '../../Forms/SectionForm/SectionForm';
import SectionHeader from '../../Headers/SectionHeader/SectionHeader';
import { useListItemsContext } from '../../../hooks/modals';
import { ContentType, ModalType } from '../../../store/slices/ContextModalSlice';
import { sectionEditModalSlice, SectionEditModalType, selectSectionEditModal } from '../../../store/slices/SectionEditModalSlice';
import { selectTaskModal, taskModalSlice, TaskModalType, TaskModalTypeWhere } from '../../../store/slices/TaskModalSlice';
import { selectUser } from '../../../store/slices/UserSlice';

interface SectionListItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement> {
	section?: ISection;
	tasks?: ITask[];
	empty?: boolean;
}

const SectionListItem: FC<SectionListItemProps> = ({ empty, section, tasks, className, ...props }) => {
	const dispatch = useAppDispatch();
	const { project } = useAppSelector(selectProject);
	const { user } = useAppSelector(selectUser);
	const { sectionEditModal } = useAppSelector(selectSectionEditModal);
	const { taskModal } = useAppSelector(selectTaskModal);
	const { listRef, refListItem } = useListItemsContext(ModalType.task, ContentType.standart);

	const openSectionEditModalAdd = useCallback(
		(event: React.MouseEvent, projectId: string, sectionId: string) => {
			event.stopPropagation();
			dispatch(
				sectionEditModalSlice.actions.setSectionEditModal({
					...sectionEditModal,
					id: sectionId,
					show: true,
					type: SectionEditModalType.add,
					sectionName: '',
					projectId: projectId,
					userId: user.uid,
				})
			);
		},
		[dispatch, sectionEditModal, user.uid]
	);
	const openTaskModalAdd = useCallback(() => {
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
				endDate: 0,
				upOrDownTaskId: null,
				id: null,
				order: null,
				whereOpen: null,
			})
		);
	}, [dispatch, project.color, project.id, project.projectName, section?.id, section?.sectionName]);
	const showSectionEditModal = useMemo(() => {
		if (section) {
			return (
				sectionEditModal.show && sectionEditModal.id === section?.id && sectionEditModal.type === SectionEditModalType.add
			);
		} else {
			return sectionEditModal.show && sectionEditModal.id === '' && sectionEditModal.type === SectionEditModalType.add;
		}
	}, [section, sectionEditModal.id, sectionEditModal.show, sectionEditModal.type]);
	const showTaskModal = useMemo(() => {
		if (section) {
			return (
				taskModal.typeWhere === TaskModalTypeWhere.project &&
				taskModal.type === TaskModalType.add &&
				taskModal.show &&
				section?.id === taskModal.sectionId
			);
		} else {
			return (
				taskModal.typeWhere === TaskModalTypeWhere.project &&
				taskModal.type === TaskModalType.add &&
				taskModal.show &&
				taskModal.sectionId === ''
			);
		}
	}, [section, taskModal.sectionId, taskModal.show, taskModal.type, taskModal.typeWhere]);
	const tasksD = useMemo(() => tasks && tasks?.length > 0, [tasks]);

	return (
		<li className={cn(className, styles.sectionListItem)} data-testid={''} {...props}>
			<section className={styles.sectionContent}>
				{!empty && <SectionHeader section={section} tasks={tasks} />}
				<div className={styles.sectionTasks}>
					{!empty ? (
						!section?.isCollapsed && (
							<ul className={styles.tasksList} ref={listRef}>
								{tasksD &&
									tasks
										?.filter((item) => !item.hidden)
										.map((item) => (
											<TaskListItem
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
								{!project.isArchived && !section?.isArchived && (
									<li className={styles.addTask}>
										{!showTaskModal ? (
											<SectionsAddTaskButton
												disable={project.isArchived || (section?.isArchived as boolean)}
												clickFn={openTaskModalAdd}
												text={`Добавить задачу`}
											/>
										) : (
											<div className={styles.addTaskForm}>
												<TaskForm />
											</div>
										)}
									</li>
								)}
							</ul>
						)
					) : (
						<ul className={styles.tasksList} ref={listRef}>
							{tasksD &&
								tasks
									?.filter((item) => !item.hidden)
									.map((item) => (
										<TaskListItem
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
							{!project.isArchived && (
								<li className={styles.addTask}>
									{!showTaskModal ? (
										<SectionsAddTaskButton disable={project.isArchived} clickFn={openTaskModalAdd} text={`Добавить задачу`}/>
									) : (
										<div className={styles.addTaskForm}>
											<TaskForm />
										</div>
									)}
								</li>
							)}
						</ul>
					)}
					{!project.isArchived &&
						!section?.isArchived &&
						(!showSectionEditModal ? (
							<SectionAddSectionButton
								disable={false}
								className={styles.addSection}
								clickFn={(e) => openSectionEditModalAdd(e, project.id, section?.id || '')}
							/>
						) : (
							<div className={styles.addSectionForm}>
								<SectionForm />
							</div>
						))}
				</div>
			</section>
		</li>
	);
};

export default React.memo(SectionListItem);
