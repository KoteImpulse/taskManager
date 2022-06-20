import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './ProjectHeader.module.scss';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { selectProject } from '../../../store/slices/ProjectSlice';
import ActionButton from '../../Buttons/ActionButton/ActionButton';
import { IoEllipsisHorizontalOutline } from 'react-icons/io5';
import { selectTasks } from '../../../store/slices/TasksSlice';
import { dateToTime } from '../../../helpers/helpers';
import { ContentType, contextModalSlice, ModalType } from '../../../store/slices/ContextModalSlice';

interface ProjectHeaderProps extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {}

const ProjectHeader: FC<ProjectHeaderProps> = ({ className, ...props }) => {
	const { project } = useAppSelector(selectProject);
	const { tasks } = useAppSelector(selectTasks);
	const restIcon = useMemo(() => <IoEllipsisHorizontalOutline />, []);
	const dispatch = useAppDispatch();

	const openContextMenuModal = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			dispatch(
				contextModalSlice.actions.setContextMenuModal({
					id: project?.id,
					x: event.clientX,
					y: event.clientY,
					height: 0,
					width: 0,
					show: true,
					left: event.clientX,
					top: event.clientY + 15,
					modalType: ModalType.project,
					contentType: ContentType.projectPage,
				})
			);
		},
		[dispatch, project?.id]
	);
	return (
		<header className={cn(className, styles.projectHeader)} data-testid={''} {...props}>
			<div className={styles.headerContent}>
				<h1 className={styles.header}>
					<span className={styles.text}>{project.projectName}</span>
					{project.order === -2 && (
						<span className={styles.text}>
							{` ${new Date().toLocaleDateString('ru', {
								weekday: 'short',
								day: '2-digit',
								month: 'long',
							})}, проектов к выполнению: ${
								tasks.filter((task) => !task.isArchived && task.endDate === dateToTime(new Date()).dateMs).length
							}`}
						</span>
					)}
				</h1>
				<div className={styles.buttons}>
					{!project.isArchived && project.order > 0 && (
						<ActionButton
							disable={false}
							ariaLabel='Действия в проекте'
							tooltipText={'Действия в проекте'}
							icon={restIcon}
							clickFn={(e) => openContextMenuModal(e)}
						/>
					)}
				</div>
			</div>
		</header>
	);
};

export default React.memo(ProjectHeader);
