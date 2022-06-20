import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';
import cn from 'classnames';
import styles from './WeekPicker.module.scss';
import ActionButton from '../Buttons/ActionButton/ActionButton';
import { IoChevronBackOutline, IoEllipseOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { WeekColumn } from '../../hooks/dateHelp';
import { dateToTime } from '../../helpers/helpers';

interface WeekPickerProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	calendarRows: WeekColumn[];
	selectedDateIsToday: () => boolean;
	getPrevWeek: () => void;
	getNextWeek: () => void;
	geCurrentWeek: () => void;
	selectedDate: Date;
}

const WeekPicker: FC<WeekPickerProps> = ({
	selectedDateIsToday,
	getPrevWeek,
	getNextWeek,
	geCurrentWeek,
	selectedDate,
	calendarRows,
	className,
	...props
}) => {
	const backIcon = useMemo(() => <IoChevronBackOutline />, []);
	const middleIcon = useMemo(() => <IoEllipseOutline />, []);
	const nextIcon = useMemo(() => <IoChevronForwardOutline />, []);

	return (
		<div className={cn(className, styles.weekPicker)} data-testid={''} {...props}>
			<div className={styles.header}>
				<span className={styles.date}>
					{new Date(selectedDate).toLocaleDateString('ru', { month: 'long', year: 'numeric' })}
				</span>
				<div className={styles.controls}>
					<ActionButton
						ariaLabel={`Предыдущая неделя`}
						className={cn(styles.backButton)}
						icon={backIcon}
						disable={selectedDateIsToday()}
						fontSize={16}
						withTooltip={false}
						tooltipText={`Предыдущая неделя`}
						clickFn={(e) => getPrevWeek()}
					/>
					<ActionButton
						ariaLabel={`Текущая неделя`}
						className={cn(styles.middleButton)}
						icon={middleIcon}
						disable={selectedDateIsToday()}
						fontSize={16}
						withTooltip={false}
						tooltipText={`Текущая неделя`}
						clickFn={(e) => geCurrentWeek()}
					/>
					<ActionButton
						ariaLabel={`следующая неделя`}
						className={cn(styles.nextButton)}
						icon={nextIcon}
						disable={false}
						fontSize={16}
						withTooltip={false}
						tooltipText={`Следующая неделя`}
						clickFn={(e) => getNextWeek()}
					/>
				</div>
			</div>
			<div className={styles.calendar}>
				<div className={styles.week}>
					{calendarRows.map((item: WeekColumn) => {
						return (
							<button
								key={item.date}
								className={cn(styles.day, {
									[styles.today]: new Date().toDateString() === new Date(item.date).toDateString(),
								})}
								disabled={dateToTime(new Date(item.date)).dateMs < dateToTime(new Date()).dateMs}
							>
								<span className={styles.dayOfWeek}>{item.day}</span>
								<span className={styles.dayOfMonth}>{item.monthDay}</span>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default WeekPicker;
