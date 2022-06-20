import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback, useRef } from 'react';
import cn from 'classnames';
import styles from './AddProjectModalForm.module.scss';
import ProjectModalInput from '../../Inputs/ProjectModalInput/ProjectModalInput';
import ProjectModalSwitcher from '../../Inputs/ProjectModalSwitcher/ProjectModalSwitcher';
import ColorPicker from '../../ColorPicker/ColorPicker';
import ProjectModalButton from '../../Buttons/ProjectModalButton/ProjectModalButton';
import { projectModalSlice, ProjectModalType, selectProjectModal } from '../../../store/slices/ProjectModalSlice';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { toastModalSlice } from '../../../store/slices/ToastModalSlice';
import { selectUser } from '../../../store/slices/UserSlice';
import { selectProjects } from '../../../store/slices/ProjectsSlice';
import { addDoc, doc, serverTimestamp, collection, writeBatch } from 'firebase/firestore';
import db from '../../../firebase';
import { IProject } from '../../../types/projects';
import { selectTasks } from '../../../store/slices/TasksSlice';

interface AddProjectModalFormProps extends DetailedHTMLProps<HTMLAttributes<HTMLFormElement>, HTMLFormElement> {}

const AddProjectModalForm: FC<AddProjectModalFormProps> = ({ className, ...props }) => {
	const dispatch = useAppDispatch();
	const { projectModal } = useAppSelector(selectProjectModal);
	const { user } = useAppSelector(selectUser);
	const { projects } = useAppSelector(selectProjects);
	const { tasks } = useAppSelector(selectTasks);
	const disableActions = useRef(false);
	const closeModalProject = useCallback(() => dispatch(projectModalSlice.actions.closeProjectModal()), [dispatch]);
	const text = useMemo(() => (projectModal.type === ProjectModalType.edit ? 'Редактировать' : 'Создать'), [projectModal.type]);
	const textToast = useMemo(
		() =>
			projectModal.type === ProjectModalType.edit
				? `Данные проекта ${projectModal.projectName} изменены`
				: `Проект ${projectModal.projectName} создан`,
		[projectModal.projectName, projectModal.type]
	);
	const disableButton = useMemo(
		() =>
			!projectModal.projectName ||
			!projectModal.projectDescription ||
			projectModal.projectName.trim().length < 1 ||
			projectModal.projectDescription.trim().length < 1,
		[projectModal.projectDescription, projectModal.projectName]
	);
	const submitModalProject = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			disableActions.current = true;
			dispatch(projectModalSlice.actions.closeProjectModal());
			try {
				if (projects.length >= user.numberOfProjects + 3) {
					dispatch(
						toastModalSlice.actions.setToastModalWarning(`Максимум доступных проектов ${user.numberOfProjects}`)
					);
					return;
				}
				const batch = writeBatch(db);
				if (projectModal.type === ProjectModalType.edit) {
					const projectRef = doc(db, 'projects', projectModal.id as string);
					if (tasks.filter((item) => item.projectId === projectModal.id).length > 0) {
						const tasksForUpdate = tasks.filter((item) => item.projectId === projectModal.id);
						for (let i = 0; i < tasksForUpdate.length; i++) {
							const el = tasksForUpdate[i];
							const taskRef = doc(db, 'tasks', el.id as string);
							batch.update(taskRef, { projectName: projectModal.projectName });
						}
					}
					batch.update(projectRef, {
						color: projectModal.color,
						projectName: projectModal.projectName,
						projectDescription: projectModal.projectDescription,
						isFavorite: projectModal.isFavorite,
					});
					await batch.commit();
				} else {
					const currentProject = projects.find((item) => item.id === projectModal.id);
					let order: number;
					let nextProjects: IProject[];
					if (projectModal.type === ProjectModalType.addUp) {
						order = (currentProject as IProject).order;
						nextProjects = projects.filter((item) => item.order >= (currentProject as IProject).order);
					} else if (projectModal.type === ProjectModalType.add) {
						order = projects[projects.length - 1]?.order + 1 || 1;
						nextProjects = [];
					} else {
						order = (currentProject as IProject).order + 1;
						nextProjects = projects.filter((item) => item.order > (currentProject as IProject).order);
					}
					if (nextProjects.length > 0) {
						for (let i = 0; i < nextProjects.length; i++) {
							const el = nextProjects[i];
							const laRef = doc(db, 'projects', el.id);
							batch.update(laRef, { order: el.order + 1 });
						}
					}
					await batch.commit();
					await addDoc(collection(db, 'projects'), {
						isArchived: false,
						isDeleted: false,
						collapsed: false,
						order: order,
						projectDescription: projectModal.projectDescription?.trim(),
						projectName: projectModal.projectName?.trim(),
						date: serverTimestamp(),
						isFavorite: projectModal.isFavorite,
						userId: user.uid,
						color: projectModal.color,
						showArchivedTasks: false,
					});
				}
				dispatch(toastModalSlice.actions.setToastModalSuccess(textToast));
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			} finally {
				disableActions.current = false;
			}
		},
		[
			dispatch,
			projectModal.color,
			projectModal.id,
			projectModal.isFavorite,
			projectModal.projectDescription,
			projectModal.projectName,
			projectModal.type,
			projects,
			tasks,
			textToast,
			user.numberOfProjects,
			user.uid,
		]
	);
	return (
		<form className={cn(className, styles.formContent)} onSubmit={(e) => submitModalProject(e)} data-testid={''} {...props}>
			<section className={styles.content}>
				<ProjectModalInput
					value={projectModal.projectName || ''}
					setValue={projectModalSlice.actions.setProjectModalName}
					labelFor={'prjName'}
					labelText={`Название проекта`}
					maxLength={100}
					disable={disableActions.current}
				/>
				<ProjectModalInput
					value={projectModal.projectDescription || ''}
					setValue={projectModalSlice.actions.setProjectModalDesc}
					labelFor={'prjDesc'}
					labelText={`Описание проекта`}
					maxLength={200}
					disable={disableActions.current}
				/>
				<ProjectModalSwitcher disable={disableActions.current} isFavorite={projectModal.isFavorite as boolean} />
				<ColorPicker disable={disableActions.current} projectColor={projectModal?.color as string} />
			</section>
			<footer className={styles.buttons}>
				<ProjectModalButton
					typeButton={'button'}
					ariaLabel={`Отмена`}
					textButton={`Отмена`}
					clickFn={closeModalProject}
					disable={disableActions.current}
				/>
				<ProjectModalButton
					typeButton={'submit'}
					ariaLabel={text}
					textButton={text}
					disable={disableActions.current || disableButton}
				/>
			</footer>
		</form>
	);
};

export default React.memo(AddProjectModalForm);
