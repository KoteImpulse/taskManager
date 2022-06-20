import React, { FC, DetailedHTMLProps, HTMLAttributes, useCallback } from 'react';
import { useAppSelector } from '../../../hooks/reduxTK';
import { ITask } from '../../../types/task';
import { selectTasks } from '../../../store/slices/TasksSlice';
import { dateToTime } from '../../../helpers/helpers';
import TodaySectionListItem from '../../ListItems/TodaySectionListItem/TodaySectionListItem';

interface TodaySectionProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const TodaySection: FC<TodaySectionProps> = () => {
	const { tasks } = useAppSelector(selectTasks);

	const newTaskArray = useCallback(() => {
		const sectionTasks = tasks.filter((task) => !task.isArchived && task.endDate !==0 && task.endDate <= dateToTime(new Date()).dateMs);
		const newTasksArr = [] as ITask[];
		const reqArr = (arr: ITask[]) => {
			arr.sort((a, b) => {
				if (a.endDate < b.endDate) return -1;
				if (a.endDate > b.endDate) return 1;
				return 0;
			});
			for (let i = 0; i < arr.length; i++) {
				const el = arr[i];
				newTasksArr.push(el);
			}
		};
		reqArr(sectionTasks);
		return newTasksArr;
	}, [tasks]);

	return <>{<TodaySectionListItem tasks={newTaskArray()} />}</>;
};

export default TodaySection;
