import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './DateSelect.module.scss';
import { IoCalendarClearOutline, IoSunnyOutline, IoBedOutline, IoCalendarOutline, IoCloseOutline } from 'react-icons/io5';
import DateSelectButtonListItem from '../../../ListItems/DateSelectButtonListItem/DateSelectButtonListItem';
import { useAppDispatch, useAppSelector } from '../../../../hooks/reduxTK';
import { useDateHelp } from '../../../../hooks/dateHelp';
import { ITask } from '../../../../types/task';
import DatePicker from '../../../DatePicker/DatePicker';
import { dateToTime } from '../../../../helpers/helpers';
import { ModalPopUpTypeWhere, popupModalSlice, selectPopupModal } from '../../../../store/slices/PopupModalSlice';
import { taskModalSlice } from '../../../../store/slices/TaskModalSlice';
import { toastModalSlice } from '../../../../store/slices/ToastModalSlice';
import { doc, updateDoc } from 'firebase/firestore';
import db from '../../../../firebase';
import { contextModalSlice } from '../../../../store/slices/ContextModalSlice';
import { tooltipModalSlice } from '../../../../store/slices/TooltipModalSlice';

interface DateSelectProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	selectedItem: ITask;
}

const DateSelect: FC<DateSelectProps> = ({ selectedItem, className, ...props }) => {
	const { popUpModal } = useAppSelector(selectPopupModal);
	const dispatch = useAppDispatch();

	const { today, tomorrow, weekend, weekStart } = useDateHelp();

	const todayIcon = useMemo(() => <IoCalendarClearOutline />, []);
	const tomorrowIcon = useMemo(() => <IoSunnyOutline />, []);
	const weekendIcon = useMemo(() => <IoBedOutline />, []);
	const mondayIcon = useMemo(() => <IoCalendarOutline />, []);
	const cancelIcon = useMemo(() => <IoCloseOutline />, []);

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
		(date: number | Date) => {
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
		<div className={cn(className, styles.dateSelect)} data-testid={''} {...props}>
			<div className={styles.listItems}>
				<DateSelectButtonListItem
					color='var(--today-color)'
					icon={todayIcon}
					text={`Сегодня`}
					dayOfWeek={today.toLocaleDateString('ru', { weekday: 'short' })}
					dayOfMonth={today.getDate()}
					onClick={() => onClickHandler(today)}
				/>
				<DateSelectButtonListItem
					color='var(--tomorrow-color)'
					icon={tomorrowIcon}
					text={`Завтра`}
					dayOfWeek={tomorrow?.toLocaleDateString('ru', { weekday: 'short' })}
					onClick={() => onClickHandler(tomorrow as Date)}
				/>
				<DateSelectButtonListItem
					color='var(--inbox-color)'
					icon={weekendIcon}
					text={`На выходных`}
					dayOfWeek={weekend?.toLocaleDateString('ru', { weekday: 'short' })}
					onClick={() => onClickHandler(weekend as Date)}
				/>
				<DateSelectButtonListItem
					color='var(--next-week-color)'
					icon={mondayIcon}
					text={`На след. неделе`}
					dayOfWeek={`${weekStart?.toLocaleDateString('ru', { weekday: 'short', day: '2-digit', month: 'long' })}`}
					onClick={() => onClickHandler(weekStart as Date)}
				/>
				<DateSelectButtonListItem color='gray' icon={cancelIcon} text={`Без срока`} onClick={() => onClickHandler(0)} />

				<div className={styles.withoutEndDateBtn}></div>
			</div>
			<DatePicker className={styles.calendar} selectedItem={selectedItem} />
			<div className={styles.addTime}></div>
		</div>
	);
};

export default React.memo(DateSelect);
