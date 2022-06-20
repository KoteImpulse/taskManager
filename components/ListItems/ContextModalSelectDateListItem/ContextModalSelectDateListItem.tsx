import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './ContextModalSelectDateListItem.module.scss';
import { ITask } from '../../../types/task';
import {
	IoCalendarClearOutline,
	IoSunnyOutline,
	IoBedOutline,
	IoCalendarOutline,
	IoEllipsisHorizontalOutline,
} from 'react-icons/io5';
import ActionButton from '../../Buttons/ActionButton/ActionButton';
import { useDateHelp } from '../../../hooks/dateHelp';
import { dateToTime } from '../../../helpers/helpers';
import { ModalPopUpType, ModalPopUpTypeWhere, popupModalSlice } from '../../../store/slices/PopupModalSlice';
import { useAppDispatch } from '../../../hooks/reduxTK';
import { contextModalSlice } from '../../../store/slices/ContextModalSlice';
import { tooltipModalSlice } from '../../../store/slices/TooltipModalSlice';
import { doc, updateDoc } from 'firebase/firestore';
import { toastModalSlice } from '../../../store/slices/ToastModalSlice';
import db from '../../../firebase';

interface ContextModalSelectDateListItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement> {
	selectedItem: ITask;
}

const ContextModalSelectDateListItem: FC<ContextModalSelectDateListItemProps> = ({ selectedItem, className, ...props }) => {
	const todayIcon = useMemo(() => <IoCalendarClearOutline />, []);
	const tomorrowIcon = useMemo(() => <IoSunnyOutline />, []);
	const weekendIcon = useMemo(() => <IoBedOutline />, []);
	const mondayIcon = useMemo(() => <IoCalendarOutline />, []);
	const restIcon = useMemo(() => <IoEllipsisHorizontalOutline />, []);

	const { today, tomorrow, weekend, weekStart } = useDateHelp();
	const dispatch = useAppDispatch();
	const openPopUpModal = useCallback(
		(event: React.MouseEvent, id: string, modalType: ModalPopUpType, modalTypeWhere: ModalPopUpTypeWhere) => {
			event.stopPropagation();
			if (modalType) {
				dispatch(
					popupModalSlice.actions.setPopUpModal({
						id: id,
						x: event.clientX,
						y: event.clientY,
						height: 0,
						width: 0,
						show: true,
						left: event.clientX,
						top: event.clientY + 15,
						modalType,
						modalTypeWhere,
					})
				);
			}
		},
		[dispatch]
	);
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
	const arr = useMemo(
		() => [
			{ id: 1, tooltipText: `Сегодня`, icon: todayIcon, color: `var(--today-color)`, date: today },
			{ id: 2, tooltipText: `Завтра`, icon: tomorrowIcon, color: `var(--tomorrow-color)`, date: tomorrow },
			{ id: 3, tooltipText: `На выходных`, icon: weekendIcon, color: `var(--inbox-color)`, date: weekend },
			{ id: 4, tooltipText: `На следующей неделе`, icon: mondayIcon, color: `var(--next-week-color)`, date: weekStart },
		],
		[mondayIcon, today, todayIcon, tomorrow, tomorrowIcon, weekStart, weekend, weekendIcon]
	);
	return (
		<li className={cn(className, styles.contextModalSelectDateListItem)} data-testid={''} {...props}>
			<div className={styles.labelText}>
				<span className={styles.text}>Срок выполнения</span>
			</div>
			<div className={styles.buttons}>
				{arr.map((item) => (
					<ActionButton
						key={item.id}
						ariaLabel={`Выбрать дату`}
						className={cn(styles.dateButton)}
						icon={item.icon}
						disable={false}
						fontSize={20}
						tooltipText={item.tooltipText}
						withTooltip={true}
						style={{ color: item.color }}
						clickFn={() => setDateEndTask(selectedItem as ITask, dateToTime(item.date as Date).dateMs)}
					/>
				))}
				<ActionButton
					ariaLabel={`Выбрать дату`}
					className={cn(styles.dateButton)}
					icon={restIcon}
					disable={false}
					fontSize={20}
					tooltipText={`Доп. параметры`}
					withTooltip={true}
					clickFn={(e) =>
						openPopUpModal(e, selectedItem?.id as string, ModalPopUpType.dateSelect, ModalPopUpTypeWhere.quick)
					}
				/>
			</div>
		</li>
	);
};

export default React.memo(ContextModalSelectDateListItem);
