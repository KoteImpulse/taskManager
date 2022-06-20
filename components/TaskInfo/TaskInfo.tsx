import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';
import cn from 'classnames';
import styles from './TaskInfo.module.scss';
import { ITask } from '../../types/task';
import { useAppSelector } from '../../hooks/reduxTK';
import { useDateHelp } from '../../hooks/dateHelp';
import { selectTasks } from '../../store/slices/TasksSlice';

interface TaskInfoProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	task: ITask;
}

const TaskInfo: FC<TaskInfoProps> = ({ task, className, ...props }) => {
	const { tasks } = useAppSelector(selectTasks);
	const { dateTextColor } = useDateHelp();
	const subtasks = useMemo(() => tasks.filter((item) => item.parentId === task.id), [task.id, tasks]);
	const subtasksIsDone = useMemo(() => subtasks.filter((item) => item.isArchived).length, [subtasks]);
	return (
		<div className={cn(className, styles.taskInfo)} data-testid={''} {...props}>
			{task.parent && (
				<div className={styles.subTasksInfo}>
					<span className={styles.text}>{`Подзадачи: ${subtasksIsDone}/${subtasks.length}`}</span>
				</div>
			)}
			{task.endDate !== 0 && !task.isArchived && (
				<div
					className={styles.endDateInfo}
					style={{
						color: task.endDate >= new Date().getTime() ? dateTextColor(task.endDate)?.color : '#dd4b39',
					}}
				>
					<span className={styles.text}>
						{task.endDate >= new Date().getTime()
							? `${dateTextColor(task.endDate)?.text}`
							: `Просрочено ${dateTextColor(task.endDate)?.text}`}
					</span>
				</div>
			)}
			{task.label !== '' && (
				<div className={styles.label}>
					<span className={styles.text}>{task.label}</span>
				</div>
			)}
		</div>
	);
};

export default React.memo(TaskInfo);
