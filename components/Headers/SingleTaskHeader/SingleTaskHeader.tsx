import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './SingleTaskHeader.module.scss';
import { ITask } from '../../../types/task';
import ActionButton from '../../Buttons/ActionButton/ActionButton';
import { IoCloseOutline } from 'react-icons/io5';
import { useRouter } from 'next/router';
import { useAppDispatch } from '../../../hooks/reduxTK';
import { tooltipModalSlice } from '../../../store/slices/TooltipModalSlice';
import { taskModalSlice } from '../../../store/slices/TaskModalSlice';

interface SingleTaskHeaderProps extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
	task: ITask;
	sectionName: string;
}

const SingleTaskHeader: FC<SingleTaskHeaderProps> = ({ sectionName, task, className, ...props }) => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const closeIcon = useMemo(() => <IoCloseOutline />, []);

	const closeModal = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		dispatch(tooltipModalSlice.actions.closeTooltipModal());
		dispatch(taskModalSlice.actions.closeTaskModal());
		router.push(
			`/project/[...project]?project=${router.query.project && router.query.project[0]}`,
			`/project/${router.query.project && router.query.project[0]}`,
			{
				shallow: true,
			}
		);
	}, [dispatch, router]);

	const toProjectLink = useCallback(() => {
		router.push(`/project/[...project]?project=${task.projectId}`, `/project/${task.projectId}`, {
			shallow: true,
		});
	}, [router, task.projectId]);

	return (
		<header className={cn(className, styles.singleTaskHeader)} data-testid={''} {...props}>
			<div className={styles.container}>
				<div className={styles.location}>
					<div className={styles.linksBlock}>
						<span className={styles.link} onClick={toProjectLink}>
							<span className={styles.text}>{task.projectName}</span>
						</span>
						{task.sectionId !== '' && (
							<>
								<span className={styles.separator}>/</span>
								<span className={styles.link} onClick={toProjectLink}>
									<span className={styles.text}>{sectionName}</span>
								</span>
							</>
						)}
					</div>
				</div>
				<div className={styles.buttons}>
					<ActionButton
						disable={false}
						ariaLabel='Закрыть окно'
						tooltipText={'Закрыть окно'}
						icon={closeIcon}
						clickFn={(e) => closeModal(e)}
					/>
				</div>
			</div>
		</header>
	);
};

export default React.memo(SingleTaskHeader);
