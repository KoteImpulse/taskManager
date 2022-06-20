import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback, useState, useRef } from 'react';
import cn from 'classnames';
import styles from './ProjectSelectNoSec.module.scss';
import { useAppDispatch, useAppSelector } from '../../../../hooks/reduxTK';
import { selectSections } from '../../../../store/slices/SectionsSlice';
import { selectProjects } from '../../../../store/slices/ProjectsSlice';
import { IProject } from '../../../../types/projects';
import ProjectSelectListItem from '../../../ListItems/ProjectSelectListItem/ProjectSelectListItem';
import ProjectSelectInput from '../../../Inputs/ProjectSelectInput/ProjectSelectInput';
import { ISection } from '../../../../types/sections';
import { ModalPopUpTypeWhere, popupModalSlice, selectPopupModal } from '../../../../store/slices/PopupModalSlice';
import { selectTaskModal } from '../../../../store/slices/TaskModalSlice';
import { contextModalSlice } from '../../../../store/slices/ContextModalSlice';
import { doc, writeBatch } from 'firebase/firestore';
import db from '../../../../firebase';
import { toastModalSlice } from '../../../../store/slices/ToastModalSlice';
import { selectUser } from '../../../../store/slices/UserSlice';
import { ITask } from '../../../../types/task';
import { selectTasks } from '../../../../store/slices/TasksSlice';

interface ProjectSelectNoSecProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const ProjectSelectNoSec: FC<ProjectSelectNoSecProps> = ({ className, ...props }) => {
	const [value, setValue] = useState<string>('');
	const { projects } = useAppSelector(selectProjects);
	const { user } = useAppSelector(selectUser);
	const { sections } = useAppSelector(selectSections);
	const { tasks } = useAppSelector(selectTasks);
	const { popUpModal } = useAppSelector(selectPopupModal);
	const { taskModal } = useAppSelector(selectTaskModal);
	const dispatch = useAppDispatch();

	const section = useMemo(() => sections.find((item) => item.id === popUpModal.id), [popUpModal.id, sections]);
	const moveSection = useCallback(
		async (section: ISection, projectDestination: IProject) => {
			const batch = writeBatch(db);
			dispatch(popupModalSlice.actions.closePopUpModal());
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			const secInProj = sections
				.filter((item) => !item.isArchived && item.projectId === projectDestination.id)
				.sort((a, b) => a.order - b.order);
			if (secInProj.length >= user.numberOfSectionsInProject) {
				dispatch(
					toastModalSlice.actions.setToastModalWarning(
						`Максимум доступно ${user.numberOfSectionsInProject} разделов в проекте`
					)
				);
				return;
			}
			const addBatchUpdate = async (arr: ITask[]) => {
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const taskRef = doc(db, 'tasks', el.id);
					batch.update(taskRef, {
						projectId: projectDestination.id,
						projectName: projectDestination.projectName,
						projectColor: projectDestination.color,
					});
				}
			};
			try {
				const secRef = doc(db, 'sections', section.id as string);
				if (projectDestination.id === section.projectId) {
					return;
				} else {
					const order = secInProj[secInProj.length - 1]?.order + 1 || 1;
					const nextSections = sections.filter(
						(item) => !item.isArchived && item.projectId === section.projectId && item.order > section.order
					);
					const tasksInSection = tasks.filter((item) => item.sectionId === section.id);
					if (tasksInSection.length > 0) {
						addBatchUpdate(tasksInSection);
					}
					if (nextSections.length > 0) {
						for (let i = 0; i < nextSections.length; i++) {
							const el = nextSections[i];
							const laRef = doc(db, 'sections', el.id);
							batch.update(laRef, { order: el.order - 1 });
						}
					}
					batch.update(secRef, {
						projectId: projectDestination.id,
						order,
					});
					await batch.commit();
				}
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			} finally {
				dispatch(
					toastModalSlice.actions.setToastModalSuccess(`Раздел перенесен в проект ${projectDestination.projectName}`)
				);
			}
		},
		[dispatch, sections, tasks, user.numberOfSectionsInProject]
	);
	let lastId = useRef<string | null>(null);
	const onClickHandlerProject = useCallback(
		(project: IProject) => {
			if (project.id !== taskModal.projectId) {
				if (popUpModal.modalTypeWhere === ModalPopUpTypeWhere.quick) {
					moveSection(section as ISection, project);
				}
			} else {
				dispatch(popupModalSlice.actions.closePopUpModal());
			}
		},
		[dispatch, moveSection, popUpModal.modalTypeWhere, section, taskModal.projectId]
	);

	return (
		<div className={cn(className, styles.projectSelect)} data-testid={''} {...props}>
			<ProjectSelectInput value={value} setValue={setValue} />
			<ul className={styles.listItems}>
				{projects.map((project) => {
					if (project.isArchived || project.order === -2 || project.order === -3) {
						return;
					}
					if (
						project.id !== lastId.current &&
						project.projectName.toLowerCase().indexOf(value.toLocaleLowerCase()) !== -1
					) {
						lastId.current = project.id;
						return (
							<ProjectSelectListItem
								value={value}
								clickFn={() => onClickHandlerProject(project)}
								key={project.id}
								type='project'
								project={project}
							/>
						);
					}
				})}
			</ul>
		</div>
	);
};

export default React.memo(ProjectSelectNoSec);
