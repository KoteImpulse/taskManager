import { useMemo, useCallback, useState } from 'react';
import { selectTasks } from '../store/slices/TasksSlice';
import { ITask } from '../types/task';
import { useAppSelector } from './reduxTK';

export const useDateHelp = () => {
	const dateOfWeekDay = useCallback((date: Date, dayOfWeek: number) => {
		const dateForCheck = new Date(date);
		if (dateForCheck.getDay() === dayOfWeek) {
			if (dateForCheck.getDate() === date.getDate()) {
				dateForCheck.setDate(dateForCheck.getDate() + 7);
				return dateForCheck;
			}
			return dateForCheck;
		} else {
			let i = 1;
			while (i < 7) {
				const dateOfWeekend = new Date(date);
				dateOfWeekend.setDate(dateOfWeekend.getDate() + i);
				if (dateOfWeekend.getDay() === dayOfWeek) {
					return dateOfWeekend;
				}
				i++;
			}
		}
	}, []);
	const today = useMemo(() => new Date(), []);
	const tomorrow = useMemo(() => {
		const dt = new Date();
		return new Date(new Date().setDate(dt.getDate() + 1));
	}, []);
	const weekend = useMemo(() => dateOfWeekDay(today, 6), [dateOfWeekDay, today]);
	const weekStart = useMemo(() => dateOfWeekDay(today, 1), [dateOfWeekDay, today]);

	const dateTextColor = useCallback(
		(endDate: number) => {
			if (endDate === null) return {};
			if (endDate === 0) return { text: `Срок выполнения`, color: 'gray' };
			const taskDate = new Date(endDate);
			if (today.toDateString() === taskDate.toDateString()) {
				return { text: `Сегодня`, color: `var(--today-color)` };
			} else if (tomorrow?.toDateString() === taskDate.toDateString()) {
				return { text: `Завтра`, color: `var(--tomorrow-color)` };
			} else if ((taskDate.getTime() - today.getTime()) / 1000 / 60 / 60 / 24 <= 7 && (taskDate.getTime() - today.getTime()) / 1000 / 60 / 60 / 24 > 0) {
				return { text: `${taskDate.toLocaleDateString('ru', { weekday: 'long' })}`, color: `var(--inbox-color)` };
			} else {
				return {
					text: `${taskDate.toLocaleDateString('ru', { year: 'numeric', month: 'short', day: 'numeric' })}`,
					color: `grey`,
				};
			}
		},
		[today, tomorrow]
	);

	return { today, tomorrow, weekend, weekStart, dateOfWeekDay, dateTextColor };
};

export interface Column {
	classes: string;
	date: string;
	value: number;
	tasks: ITask[];
	today: boolean;
	disable: boolean;
}
export interface WeekColumn {
	day: string;
	date: string;
	tasks: ITask[];
	value: number;
	monthDay: number;
}

interface CalendarRows {
	[id: number]: Column[];
}

export const useCalendar = () => {
	const { tasks } = useAppSelector(selectTasks);
	const [hoveredDate, setHoveredDate] = useState({ hovered: false, date: '', tasks: [] as ITask[] });
	const week = useMemo(() => ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], []);
	const today = useMemo(() => new Date(), []);
	const daysInWeek = [1, 2, 3, 4, 5, 6, 0];
	const [selectedDate, setSelectedDate] = useState(today);
	const selectedMonthLastDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
	const previousMonthLastDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 0);

	const daysInMonth = selectedMonthLastDate.getDate();
	const firstDayInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
	const startingPoint = daysInWeek.indexOf(firstDayInMonth) + 1;

	let prevMonthStartingPoint = previousMonthLastDate.getDate() - daysInWeek.indexOf(firstDayInMonth) + 1;
	let currentMonthCounter = 1;
	let nextMonthCounter = 1;

	const rows = 6;
	const cols = 7;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const calendarRows: CalendarRows = {};

	const condition = useCallback(
		(dayDate: string) => {
			const filteredTasks = tasks.filter((item) => !item.isArchived && item.endDate > 0);
			return filteredTasks.filter((task) => new Date(task.endDate).toDateString() === new Date(dayDate).toDateString());
		},
		[tasks]
	);

	const loopDays = useCallback(() => {
		for (let i = 1; i < rows + 1; i++) {
			for (let j = 1; j < cols + 1; j++) {
				if (!calendarRows[i]) {
					calendarRows[i] = [];
				}
				if (i === 1) {
					if (j < startingPoint) {
						const date = `${selectedDate.getMonth() === 0 ? 12 : selectedDate.getMonth()}/${prevMonthStartingPoint}/${
							selectedDate.getMonth() === 0 ? selectedDate.getFullYear() - 1 : selectedDate.getFullYear()
						}`;
						calendarRows[i] = [
							...calendarRows[i],
							{
								classes: 'prevMonth',
								date: date,
								value: prevMonthStartingPoint,
								tasks: condition(date),
								today: new Date().toDateString() === new Date(date).toDateString(),
								disable: Number(new Date().getTime()) <= Number(new Date(date).getTime()),
							},
						];
						prevMonthStartingPoint++;
					} else {
						const date = `${selectedDate.getMonth() + 1}/${currentMonthCounter}/${selectedDate.getFullYear()}`;
						calendarRows[i] = [
							...calendarRows[i],
							{
								classes: '',
								date: date,
								value: currentMonthCounter,
								tasks: condition(date),
								today: new Date().toDateString() === new Date(date).toDateString(),
								disable: Number(new Date().getTime()) <= Number(new Date(date).getTime()),
							},
						];
						currentMonthCounter++;
					}
				} else if (i > 1 && currentMonthCounter < daysInMonth + 1) {
					const date = `${selectedDate.getMonth() + 1}/${currentMonthCounter}/${selectedDate.getFullYear()}`;
					calendarRows[i] = [
						...calendarRows[i],
						{
							classes: '',
							date: date,
							value: currentMonthCounter,
							tasks: condition(date),
							today: new Date().toDateString() === new Date(date).toDateString(),
							disable: Number(new Date().getTime()) <= Number(new Date(date).getTime()),
						},
					];
					currentMonthCounter++;
				} else {
					const date = `${selectedDate.getMonth() + 2 === 13 ? 1 : selectedDate.getMonth() + 2}/${nextMonthCounter}/${
						selectedDate.getMonth() + 2 === 13 ? selectedDate.getFullYear() + 1 : selectedDate.getFullYear()
					}`;
					calendarRows[i] = [
						...calendarRows[i],
						{
							classes: 'nextMonth',
							date: date,
							value: nextMonthCounter,
							tasks: condition(date),
							today: new Date().toDateString() === new Date(date).toDateString(),
							disable: Number(new Date().getTime()) <= Number(new Date(date).getTime()),
						},
					];
					nextMonthCounter++;
				}
			}
		}
	}, [
		calendarRows,
		condition,
		currentMonthCounter,
		daysInMonth,
		nextMonthCounter,
		prevMonthStartingPoint,
		selectedDate,
		startingPoint,
	]);

	loopDays();

	const selectedDateIsToday = () => {
		return (
			new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getTime() ===
			new Date(today.getFullYear(), today.getMonth(), 1).getTime()
		);
	};

	const getPrevMonth = () => {
		setSelectedDate((prevValue) => {
			if (selectedDateIsToday()) return today;
			return new Date(prevValue.getFullYear(), prevValue.getMonth() - 1, 1);
		});
	};

	const getNextMonth = () => {
		setSelectedDate((prevValue) => new Date(prevValue.getFullYear(), prevValue.getMonth() + 1, 1));
	};

	const geCurrentMonth = () => {
		setSelectedDate(today);
	};

	const hoverMouseOn = useCallback((item: Column) => {
		setHoveredDate({ hovered: true, date: item.date, tasks: item.tasks });
	}, []);
	const hoverMouseOff = useCallback(() => {
		setHoveredDate({ hovered: false, date: '', tasks: [] });
	}, []);

	return {
		selectedDateIsToday,
		hoveredDate,
		today,
		week,
		calendarRows,
		selectedDate,
		getPrevMonth,
		getNextMonth,
		geCurrentMonth,
		hoverMouseOn,
		hoverMouseOff,
	};
};

export const useWeek = () => {
	const { tasks } = useAppSelector(selectTasks);
	const [hoveredDate, setHoveredDate] = useState({ hovered: false, date: '', tasks: [] as ITask[] });
	const week = useMemo(() => ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], []);
	const today = useMemo(() => new Date(), []);
	const weekDays = useMemo(() => [1, 2, 3, 4, 5, 6, 0], []);
	const [selectedDate, setSelectedDate] = useState(today);
	const startingPoint = useMemo(() => weekDays.indexOf(selectedDate.getDay()) + 1, [selectedDate, weekDays]);

	const calendarRows = useMemo(() => [] as WeekColumn[], []);
	const condition = useCallback(
		(dayDate: string) => {
			const filteredTasks = tasks.filter((item) => !item.isArchived && item.endDate > 0);
			return filteredTasks.filter((task) => new Date(task.endDate).toDateString() === new Date(dayDate).toDateString());
		},
		[tasks]
	);

	const loopWeek = useCallback(() => {
		for (let i = 0; i < 7; i++) {
			let date: string;
			let monthDay: number;
			let dt:Date
			if (i < startingPoint) {
				const diff = startingPoint - i - 1;
				dt = new Date(selectedDate);
				dt.setDate(dt.getDate() - diff);
			} else if (i === startingPoint) {
				dt = new Date(selectedDate);
				dt.setDate(dt.getDate() + 1);
			} else {
				const diff = i - startingPoint + 1;
				dt = new Date(selectedDate);
				dt.setDate(dt.getDate() + diff);
			}
			date = `${new Date(dt).getMonth() + 1}/${new Date(dt).getDate()}/${new Date(dt).getFullYear()}`;
			monthDay = new Date(dt).getDate();
			calendarRows[i] = {
				day: `${week[i]}`,
				date: date,
				monthDay,
				value: i,
				tasks: condition(date),
			};
		}
	}, [calendarRows, condition, selectedDate, startingPoint, week]);

	loopWeek();

	const selectedDateIsToday = () => {
		return new Date(selectedDate).toDateString() === new Date().toDateString();
	};

	const getPrevWeek = () => {
		setSelectedDate(() => {
			if (selectedDateIsToday()) return today;
			const dt = new Date(selectedDate);
			dt.setDate(dt.getDate() - 7);
			return new Date(dt);
		});
	};

	const getNextWeek = () => {
		setSelectedDate(() => {
			const dt = new Date(selectedDate);
			dt.setDate(dt.getDate() + 7);
			return new Date(dt);
		});
	};

	const geCurrentWeek = () => {
		setSelectedDate(today);
	};

	return { selectedDateIsToday, selectedDate, calendarRows, getPrevWeek, getNextWeek, geCurrentWeek };
};
