import React, { DetailedHTMLProps, HTMLAttributes, useMemo, forwardRef, ForwardedRef, useCallback, useRef } from 'react';
import cn from 'classnames';
import styles from './SidebarListItem.module.scss';
import { IProject } from '../../../types/projects';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { projectSlice, selectProject } from '../../../store/slices/ProjectSlice';
import { useRouter } from 'next/router';
import { selectProjects } from '../../../store/slices/ProjectsSlice';
import { IoEllipsisHorizontalOutline } from 'react-icons/io5';
import ActionButton from '../../Buttons/ActionButton/ActionButton';
import { selectTasks } from '../../../store/slices/TasksSlice';
import { ContentType, contextModalSlice, ModalType } from '../../../store/slices/ContextModalSlice';

interface SidebarListItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement> {
	projectItem: IProject;
	contentType?: ContentType;
}

const SidebarListItem = (
	{ contentType, projectItem, className, ...props }: SidebarListItemProps,
	ref: ForwardedRef<HTMLLIElement>
) => {
	const dispatch = useAppDispatch();
	const prItem = useMemo(() => projectItem, [projectItem]);
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

	const hoverRefDiv = useRef<HTMLDivElement>(null);
	const router = useRouter();

	// const { contextMenuModal } = useAppSelector(selectContextModal);
	const { projects } = useAppSelector(selectProjects);
	const { tasks } = useAppSelector(selectTasks);
	const { project } = useAppSelector(selectProject);
	const restIcon = useMemo(() => <IoEllipsisHorizontalOutline />, []);
	const tasksNumber = useMemo(
		() => tasks.filter((item) => item.projectId === prItem.id && !item.isArchived).length,
		[prItem.id, tasks]
	);

	const clickHandler = useCallback(() => {
		const selectedProject = projects.find((item) => item.id === prItem?.id);
		if (JSON.stringify(project) === JSON.stringify(selectedProject)) return;
		dispatch(projectSlice.actions.setProject(selectedProject as IProject));
		router.push(`/project/${prItem?.id}`, undefined, { shallow: true });
	}, [dispatch, project, prItem?.id, projects, router]);

	return (
		<li
			className={cn(className, styles.sidebarListItem, {
				// [styles.sidebarModalOpen]: contextMenuModal.contentType === contentType && contextMenuModal.id === prItem.id,
			})}
			data-testid={''}
			{...props}
			ref={ref}
			id={prItem.id}
		>
			<div className={styles.wrapper} ref={hoverRefDiv}>
				<div
					className={cn(styles.content, {
						[styles.active]: router.query.project && prItem.id === router.query.project[0],
					})}
				>
					<span className={styles.linkItem} onClick={clickHandler}>
						<span className={styles.projectDot} style={{ backgroundColor: prItem.color }} />
						<span className={styles.projectName}>{prItem.projectName}</span>
					</span>
					<div className={styles.buttons}>
						{tasksNumber > 0 && <div className={styles.numberTasks}>{tasksNumber}</div>}
						<ActionButton
							className={styles.button}
							ariaLabel={'Действия в проекте'}
							tooltipText={'Действия в проекте'}
							icon={restIcon}
							disable={false}
							clickFn={(e) => openContextMenuModal(e, prItem.id, ModalType.project, contentType as ContentType)}
						/>
					</div>
				</div>
			</div>
		</li>
	);
};

export default React.memo(forwardRef(SidebarListItem));
