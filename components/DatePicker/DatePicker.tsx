import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './DatePicker.module.scss';
import ActionButton from '../Buttons/ActionButton/ActionButton';
import { IoChevronBackOutline, IoChevronForwardOutline, IoEllipseOutline } from 'react-icons/io5';
import { Column, useCalendar } from '../../hooks/dateHelp';
import { ITask } from '../../types/task';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxTK';
import { dateToTime } from '../../helpers/helpers';
import { ModalPopUpTypeWhere, popupModalSlice, selectPopupModal } from '../../store/slices/PopupModalSlice';
import { taskModalSlice } from '../../store/slices/TaskModalSlice';
import { contextModalSlice } from '../../store/slices/ContextModalSlice';
import { tooltipModalSlice } from '../../store/slices/TooltipModalSlice';
import { doc, updateDoc } from 'firebase/firestore';
import db from '../../firebase';
import { toastModalSlice } from '../../store/slices/ToastModalSlice';

interface DatePickerProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	selectedItem: ITask;
}

const DatePicker: FC<DatePickerProps> = ({ selectedItem, className, ...props }) => {
	const backIcon = useMemo(() => <IoChevronBackOutline />, []);
	const middleIcon = useMemo(() => <IoEllipseOutline />, []);
	const nextIcon = useMemo(() => <IoChevronForwardOutline />, []);
	const {
		hoveredDate,
		selectedDateIsToday,
		week,
		selectedDate,
		calendarRows,
		getPrevMonth,
		getNextMonth,
		geCurrentMonth,
		hoverMouseOn,
		hoverMouseOff,
	} = useCalendar();

	const { popUpModal } = useAppSelector(selectPopupModal);
	const dispatch = useAppDispatch();

	const setDateEndTask = useCallback(
		async (task: ITask, date: number) => {
			dispatch(popupModalSlice.actions.closePopUpModal());
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			dispatch(tooltipModalSlice.actions.closeTooltipModal());
			try {
				const laRef = doc(db, 'tasks', task.id);
				await updateDoc(laRef, { endDate: date });
				dispatch(
					toastModalSlice.actions.setToastModalSuccess(
						`Срок выполнения изменен на ${new Date(date).toLocaleDateString('ru', {
							day: '2-digit',
							month: 'long',
						})}`
					)
				);
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			} finally {
			}
		},
		[dispatch]
	);

	const onClickHandler = useCallback(
		(date: number | string) => {
			let dt: number;
			if (date !== 0) {
				dt = dateToTime(date).dateMs;
			} else {
				dt = 0;
			}
			if (ModalPopUpTypeWhere.quick === popUpModal.modalTypeWhere) {
				setDateEndTask(selectedItem, dt);
			} else {
				dispatch(taskModalSlice.actions.setTaskModalEndDate(dt));
				dispatch(popupModalSlice.actions.closePopUpModal());
			}
		},
		[dispatch, popUpModal.modalTypeWhere, selectedItem, setDateEndTask]
	);

	return (
		<div className={cn(className, styles.datePicker)} data-testid={''} {...props}>
			<div className={styles.header}>
				<span className={styles.monthText}>
					{selectedDate.toLocaleDateString('ru', { month: 'long', year: 'numeric' })}
				</span>
				<div className={styles.controls}>
					<ActionButton
						ariaLabel={`назад`}
						className={cn(styles.backButton)}
						icon={backIcon}
						disable={selectedDateIsToday()}
						fontSize={16}
						withTooltip={false}
						clickFn={(e) => getPrevMonth()}
					/>
					<ActionButton
						ariaLabel={`Текущий день`}
						className={cn(styles.middleButton)}
						icon={middleIcon}
						disable={selectedDateIsToday()}
						fontSize={16}
						withTooltip={false}
						clickFn={(e) => geCurrentMonth()}
					/>
					<ActionButton
						ariaLabel={`вперед`}
						className={cn(styles.nextButton)}
						icon={nextIcon}
						disable={false}
						fontSize={16}
						withTooltip={false}
						clickFn={(e) => getNextMonth()}
					/>
				</div>
			</div>
			<div className={styles.monthListHeader}>
				{!hoveredDate.hovered ? (
					<div className={styles.labelsOfDays}>
						{week.map((item) => (
							<span key={item} className={styles.day}>
								{item}
							</span>
						))}
					</div>
				) : (
					<div className={styles.dayInfo}>
						<span className={styles.date}>
							{new Date(hoveredDate.date).toLocaleDateString('ru', {
								weekday: 'short',
								day: '2-digit',
								month: 'short',
								year: 'numeric',
							})}
						</span>
						<span className={styles.tasks}>
							{hoveredDate.tasks?.length > 0 ? `задач к выполению ${hoveredDate.tasks?.length}` : ''}
						</span>
					</div>
				)}
			</div>
			<div className={styles.calendarWrapper}>
				<div className={styles.month}>
					{Object.values(calendarRows).map((row, i) => {
						return (
							<div key={i} className={styles.week}>
								{row.map((col: Column) => {
									if (col.classes !== '') {
										return (
											<button
												key={col.date}
												className={cn(styles.dayButton, styles.emptyButton)}
												disabled={true}
											></button>
										);
									} else {
										return (
											<button
												key={col.date}
												className={cn(styles.dayButton, {
													[styles.today]: col.today,
													[styles.disable]: !col.disable && !col.today,
													[styles.currentMonth]: col.classes === '',
												})}
												disabled={!col.disable && !col.today}
												onMouseEnter={() => hoverMouseOn(col)}
												onMouseLeave={() => hoverMouseOff()}
												onClick={() => onClickHandler(col.date)}
											>
												<span className={styles.dateText}>{col.value}</span>
											</button>
										);
									}
								})}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default DatePicker;
