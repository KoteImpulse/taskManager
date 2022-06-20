import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';
import cn from 'classnames';
import styles from './ProjectListBox.module.scss';
import { useAppSelector } from '../../hooks/reduxTK';
import { useWeek } from '../../hooks/dateHelp';
import WeekPicker from '../../components/WeekPicker/WeekPicker';
import TodaySection from '../../components/Lists/TodaySection/TodaySection';
import { selectProject } from '../../store/slices/ProjectSlice';
import NextWeekSection from '../../components/Lists/NextWeekSection/NextWeekSection';
import SectionList from '../../components/Lists/SectionList/SectionList';
import EmptySectionList from '../../components/Lists/EmptySectionList/EmptySectionList';

interface ProjectListBoxProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const ProjectListBox: FC<ProjectListBoxProps> = ({ className, ...props }) => {
	const { project } = useAppSelector(selectProject);
	const { calendarRows, selectedDateIsToday, getPrevWeek, getNextWeek, geCurrentWeek, selectedDate } = useWeek();

	const section = useMemo(() => {
		if (project.order === -2) {
			return (
				<div className={styles.content}>
					<ul className={styles.listItems}>
						<TodaySection />
					</ul>
				</div>
			);
		} else if (project.order === -3) {
			return (
				<div className={styles.content}>
					<WeekPicker
						className={styles.weekPicker}
						calendarRows={calendarRows}
						selectedDateIsToday={selectedDateIsToday}
						getPrevWeek={getPrevWeek}
						getNextWeek={getNextWeek}
						geCurrentWeek={geCurrentWeek}
						selectedDate={selectedDate}
					/>
					<ul className={styles.listItems}>
						<NextWeekSection calendarRows={calendarRows} />
					</ul>
				</div>
			);
		} else {
			return (
				<div className={styles.content}>
					<ul className={styles.listItems}>
						<EmptySectionList />
						<SectionList />
					</ul>
				</div>
			);
		}
	}, [calendarRows, geCurrentWeek, getNextWeek, getPrevWeek, project.order, selectedDate, selectedDateIsToday]);

	return (
		<div className={cn(className, styles.projectListBox)} data-testid={''} {...props}>
			{section}
		</div>
	);
};

export default React.memo(ProjectListBox);
