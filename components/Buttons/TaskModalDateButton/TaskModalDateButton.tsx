import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';
import cn from 'classnames';
import styles from './TaskModalDateButton.module.scss';
import { IoCalendarClearOutline } from 'react-icons/io5';
import { useDateHelp } from '../../../hooks/dateHelp';

interface TaskModalDateButtonProps extends DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	clickFn: (e: any) => void;
	endDate: number;
}

const TaskModalDateButton: FC<TaskModalDateButtonProps> = ({ endDate, clickFn, className, ...props }) => {
	const calendarIcon = useMemo(() => <IoCalendarClearOutline />, []);
	const { dateTextColor } = useDateHelp();

	return (
		<button
			className={cn(className, styles.taskModalDateButton)}
			data-testid={''}
			aria-label={'Выбрать дату'}
			{...props}
			disabled={false}
			type='button'
			onClick={clickFn}
			style={{ color: dateTextColor(endDate as number)?.color }}
		>
			<span className={styles.icon}>{calendarIcon}</span>
			<span className={styles.text}>{dateTextColor(endDate).text}</span>
		</button>
	);
};

export default React.memo(TaskModalDateButton);
