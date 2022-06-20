import React, { FC, DetailedHTMLProps, HTMLAttributes, useCallback, useState, useRef } from 'react';
import cn from 'classnames';
import styles from './ProjectSelect.module.scss';
import { useAppDispatch, useAppSelector } from '../../../../hooks/reduxTK';
import { selectSections } from '../../../../store/slices/SectionsSlice';
import { selectProjects } from '../../../../store/slices/ProjectsSlice';
import { ITask } from '../../../../types/task';
import { IProject } from '../../../../types/projects';
import { ISection } from '../../../../types/sections';
import ProjectSelectListItem from '../../../ListItems/ProjectSelectListItem/ProjectSelectListItem';
import ProjectSelectInput from '../../../Inputs/ProjectSelectInput/ProjectSelectInput';
import { ModalPopUpTypeWhere, popupModalSlice, selectPopupModal } from '../../../../store/slices/PopupModalSlice';
import { selectTaskModal, taskModalSlice } from '../../../../store/slices/TaskModalSlice';
import { toastModalSlice } from '../../../../store/slices/ToastModalSlice';
import { contextModalSlice } from '../../../../store/slices/ContextModalSlice';
import { doc, writeBatch } from 'firebase/firestore';
import db from '../../../../firebase';
import { selectTasks } from '../../../../store/slices/TasksSlice';

interface ProjectSelectProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	selectedItem: ITask;
}

const ProjectSelect: FC<ProjectSelectProps> = ({ selectedItem, className, ...props }) => {
	const [value, setValue] = useState<string>('');
	const { sections } = useAppSelector(selectSections);
	const { projects } = useAppSelector(selectProjects);
	const { tasks } = useAppSelector(selectTasks);
	const { popUpModal } = useAppSelector(selectPopupModal);
	const { taskModal } = useAppSelector(selectTaskModal);
	const dispatch = useAppDispatch();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const rows = [] as JSX.Element[];
	let lastId = useRef<string | null>(null);

	const moveTask = useCallback(
		async (task: ITask, project: IProject, section?: ISection) => {
			const batch = writeBatch(db);
			dispatch(popupModalSlice.actions.closePopUpModal());
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			const tasksInSec = tasks
				.filter(
					(item) =>
						!item.isArchived &&
						item.sectionId === (section ? section.id : '') &&
						item.projectId === project.id &&
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
			const addBatchUpdate = async (arr: ITask[], newLvl: number) => {
				let lvll = newLvl;
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const taskRef = doc(db, 'tasks', el.id);
					batch.update(taskRef, {
						sectionId: section?.id || '',
						projectId: project.id,
						projectName: project.projectName,
						projectColor: project.color,
						level: lvll,
					});
					if (el.parent) {
						const children = tasks.filter((item) => item.parentId === el.id);
						addBatchUpdate(children, (lvll += 1));
						lvll -= 1;
					}
				}
			};

			try {
				const taskRef = doc(db, 'tasks', task.id as string);
				let order: number;
				let level: number;
				let parentId: string;
				if (project.id === task.projectId && (section ? section.id : '') === task.sectionId) {
					return;
				} else {
					order = tasksInSec[tasksInSec.length - 1]?.order + 1 || 1;
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
						sectionId: section?.id || '',
						projectId: project.id,
						projectName: project.projectName,
						projectColor: project.color,
						parentId,
						order,
						level,
					});
					if (task.parentId !== '') {
						const parent = tasks.find((item) => item.id === task.parentId);
						const children = tasks.filter((item) => item.parentId === parent?.id);
						if (children.length === 1) {
							const laRef = doc(db, 'tasks', parent?.id as string);
							batch.update(laRef, { parent: false });
						}
					}
					if (task.parent) {
						const children = tasks.filter((item) => item.parentId === task.id);
						console.log(children, 'levl 1');
						let newLvl = 2;
						addBatchUpdate(children, newLvl);
					}
				}
				await batch.commit();
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			} finally {
			}
		},
		[dispatch, tasks]
	);

	const onClickHandlerProject = useCallback(
		(project: IProject) => {
			if (project.id !== taskModal.projectId) {
				if (popUpModal.modalTypeWhere === ModalPopUpTypeWhere.quick) {
					moveTask(selectedItem, project);
				} else {
					dispatch(taskModalSlice.actions.setTaskModalProjectColor(project.color));
					dispatch(taskModalSlice.actions.setTaskModalProjectName(project.projectName));
					dispatch(taskModalSlice.actions.setTaskModalProjectDestination(project.id));
					dispatch(taskModalSlice.actions.setTaskModalSectionName(''));
					dispatch(taskModalSlice.actions.setTaskModalSectionDestination(''));
					dispatch(taskModalSlice.actions.setTaskModalLevel(1));
					dispatch(popupModalSlice.actions.closePopUpModal());
				}
			} else {
				dispatch(popupModalSlice.actions.closePopUpModal());
			}
		},
		[dispatch, moveTask, popUpModal.modalTypeWhere, selectedItem, taskModal.projectId]
	);
	const onClickHandlerSection = useCallback(
		(section: ISection) => {
			if (section.id !== taskModal.sectionId) {
				const project = projects.find((item) => item.id == section.projectId);
				if (popUpModal.modalTypeWhere === ModalPopUpTypeWhere.quick) {
					moveTask(selectedItem, project as IProject, section);
				} else {
					if (project) {
						dispatch(taskModalSlice.actions.setTaskModalSectionName(section.sectionName));
						dispatch(taskModalSlice.actions.setTaskModalSectionDestination(section.id));
						dispatch(taskModalSlice.actions.setTaskModalProjectColor(project.color));
						dispatch(taskModalSlice.actions.setTaskModalProjectName(project.projectName));
						dispatch(taskModalSlice.actions.setTaskModalProjectDestination(project.id));
						dispatch(taskModalSlice.actions.setTaskModalLevel(1));
						dispatch(popupModalSlice.actions.closePopUpModal());
					}
				}
			} else {
				dispatch(popupModalSlice.actions.closePopUpModal());
			}
		},
		[dispatch, moveTask, popUpModal.modalTypeWhere, projects, selectedItem, taskModal.sectionId]
	);

	const buildRows = useCallback(() => {
		[...projects]
			.sort((a, b) => {
				if (a.order < b.order) return -1;
				if (a.order > b.order) return 1;
				return 0;
			})
			.forEach((project) => {
				if (project.isArchived || project.order === -2 || project.order === -3) {
					return;
				}
				if (project.id !== lastId.current) {
					if (project.projectName.toLowerCase().indexOf(value.toLocaleLowerCase()) !== -1) {
						rows.push(
							<ProjectSelectListItem
								value={value}
								clickFn={() => onClickHandlerProject(project)}
								key={project.id}
								type='project'
								project={project}
								selectedItem={selectedItem}
							/>
						);
					}
				}
				const sectionItems = sections
					.filter((item) => item.projectId === project.id)
					.sort((a, b) => {
						if (a.order < b.order) return -1;
						if (a.order > b.order) return 1;
						return 0;
					});
				if (sectionItems.length === 0) return;
				sectionItems.forEach((section) => {
					if (!section.isArchived && section.sectionName.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
						const project = projects.find((item) => item.id === section.projectId);
						rows.push(
							<ProjectSelectListItem
								value={value}
								clickFn={() => onClickHandlerSection(section)}
								key={section.id}
								type='section'
								section={section}
								project={project}
								selectedItem={selectedItem}
							/>
						);
					}
				});
				lastId.current = project.id;
			});
		lastId.current = null;
	}, [onClickHandlerProject, onClickHandlerSection, projects, rows, sections, selectedItem, value]);

	buildRows();

	return (
		<div className={cn(className, styles.projectSelect)} data-testid={''} {...props}>
			<ProjectSelectInput value={value} setValue={setValue} />
			<ul className={styles.listItems}>{rows}</ul>
		</div>
	);
};

export default React.memo(ProjectSelect);
