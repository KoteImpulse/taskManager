import React, { FC, DetailedHTMLProps, HTMLAttributes, useRef, useMemo } from 'react';
import cn from 'classnames';
import styles from './ProjectModal.module.scss';
import { createPortal } from 'react-dom';
import { uuid } from '../../../helpers/helpers';
import { useModalPortal } from '../../../hooks/modals';
import AddProjectModalForm from '../../Forms/AddProjectModalForm/AddProjectModalForm';
import { useAppSelector } from '../../../hooks/reduxTK';
import { ProjectModalType, selectProjectModal } from '../../../store/slices/ProjectModalSlice';

interface ProjectModalProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const ProjectModal: FC<ProjectModalProps> = ({ className, ...props }) => {
	const genId = useRef(uuid());
	const { loaded, id, user } = useModalPortal(`projectPortal-${genId.current}`);
	const { projectModal } = useAppSelector(selectProjectModal);

	const headerText = useMemo(
		() => (projectModal.type === ProjectModalType.edit ? 'Редактировать проект' : 'Создать новый проект'),
		[projectModal.type]
	);

	return loaded && projectModal.show ? (
		<>
			{createPortal(
				<div className={cn(className, styles.projectModal)} data-testid={''} {...props} data-theme={user.theme}>
					<div className={styles.wrapper}>
						<div className={styles.content}>
							<header className={styles.modalHeader}>
								<div className={styles.textContainer}>
									<h1 className={styles.headerText}>{headerText}</h1>
								</div>
								<div className={styles.link}>
									<span className={styles.icon}>{'icon'}</span>
								</div>
							</header>
							<AddProjectModalForm />
						</div>
					</div>
				</div>,
				document.getElementById(id)!
			)}
		</>
	) : null;
};

export default React.memo(ProjectModal);
