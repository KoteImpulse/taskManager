import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useRef, useCallback } from 'react';
import * as Io from 'react-icons/io5';
import cn from 'classnames';
import styles from './ContextMenuModal.module.scss';
import { createPortal } from 'react-dom';
import { useModalPortal, useContextMenuModal } from '../../../hooks/modals';
import { uuid } from '../../../helpers/helpers';
import ModalTextListItem from '../../ListItems/ModalTextListItem/ModalTextListItem';
import { IProject } from '../../../types/projects';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { selectTasks } from '../../../store/slices/TasksSlice';
import { ISection } from '../../../types/sections';
import { ITask } from '../../../types/task';
import ContextModalSelectPriorityListItem from '../../ListItems/ContextModalSelectPriorityListItem/ContextModalSelectPriorityListItem';
import ContextModalSelectDateListItem from '../../ListItems/ContextModalSelectDateListItem/ContextModalSelectDateListItem';
import { contextModalSlice, ModalType, selectContextModal } from '../../../store/slices/ContextModalSlice';
import { ModalPopUpType, ModalPopUpTypeWhere, popupModalSlice } from '../../../store/slices/PopupModalSlice';
import { projectModalSlice, ProjectModalType } from '../../../store/slices/ProjectModalSlice';
import { taskModalSlice, TaskModalType, TaskModalTypeWhere } from '../../../store/slices/TaskModalSlice';
import { doc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import db from '../../../firebase';
import { selectSections } from '../../../store/slices/SectionsSlice';
import { selectProjects } from '../../../store/slices/ProjectsSlice';
import { toastModalSlice } from '../../../store/slices/ToastModalSlice';
import { checkModalSlice } from '../../../store/slices/CheckModalSlice';
import { useRouter } from 'next/router';
import { sectionEditModalSlice, SectionEditModalType } from '../../../store/slices/SectionEditModalSlice';
import { tooltipModalSlice } from '../../../store/slices/TooltipModalSlice';
import { selectTasksProject } from '../../../store/slices/TasksProjectSlice';
import { selectSectionsProject } from '../../../store/slices/SectionsProjectSlice';

interface ContextMenuModalProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const ContextMenuModal: FC<ContextMenuModalProps> = ({ className, ...props }) => {
	const dispatch = useAppDispatch();
	const genId = useRef(uuid());
	const { loaded, id, user } = useModalPortal(`contextMenuPortal-${genId.current}`);
	const { refContentModal, refOverlay } = useContextMenuModal();
	const { contextMenuModal } = useAppSelector(selectContextModal);
	const { tasks } = useAppSelector(selectTasks);
	const { sections } = useAppSelector(selectSections);
	const { projects } = useAppSelector(selectProjects);
	const { tasksProject } = useAppSelector(selectTasksProject);
	const { sectionsProject } = useAppSelector(selectSectionsProject);
	const router = useRouter();

	const selectedItem = useMemo(() => {
		const a = {
			project: projects.find((item) => item.id === contextMenuModal.id),
			section: sections.find((item) => item.id === contextMenuModal.id),
			task: tasks.find((item) => item.id === contextMenuModal.id),
			taskModal: tasks.find((item) => item.id === contextMenuModal.id),
		};
		if (contextMenuModal.modalType) {
			return a[contextMenuModal.modalType];
		}
	}, [contextMenuModal.id, contextMenuModal.modalType, projects, sections, tasks]);

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
	const openModalProjectAdd = useCallback(
		(event: React.MouseEvent) => {
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			event.stopPropagation();
			dispatch(
				projectModalSlice.actions.setProjectModal({
					type: ProjectModalType.add,
					show: true,
					color: '#ff8d85',
					isFavorite: false,
					projectDescription: '',
					projectName: '',
					id: null,
				})
			);
		},
		[dispatch]
	);
	const openModalProjectEdit = useCallback(
		(event: React.MouseEvent, selectedProject: IProject) => {
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			event.stopPropagation();
			dispatch(
				projectModalSlice.actions.setProjectModal({
					id: selectedProject.id,
					projectName: selectedProject?.projectName,
					projectDescription: selectedProject?.projectDescription,
					isFavorite: selectedProject?.isFavorite,
					color: selectedProject?.color,
					type: ProjectModalType.edit,
					show: true,
				})
			);
		},
		[dispatch]
	);
	const openModalProjectAddUpOrDown = useCallback(
		(event: React.MouseEvent, selectedItem: IProject, projectModalType: ProjectModalType) => {
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			event.stopPropagation();
			dispatch(
				projectModalSlice.actions.setProjectModal({
					type: projectModalType,
					show: true,
					color: '#ff8d85',
					isFavorite: false,
					projectDescription: '',
					projectName: '',
					id: selectedItem.id,
				})
			);
		},
		[dispatch]
	);
	const deleteProject = useCallback(
		async (selectedProject: IProject) => {
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			const batch = writeBatch(db);
			const addBatch = (arr: ISection[] | ITask[], type: 'tasks' | 'sections') => {
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const laRef = doc(db, type, el.id);
					batch.delete(laRef);
				}
			};
			try {
				// const projectSections = sections.filter((item) => item.projectId === selectedProject.id);
				// const projectTasks = tasks.filter((item) => item.projectId === selectedProject.id);
				const projectRef = doc(db, 'projects', selectedProject.id);
				batch.delete(projectRef);
				addBatch(sectionsProject, 'sections');
				addBatch(tasksProject, 'tasks');
				const nextProjects = projects.filter(
					(item) => item.isArchived === selectedProject.isArchived && item.order > selectedProject.order
				);
				if (nextProjects.length > 0) {
					for (let i = 0; i < nextProjects.length; i++) {
						const el = nextProjects[i];
						const laRef = doc(db, 'projects', el.id);
						batch.update(laRef, { order: el.order - 1 });
					}
				}
				await batch.commit();
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			} finally {
				dispatch(checkModalSlice.actions.closeCheckModal());
				dispatch(toastModalSlice.actions.setToastModalWarning(`Проект ${selectedProject.projectName} удален`));
				if (router.query.project && router.query.project[0] === selectedProject?.id) {
					router.push(`/project/${projects.find((item) => item.order === -1)?.id}`, undefined, { shallow: true });
				}
			}
		},
		[dispatch, projects, router, sectionsProject, tasksProject]
	);
	const archiveProject = useCallback(
		async (selectedProject: IProject) => {
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			const batch = writeBatch(db);
			const addBatchSections = (arr: ISection[]) => {
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const laRef = doc(db, 'sections', el.id);
					batch.update(laRef, { isArchived: true, isCollapsed: false });
				}
			};
			const addBatchTasks = (arr: ITask[]) => {
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const laRef = doc(db, 'tasks', el.id);
					batch.update(laRef, { isArchived: true, hidden: false, isCollapsed: false });
				}
			};
			try {
				// const projectSections = sections.filter((item) => item.projectId === selectedProject.id);
				// const projectTasks = tasks.filter((item) => item.projectId === selectedProject.id);
				const projectRef = doc(db, 'projects', selectedProject.id);
				const archivedProjects = projects.filter((item) => item.isArchived).sort((a, b) => a.order - b.order);
				const notArchivedProjects = projects.filter((item) => !item.isArchived).sort((a, b) => a.order - b.order);
				let order = 1;
				if (selectedProject.isArchived && notArchivedProjects.length > 3) {
					order = notArchivedProjects[notArchivedProjects.length - 1].order + 1;
				}
				if (!selectedProject.isArchived && archivedProjects.length > 0) {
					order = archivedProjects[archivedProjects.length - 1].order + 1;
				}
				const nextProjects = projects.filter(
					(item) => item.isArchived === selectedProject.isArchived && item.order > selectedProject.order
				);
				if (nextProjects.length > 0) {
					for (let i = 0; i < nextProjects.length; i++) {
						const el = nextProjects[i];
						const laRef = doc(db, 'projects', el.id);
						batch.update(laRef, { order: el.order - 1 });
					}
				}
				batch.update(projectRef, {
					isArchived: selectedProject.isArchived ? false : true,
					isFavorite: false,
					order,
					showArchivedTasks: selectedProject.isArchived ? false : true,
				});
				if (!selectedProject.isArchived) {
					addBatchTasks(tasksProject);
					addBatchSections(sectionsProject);
				}
				await batch.commit();
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			} finally {
				dispatch(
					toastModalSlice.actions.setToastModalSuccess(
						selectedProject.isArchived
							? `Проект ${selectedProject.projectName} разархивирован`
							: `Проект ${selectedProject.projectName} добавлен в архив`
					)
				);
				if (router.query.project && router.query.project[0] === selectedProject?.id) {
					router.push(`/project/${projects.find((item) => item.order === -1)?.id}`, undefined, { shallow: true });
				}
			}
		},
		[dispatch, projects, router, sectionsProject, tasksProject]
	);
	const likeProject = useCallback(
		async (selectedProject: IProject) => {
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			try {
				const projectRef = doc(db, 'projects', selectedProject.id);
				await updateDoc(projectRef, {
					isFavorite: selectedProject.isFavorite ? false : true,
				});
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			} finally {
				dispatch(
					toastModalSlice.actions.setToastModalSuccess(
						selectedProject?.isFavorite ? 'Проект удален из избранного' : 'Проект добавлен в избранное'
					)
				);
			}
		},
		[dispatch]
	);
	const showArchivedProjectTasks = useCallback(
		async (selectedProject: IProject) => {
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			try {
				const projectRef = doc(db, 'projects', selectedProject.id);
				await updateDoc(projectRef, {
					showArchivedTasks: selectedProject.showArchivedTasks ? false : true,
				});
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			}
		},
		[dispatch]
	);

	const openSectionEditModalEdit = useCallback(
		(event: React.MouseEvent, section: ISection) => {
			event.stopPropagation();
			dispatch(
				sectionEditModalSlice.actions.setSectionEditModal({
					id: section.id,
					show: true,
					type: SectionEditModalType.edit,
					sectionName: section.sectionName,
					projectId: section.projectId,
					userId: section.userId,
					order: section.order,
				})
			);
		},
		[dispatch]
	);
	const deleteSection = useCallback(
		async (selectedSection: ISection) => {
			dispatch(checkModalSlice.actions.closeCheckModal());
			const batch = writeBatch(db);
			const addBatch = (arr: ITask[]) => {
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const laRef = doc(db, 'tasks', el.id);
					batch.delete(laRef);
				}
			};
			const addBatchUpdate = (arr: ISection[]) => {
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const laRef = doc(db, 'sections', el.id);
					batch.update(laRef, { order: el.order - 1 });
				}
			};
			try {
				const sectionTasks = tasksProject.filter((item) => item.sectionId === selectedSection.id);
				const sectionRef = doc(db, 'sections', selectedSection.id);
				batch.delete(sectionRef);
				addBatch(sectionTasks);
				const nextSections = sections.filter(
					(item) => item.projectId === selectedSection.projectId && item.order > selectedSection.order
				);
				if (nextSections.length > 0) {
					addBatchUpdate(nextSections);
				}
				await batch.commit();
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			} finally {
				dispatch(toastModalSlice.actions.setToastModalWarning(`Радел ${selectedSection.sectionName} удален`));
			}
		},
		[dispatch, sections, tasksProject]
	);
	const archiveSection = useCallback(
		async (selectedSection: ISection) => {
			const batch = writeBatch(db);
			const addBatch = (arr: ITask[]) => {
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const laRef = doc(db, 'tasks', el.id);
					batch.update(laRef, { isArchived: true });
				}
			};
			const addBatchUpdate = (arr: ISection[]) => {
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const laRef = doc(db, 'sections', el.id);
					batch.update(laRef, { order: el.order - 1 });
				}
			};
			try {
				const sectionTasks = tasksProject.filter((item) => item.sectionId === selectedSection.id);
				const sectionRef = doc(db, 'sections', selectedSection.id);
				const archivedSections = sections.filter(
					(item) => item.projectId === selectedSection.projectId && item.isArchived
				);
				const notArchivedSections = sections.filter(
					(item) => item.projectId === selectedSection.projectId && !item.isArchived
				);
				let order = 1;
				let isArchived: boolean;
				let nextSections: ISection[];
				if (!selectedSection.isArchived) {
					addBatch(sectionTasks);
					nextSections = notArchivedSections.filter((item) => item.order > selectedSection.order);
					order = archivedSections?.length + 1;
					isArchived = true;
				} else {
					nextSections = archivedSections.filter((item) => item.order > selectedSection.order);
					order = notArchivedSections?.length + 1;
					isArchived = false;
				}
				if (nextSections.length > 0) {
					addBatchUpdate(nextSections);
				}
				batch.update(sectionRef, {
					isArchived: isArchived,
					order: order,
				});
				await batch.commit();
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			} finally {
				dispatch(checkModalSlice.actions.closeCheckModal());
				dispatch(
					toastModalSlice.actions.setToastModalWarning(
						selectedSection.isArchived
							? `Радел ${selectedSection.sectionName} разархивирован`
							: `Радел ${selectedSection.sectionName} добавлен в архив`
					)
				);
			}
		},
		[dispatch, sections, tasksProject]
	);
	const copySection = useCallback(
		async (section: ISection) => {
			const batch = writeBatch(db);
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			const rndSymbl = uuid(1, 2);
			const addBatchSet = async (arr: ITask[]) => {
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const taskRef = doc(db, 'tasks', `${el.id}d${order}${rndSymbl}`);
					batch.set(taskRef, {
						parent: el.parent,
						order: el.order,
						taskDescription: el.taskDescription,
						date: serverTimestamp(),
						isArchived: el.isArchived,
						userId: el.userId,
						taskName: el.taskName,
						projectId: el.projectId,
						isDeleted: el.isDeleted,
						level: el.level,
						label: el.label,
						projectColor: el.projectColor,
						projectName: el.projectName,
						endDate: el.endDate,
						priority: el.priority,
						isCollapsed: el.isCollapsed,
						hidden: el.hidden,
						parentId: el.parentId === '' ? '' : `${el.parentId}d${order}${rndSymbl}`,
						sectionId: `${section.id}d${order}${rndSymbl}`,
					});
				}
			};
			const secInThisProj = sections
				.filter((item) => !item.isArchived && item.projectId === section.projectId)
				.sort((a, b) => a.order - b.order);
			if (secInThisProj.length >= user.numberOfSectionsInProject) {
				dispatch(
					toastModalSlice.actions.setToastModalWarning(
						`Максимум доступно ${user.numberOfSectionsInProject} разделов в проекте`
					)
				);
				return;
			}

			const tasksInSection = tasksProject.filter((item) => item.sectionId === section.id);
			const order = secInThisProj[secInThisProj.length - 1]?.order + 1 || 1;
			const secRef = doc(db, 'sections', `${section.id}d${order}${rndSymbl}`);
			batch.set(secRef, {
				isCollapsed: section.isCollapsed,
				isArchived: section.isArchived,
				isDeleted: section.isDeleted,
				order: order,
				sectionName: `${section.sectionName} copy ${order}${rndSymbl}`,
				projectId: section.projectId,
				userId: user.uid,
			});
			if (tasksInSection.length > 0) {
				addBatchSet(tasksInSection);
			}
			try {
				await batch.commit();
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			}
		},
		[dispatch, sections, tasksProject, user.numberOfSectionsInProject, user.uid]
	);

	const openTaskModalEdit = useCallback(
		(task: ITask, section?: ISection) => {
			dispatch(
				taskModalSlice.actions.setTaskModal({
					show: true,
					typeWhere:
						contextMenuModal.modalType === ModalType.taskModal
							? TaskModalTypeWhere.taskModal
							: TaskModalTypeWhere.project,
					type: contextMenuModal.modalType === ModalType.taskModal ? TaskModalType.taskModalEdit : TaskModalType.edit,
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
		[contextMenuModal.modalType, dispatch]
	);
	const openTaskModalAddUpOrDown = useCallback(
		(currentTask: ITask, modalTypeWhere: TaskModalTypeWhere) => {
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			let lastChildId = currentTask.id;
			let where = modalTypeWhere;
			if (currentTask.parent && modalTypeWhere === TaskModalTypeWhere.down) {
				const nextTask = tasks.find(
					(item) =>
						item.level === currentTask.level &&
						item.order === currentTask.order + 1 &&
						currentTask.projectId === item.projectId &&
						currentTask.sectionId === item.sectionId &&
						!item.isArchived
				);
				if (nextTask) {
					lastChildId = nextTask.id;
					where = TaskModalTypeWhere.up;
				} else {
					if (!currentTask.isCollapsed) {
						const children = tasks
							.filter((item) => item.parentId === currentTask.id && !item.isArchived)
							.sort((a, b) => a.order - b.order);
						lastChildId = children.length > 0 ? children[children.length - 1]?.id : currentTask.id;
					}
				}
			}
			dispatch(
				taskModalSlice.actions.setTaskModal({
					show: true,
					whereOpen: where,
					typeWhere: modalTypeWhere,
					type: contextMenuModal.modalType === ModalType.taskModal ? TaskModalType.taskModalAdd : TaskModalType.add,
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
					parentId: currentTask.parentId,
					parent: false,
					level: currentTask.level,
					endDate: 0,
					upOrDownTaskId: lastChildId,
					id: currentTask.id,
					order: null,
				})
			);
		},
		[contextMenuModal.modalType, dispatch, sections, tasks]
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
		[dispatch, tasks]
	);
	const copyTask = useCallback(
		async (task: ITask) => {
			const batch = writeBatch(db);
			dispatch(popupModalSlice.actions.closePopUpModal());
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			const rndSymbl = uuid(1, 2);
			const addBatchSet = async (arr: ITask[]) => {
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const taskRef = doc(db, 'tasks', `${el.id}t${order}${rndSymbl}`);
					batch.set(taskRef, {
						parent: el.parent,
						order: el.order,
						taskDescription: el.taskDescription,
						date: serverTimestamp(),
						isArchived: el.isArchived,
						userId: el.userId,
						taskName: el.taskName,
						projectId: el.projectId,
						isDeleted: el.isDeleted,
						level: el.level,
						label: el.label,
						projectColor: el.projectColor,
						projectName: el.projectName,
						endDate: el.endDate,
						priority: el.priority,
						isCollapsed: el.isCollapsed,
						hidden: el.hidden,
						parentId: el.parentId === '' ? '' : `${el.parentId}t${order}${rndSymbl}`,
						sectionId: el.sectionId,
					});
					if (el.parent) {
						const children = tasksProject.filter((item) => item.parentId === el.id);
						addBatchSet(children);
					}
				}
			};
			const tasksInSec = tasksProject
				.filter((item) => !item.isArchived && item.sectionId === task.sectionId && item.level === task.level)
				.sort((a, b) => a.order - b.order);
			const order = tasksInSec[tasksInSec.length - 1]?.order + 1 || 1;
			// if (tasksInSec.length > 100) {
			// 	return;
			// }
			try {
				const taskRef = doc(db, 'tasks', `${task.id}t${order}${rndSymbl}`);
				batch.set(taskRef, {
					parent: task.parent,
					order: order,
					taskDescription: task.taskDescription,
					date: serverTimestamp(),
					isArchived: task.isArchived,
					userId: task.userId,
					taskName: task.taskName,
					projectId: task.projectId,
					isDeleted: task.isDeleted,
					level: task.level,
					label: task.label,
					projectColor: task.projectColor,
					projectName: task.projectName,
					endDate: task.endDate,
					priority: task.priority,
					isCollapsed: task.isCollapsed,
					hidden: task.hidden,
					parentId: task.parentId,
					sectionId: task.sectionId,
				});
				if (task.parent) {
					const children = tasksProject.filter((item) => item.parentId === task.id);
					addBatchSet(children);
				}
				await batch.commit();
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			}
		},
		[dispatch, tasksProject]
	);
	const copyTaskLink = useCallback(
		(selectedItem: ITask) => {
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			dispatch(popupModalSlice.actions.closePopUpModal());
			dispatch(tooltipModalSlice.actions.closeTooltipModal());
			const url = `${process.env.NEXT_PUBLIC_SERVER}/project/${selectedItem.projectId}/task/${selectedItem.id}`;
			navigator.clipboard.writeText(url);
			dispatch(toastModalSlice.actions.setToastModalSuccess(`Ссылка на задачу скопирована в буфер обмена`));
			return;
		},
		[dispatch]
	);

	const downIcon = useMemo(() => <Io.IoArrowDownOutline />, []);
	const upIcon = useMemo(() => <Io.IoArrowUpOutline />, []);
	const editIcon = useMemo(() => <Io.IoPencilOutline />, []);
	const likeIcon = useMemo(() => <Io.IoHeartOutline />, []);
	const moveIcon = useMemo(() => <Io.IoArrowForwardCircleOutline />, []);
	const copyIcon = useMemo(() => <Io.IoCopyOutline />, []);
	const hideIcon = useMemo(() => <Io.IoCheckmarkCircleOutline />, []);
	const deleteIcon = useMemo(() => <Io.IoTrashOutline />, []);
	const archiveIcon = useMemo(() => <Io.IoArchiveOutline />, []);
	const addIcon = useMemo(() => <Io.IoAddOutline />, []);

	const tasksNumber = useMemo(() => {
		if (contextMenuModal.modalType === ModalType.project) {
			return tasks.filter((item) => item.projectId === selectedItem?.id && !item.isArchived).length;
		} else if (contextMenuModal.modalType === ModalType.section) {
			return tasks.filter((item) => item.sectionId === selectedItem?.id && !item.isArchived).length;
		} else {
		}
	}, [contextMenuModal.modalType, selectedItem?.id, tasks]);

	const typeOfContent = useMemo(() => {
		let a: { [index: string]: React.ReactNode };
		if (contextMenuModal.modalType === ModalType.project) {
			a = {
				favorite: (
					<ul className={styles.listItems}>
						<ModalTextListItem
							className={styles.listItem}
							text={`Редактировать проект`}
							icon={editIcon}
							clickFn={(e) => openModalProjectEdit(e, selectedItem as IProject)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`${(selectedItem as IProject)?.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}`}
							icon={likeIcon}
							clickFn={(e) => likeProject(selectedItem as IProject)}
						/>
					</ul>
				),
				projectPage: (
					<ul className={styles.listItems}>
						<ModalTextListItem
							className={styles.listItem}
							text={`Редактировать проект`}
							icon={editIcon}
							clickFn={(e) => openModalProjectEdit(e, selectedItem as IProject)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`${(selectedItem as IProject)?.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}`}
							icon={likeIcon}
							clickFn={(e) => likeProject(selectedItem as IProject)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Удалить проект`}
							icon={deleteIcon}
							clickFn={(e) =>
								openCheckModal(
									e,
									`Удалить проект${tasksNumber && tasksNumber > 0 ? `, включая ${tasksNumber} задач?` : `?`}`,
									'Удалить',
									() => deleteProject(selectedItem as IProject)
								)
							}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Архивировать проект`}
							icon={archiveIcon}
							clickFn={(e) => archiveProject(selectedItem as IProject)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`${
								(selectedItem as IProject)?.showArchivedTasks
									? 'Скрывать выполненные задачи'
									: 'Показывать выполненные задачи'
							}`}
							icon={hideIcon}
							clickFn={(e) => showArchivedProjectTasks(selectedItem as IProject)}
						/>
					</ul>
				),
				standart: (
					<ul className={styles.listItems}>
						<ModalTextListItem
							className={styles.listItem}
							text={`Добавить проект выше`}
							icon={upIcon}
							clickFn={(e) => openModalProjectAddUpOrDown(e, selectedItem as IProject, ProjectModalType.addUp)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Добавить проект ниже`}
							icon={downIcon}
							clickFn={(e) => openModalProjectAddUpOrDown(e, selectedItem as IProject, ProjectModalType.addDown)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Редактировать проект`}
							icon={editIcon}
							clickFn={(e) => openModalProjectEdit(e, selectedItem as IProject)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`${(selectedItem as IProject)?.isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}`}
							icon={likeIcon}
							clickFn={(e) => likeProject(selectedItem as IProject)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Удалить проект`}
							icon={deleteIcon}
							clickFn={(e) =>
								openCheckModal(
									e,
									`Удалить проект${tasksNumber && tasksNumber > 0 ? `, включая ${tasksNumber} задач?` : `?`}`,
									'Удалить',
									() => deleteProject(selectedItem as IProject)
								)
							}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Архивировать проект`}
							icon={archiveIcon}
							clickFn={(e) => archiveProject(selectedItem as IProject)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Создать проект`}
							icon={addIcon}
							clickFn={(e) => openModalProjectAdd(e)}
						/>
					</ul>
				),
				archived: (
					<ul className={styles.listItems}>
						<ModalTextListItem
							className={styles.listItem}
							text={`Удалить проект`}
							icon={deleteIcon}
							clickFn={(e) =>
								openCheckModal(
									e,
									`Удалить проект${tasksNumber && tasksNumber > 0 ? `, включая ${tasksNumber} задач?` : `?`}`,
									'Удалить',
									() => deleteProject(selectedItem as IProject)
								)
							}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Вернуть проект из архива`}
							icon={archiveIcon}
							clickFn={(e) => archiveProject(selectedItem as IProject)}
						/>
					</ul>
				),
			};
			return a[contextMenuModal?.contentType as string];
		} else if (contextMenuModal.modalType === ModalType.section) {
			a = {
				standart: (
					<ul className={styles.listItems}>
						<ModalTextListItem
							className={styles.listItem}
							text={`Изменить раздел`}
							icon={editIcon}
							clickFn={(e) => {
								openSectionEditModalEdit(e, selectedItem as ISection);
								dispatch(contextModalSlice.actions.closeContextMenuModal());
							}}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Переместить раздел`}
							icon={moveIcon}
							clickFn={(e) =>
								openPopUpModal(
									e,
									selectedItem?.id as string,
									ModalPopUpType.projectSectionSelect,
									ModalPopUpTypeWhere.quick
								)
							}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Дублировать раздел`}
							icon={copyIcon}
							clickFn={(e) => copySection(selectedItem as ISection)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Удалить раздел`}
							icon={deleteIcon}
							clickFn={(e) =>
								openCheckModal(
									e,
									`Удалить раздел${tasksNumber && tasksNumber > 0 ? `, включая ${tasksNumber} задач?` : `?`}`,
									'Удалить',
									() => deleteSection(selectedItem as ISection)
								)
							}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Архивировать раздел`}
							icon={archiveIcon}
							clickFn={(e) =>
								openCheckModal(
									e,
									`Архивировать раздел${
										tasksNumber && tasksNumber > 0 ? `, включая ${tasksNumber} задач?` : `?`
									}`,
									'Архивировать раздел',
									() => archiveSection(selectedItem as ISection)
								)
							}
						/>
					</ul>
				),
				archived: (
					<ul className={styles.listItems}>
						<ModalTextListItem
							className={styles.listItem}
							text={`Удалить раздел`}
							icon={deleteIcon}
							clickFn={(e) =>
								openCheckModal(
									e,
									`Удалить раздел${tasksNumber && tasksNumber > 0 ? `, включая ${tasksNumber} задач?` : `?`}`,
									'Удалить',
									() => deleteSection(selectedItem as ISection)
								)
							}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Вернуть раздел из архива`}
							icon={archiveIcon}
							clickFn={(e) =>
								openCheckModal(
									e,
									`Вернуть раздел из архива${
										tasksNumber && tasksNumber > 0 ? `, включая ${tasksNumber} задач?` : `?`
									}`,
									'Вернуть раздел из архива',
									() => archiveSection(selectedItem as ISection)
								)
							}
						/>
					</ul>
				),
			};
			return a[contextMenuModal?.contentType as string];
		} else if (contextMenuModal.modalType === ModalType.task) {
			a = {
				standart: (
					<ul className={styles.listItems}>
						<ModalTextListItem
							className={styles.listItem}
							text={`Добавить задачу выше`}
							icon={upIcon}
							clickFn={(e) => {
								openTaskModalAddUpOrDown(selectedItem as ITask, TaskModalTypeWhere.up);
							}}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Добавить задачу ниже`}
							icon={downIcon}
							clickFn={(e) => {
								openTaskModalAddUpOrDown(selectedItem as ITask, TaskModalTypeWhere.down);
							}}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Изменить задачу`}
							icon={editIcon}
							clickFn={(e) => {
								openTaskModalEdit(selectedItem as ITask);
								dispatch(contextModalSlice.actions.closeContextMenuModal());
							}}
						/>
						<ContextModalSelectPriorityListItem className={styles.listItem} selectedItem={selectedItem as ITask} />
						<ContextModalSelectDateListItem className={styles.listItem} selectedItem={selectedItem as ITask} />
						<ModalTextListItem
							className={styles.listItem}
							text={`Перенести в проект`}
							icon={moveIcon}
							clickFn={(e) =>
								openPopUpModal(
									e,
									selectedItem?.id as string,
									ModalPopUpType.projectSelect,
									ModalPopUpTypeWhere.quick
								)
							}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Дублировать задачу`}
							icon={copyIcon}
							clickFn={(e) => copyTask(selectedItem as ITask)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Скопировать ссылку на задачу`}
							icon={copyIcon}
							clickFn={(e) => copyTaskLink(selectedItem as ITask)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Удалить задачу`}
							icon={deleteIcon}
							clickFn={(e) =>
								openCheckModal(e, `Удалить задачу?`, 'Удалить', () => deleteTask(selectedItem as ITask))
							}
						/>
					</ul>
				),
				defaultProjects: (
					<ul className={styles.listItems}>
						<ModalTextListItem
							className={styles.listItem}
							text={`Изменить задачу`}
							icon={editIcon}
							clickFn={(e) => {
								openTaskModalEdit(selectedItem as ITask);
								dispatch(contextModalSlice.actions.closeContextMenuModal());
							}}
						/>
						<ContextModalSelectPriorityListItem className={styles.listItem} selectedItem={selectedItem as ITask} />
						<ContextModalSelectDateListItem className={styles.listItem} selectedItem={selectedItem as ITask} />
						<ModalTextListItem
							className={styles.listItem}
							text={`Перенести в проект`}
							icon={moveIcon}
							clickFn={(e) =>
								openPopUpModal(
									e,
									selectedItem?.id as string,
									ModalPopUpType.projectSelect,
									ModalPopUpTypeWhere.quick
								)
							}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Дублировать задачу`}
							icon={copyIcon}
							clickFn={(e) => copyTask(selectedItem as ITask)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Скопировать ссылку на задачу`}
							icon={copyIcon}
							clickFn={(e) => copyTaskLink(selectedItem as ITask)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Удалить задачу`}
							icon={deleteIcon}
							clickFn={(e) =>
								openCheckModal(e, `Удалить задачу?`, 'Удалить', () => deleteTask(selectedItem as ITask))
							}
						/>
					</ul>
				),
				archived: (
					<ul className={styles.listItems}>
						<ModalTextListItem
							className={styles.listItem}
							text={`Удалить задачу`}
							icon={deleteIcon}
							clickFn={(e) =>
								openCheckModal(e, `Удалить задачу?`, 'Удалить', () => deleteTask(selectedItem as ITask))
							}
						/>
					</ul>
				),
			};
			return a[contextMenuModal?.contentType as string];
		} else if (contextMenuModal.modalType === ModalType.taskModal) {
			a = {
				standart: (
					<ul className={styles.listItems}>
						<ModalTextListItem
							className={styles.listItem}
							text={`Добавить задачу выше`}
							icon={upIcon}
							clickFn={(e) => {
								openTaskModalAddUpOrDown(selectedItem as ITask, TaskModalTypeWhere.up);
							}}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Добавить задачу ниже`}
							icon={downIcon}
							clickFn={(e) => {
								openTaskModalAddUpOrDown(selectedItem as ITask, TaskModalTypeWhere.down);
							}}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Изменить задачу`}
							icon={editIcon}
							clickFn={(e) => {
								openTaskModalEdit(selectedItem as ITask);
								dispatch(contextModalSlice.actions.closeContextMenuModal());
							}}
						/>
						<ContextModalSelectPriorityListItem className={styles.listItem} selectedItem={selectedItem as ITask} />
						<ContextModalSelectDateListItem className={styles.listItem} selectedItem={selectedItem as ITask} />
						<ModalTextListItem
							className={styles.listItem}
							text={`Перенести в проект`}
							icon={moveIcon}
							clickFn={(e) =>
								openPopUpModal(
									e,
									selectedItem?.id as string,
									ModalPopUpType.projectSelect,
									ModalPopUpTypeWhere.quick
								)
							}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Дублировать задачу`}
							icon={copyIcon}
							clickFn={(e) => copyTask(selectedItem as ITask)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Скопировать ссылку на задачу`}
							icon={copyIcon}
							clickFn={(e) => copyTaskLink(selectedItem as ITask)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Удалить задачу`}
							icon={deleteIcon}
							clickFn={(e) =>
								openCheckModal(e, `Удалить задачу?`, 'Удалить', () => deleteTask(selectedItem as ITask))
							}
						/>
					</ul>
				),
				defaultProjects: (
					<ul className={styles.listItems}>
						<ModalTextListItem
							className={styles.listItem}
							text={`Изменить задачу`}
							icon={editIcon}
							clickFn={(e) => {
								openTaskModalEdit(selectedItem as ITask);
								dispatch(contextModalSlice.actions.closeContextMenuModal());
							}}
						/>
						<ContextModalSelectPriorityListItem className={styles.listItem} selectedItem={selectedItem as ITask} />
						<ContextModalSelectDateListItem className={styles.listItem} selectedItem={selectedItem as ITask} />
						<ModalTextListItem
							className={styles.listItem}
							text={`Перенести в проект`}
							icon={moveIcon}
							clickFn={(e) =>
								openPopUpModal(
									e,
									selectedItem?.id as string,
									ModalPopUpType.projectSelect,
									ModalPopUpTypeWhere.quick
								)
							}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Дублировать задачу`}
							icon={copyIcon}
							clickFn={(e) => copyTask(selectedItem as ITask)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Скопировать ссылку на задачу`}
							icon={copyIcon}
							clickFn={(e) => copyTaskLink(selectedItem as ITask)}
						/>
						<ModalTextListItem
							className={styles.listItem}
							text={`Удалить задачу`}
							icon={deleteIcon}
							clickFn={(e) =>
								openCheckModal(e, `Удалить задачу?`, 'Удалить', () => deleteTask(selectedItem as ITask))
							}
						/>
					</ul>
				),
				archived: (
					<ul className={styles.listItems}>
						<ModalTextListItem
							className={styles.listItem}
							text={`Удалить задачу`}
							icon={deleteIcon}
							clickFn={(e) =>
								openCheckModal(e, `Удалить задачу?`, 'Удалить', () => deleteTask(selectedItem as ITask))
							}
						/>
					</ul>
				),
			};
			return a[contextMenuModal?.contentType as string];
		} else {
		}
	}, [
		addIcon,
		archiveIcon,
		archiveProject,
		archiveSection,
		contextMenuModal?.contentType,
		contextMenuModal.modalType,
		copyIcon,
		copySection,
		copyTask,
		copyTaskLink,
		deleteIcon,
		deleteProject,
		deleteSection,
		deleteTask,
		dispatch,
		downIcon,
		editIcon,
		hideIcon,
		likeIcon,
		likeProject,
		moveIcon,
		openCheckModal,
		openModalProjectAdd,
		openModalProjectAddUpOrDown,
		openModalProjectEdit,
		openPopUpModal,
		openSectionEditModalEdit,
		openTaskModalAddUpOrDown,
		openTaskModalEdit,
		selectedItem,
		showArchivedProjectTasks,
		tasksNumber,
		upIcon,
	]);

	return loaded && contextMenuModal.show ? (
		<>
			{createPortal(
				<div
					className={cn(className, styles.contextMenuModal)}
					data-testid={''}
					{...props}
					data-theme={user.theme}
					ref={refOverlay}
				>
					<div className={styles.wrapper}>
						<div
							className={styles.content}
							style={{
								visibility: contextMenuModal.show ? 'visible' : 'hidden',
								opacity: contextMenuModal.show ? 1 : 0,
								left: contextMenuModal.show ? `${contextMenuModal.left}px` : 0,
								top: contextMenuModal.show ? `${contextMenuModal.top}px` : 0,
							}}
							ref={refContentModal}
						>
							{typeOfContent}
						</div>
					</div>
				</div>,
				document.getElementById(id)!
			)}
		</>
	) : null;
};

export default ContextMenuModal;
