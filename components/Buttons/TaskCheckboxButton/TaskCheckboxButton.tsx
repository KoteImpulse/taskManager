import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';
import cn from 'classnames';
import styles from './TaskCheckboxButton.module.scss';
import { IoCheckmarkOutline } from 'react-icons/io5';

interface TaskCheckboxProps extends DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	priority: number;
	disable: boolean;
	isArchived: boolean;
	clickFn:()=>void
}

const TaskCheckbox: FC<TaskCheckboxProps> = ({ clickFn,isArchived, priority, disable, className, ...props }) => {
	const icon = useMemo(() => <IoCheckmarkOutline />, []);
	const ariaLabel = useMemo(
		() => (isArchived ? `Отметить задачу не выполненной` : `Отметить задачу выполненной`),
		[isArchived]
	);

	return (
		<button
			className={cn(className, styles.taskCheckboxButton, { [styles.disable]: disable, [styles.archived]: isArchived })}
			data-testid={''}
			{...props}
			aria-label={ariaLabel}
			disabled={disable}
			type='button'
			onClick={clickFn}
		>
			<div className={styles.circle} data-priority={priority}>
				<span className={styles.icon}>{icon}</span>
			</div>
		</button>
	);
};

export default React.memo(TaskCheckbox);
