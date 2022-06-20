import React, { FC, DetailedHTMLProps, HTMLAttributes } from 'react';
import { useAppSelector } from '../../../hooks/reduxTK';
import { selectTasks } from '../../../store/slices/TasksSlice';
import { dateToTime } from '../../../helpers/helpers';
import NextWeekListItem from '../../ListItems/NextWeekListItem/NextWeekListItem';
import { WeekColumn } from '../../../hooks/dateHelp';

interface NextWeekSectionProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	calendarRows: WeekColumn[];
}

const NextWeekSection: FC<NextWeekSectionProps> = ({ calendarRows }) => {
	const { tasks } = useAppSelector(selectTasks);

	return (
		<>
			{calendarRows
				.filter((item) => dateToTime(item.date).dateMs >= dateToTime(new Date()).dateMs)
				.map((item: WeekColumn) => {
					return <NextWeekListItem key={item.date} tasks={item.tasks} date={item.date} />;
				})}
		</>
	);
};

export default NextWeekSection;
