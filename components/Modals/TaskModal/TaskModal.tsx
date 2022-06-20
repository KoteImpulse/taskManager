import React, { FC, DetailedHTMLProps, HTMLAttributes, useRef } from 'react';
import cn from 'classnames';
import styles from './TaskModal.module.scss';
import { createPortal } from 'react-dom';
import { uuid } from '../../../helpers/helpers';
import { useModalPortal } from '../../../hooks/modals';
import TaskForm from '../../Forms/TaskForm/TaskForm';
import { useAppSelector } from '../../../hooks/reduxTK';
import { selectTaskModal, TaskModalTypeWhere } from '../../../store/slices/TaskModalSlice';

interface TaskModalProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const TaskModal: FC<TaskModalProps> = ({ className, ...props }) => {
	const genId = useRef(uuid());
	const { taskModal } = useAppSelector(selectTaskModal);
	const { loaded, id, user } = useModalPortal(`taskPortal-${genId.current}`);

	return loaded && taskModal.typeWhere === TaskModalTypeWhere.quick && taskModal.show ? (
		<>
			{createPortal(
				<div className={cn(className, styles.taskModal)} data-testid={''} {...props} data-theme={user.theme}>
					<div className={styles.wrapper}>
						<div className={styles.content}>
							<header className={styles.modalHeader}>
								<div className={styles.textContainer}>
									<h1 className={styles.headerText}>{`Новая задача`}</h1>
								</div>
								<div className={styles.link}>
									<span className={styles.icon}>{'icon'}</span>
								</div>
							</header>
							<TaskForm />
						</div>
					</div>
				</div>,
				document.getElementById(id)!
			)}
		</>
	) : null;
};

export default TaskModal;
