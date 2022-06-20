import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './SingleTaskContent.module.scss';
import SingleTaskItem from '../../../ListItems/SingleTaskItem/SingleTaskItem';
import SingleTaskContentSubtasks from '../SingleTaskContentSubtasks/SingleTaskContentSubtasks';
import { useAppDispatch, useAppSelector } from '../../../../hooks/reduxTK';
import { selectTask, taskSlice } from '../../../../store/slices/TaskSlice';
import { selectTasksProject } from '../../../../store/slices/TasksProjectSlice';
import { useRouter } from 'next/router';
import { ITask } from '../../../../types/task';
import { taskModalSlice } from '../../../../store/slices/TaskModalSlice';
import SingleTaskContentControls from '../SingleTaskContentControls/SingleTaskContentControls';

interface SingleTaskContentProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const SingleTaskContent: FC<SingleTaskContentProps> = ({ className, ...props }) => {
	const router = useRouter();
	const { task } = useAppSelector(selectTask);
	const dispatch = useAppDispatch();
	const { tasksProject } = useAppSelector(selectTasksProject);
	const taskParent = useMemo(() => {
		if (task.parentId !== '') {
			return tasksProject.find((item) => item.id === task.parentId);
		}
	}, [task.parentId, tasksProject]);
	//
	const clickHandler = useCallback(
		(e: React.MouseEvent, task: ITask) => {
			e.preventDefault();
			dispatch(taskModalSlice.actions.closeTaskModal());
			dispatch(taskSlice.actions.setSingleTask({ ...task }));
			router.push(
				`/project/[...project]?project=${router.query.project && router.query.project[0]}&task=${task.id}`,
				`/project/${router.query.project && router.query.project[0]}/task/${task.id}`,
				{
					shallow: true,
				}
			);
		},
		[dispatch, router]
	);
	// const ariaLabelText = useMemo(() => (task?.isCollapsed ? 'Разввернуть список' : 'Свернуть список'), [task?.isCollapsed]);
	// const collapseIcon = useMemo(
	// 	() => (task.isCollapsed ? <Io.IoChevronForwardOutline /> : <Io.IoChevronDownOutline />),
	// 	[task.isCollapsed]
	// );

	return (
		<div className={cn(className, styles.singleTaskContent)} data-testid={''} {...props}>
			<div className={styles.leftSide}>
				{taskParent && (
					<div className={styles.breadcrumbs} onClick={(e) => clickHandler(e, taskParent)}>
						<span className={styles.taskName}>{`К родительской задаче: ${taskParent.taskName}`}</span>
					</div>
				)}
				<SingleTaskItem />
				<SingleTaskContentSubtasks />
			</div>
			<div className={styles.rightSide}>
				<SingleTaskContentControls />
			</div>
		</div>
	);
};

export default React.memo(SingleTaskContent);
