import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './ContextModalSelectPriorityListItem.module.scss';
import ActionButton from '../../Buttons/ActionButton/ActionButton';
import { IoFlag } from 'react-icons/io5';
import { ITask } from '../../../types/task';
import { useAppDispatch } from '../../../hooks/reduxTK';
import { popupModalSlice } from '../../../store/slices/PopupModalSlice';
import { contextModalSlice } from '../../../store/slices/ContextModalSlice';
import { tooltipModalSlice } from '../../../store/slices/TooltipModalSlice';
import { doc, updateDoc } from 'firebase/firestore';
import db from '../../../firebase';
import { toastModalSlice } from '../../../store/slices/ToastModalSlice';

interface ContextModalSelectPriorityListItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement> {
	selectedItem: ITask;
}

const ContextModalSelectPriorityListItem: FC<ContextModalSelectPriorityListItemProps> = ({
	selectedItem,
	className,
	...props
}) => {
	const priorityIcon = useMemo(() => <IoFlag />, []);
	const dispatch = useAppDispatch();
	const arr = useMemo(() => [1, 2, 3, 4], []);
	const setPriorityTask = useCallback(
		async (task: ITask, priority: number) => {
			dispatch(popupModalSlice.actions.closePopUpModal());
			dispatch(contextModalSlice.actions.closeContextMenuModal());
			dispatch(tooltipModalSlice.actions.closeTooltipModal());
			try {
				const laRef = doc(db, 'tasks', task.id);
				await updateDoc(laRef, { priority });
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			}
		},
		[dispatch]
	);
	const clickPriorituItem = useCallback(
		(priority: number) => setPriorityTask(selectedItem, priority),
		[selectedItem, setPriorityTask]
	);
	return (
		<li className={cn(className, styles.contextModalSelectPriorityListItem)} data-testid={''} {...props}>
			<div className={styles.labelText}>
				<span className={styles.text}>Приоритет</span>
			</div>
			<div className={styles.buttons}>
				{arr.map((item) => (
					<ActionButton
						key={item}
						ariaLabel='Задать приоритет'
						icon={priorityIcon}
						className={cn(styles.priorityButton, {
							[styles.active]: selectedItem.priority === item,
						})}
						disable={false}
						tooltipText={`Задать приоритет ${item}`}
						fontSize={20}
						withTooltip={true}
						data-priority={item}
						clickFn={() => clickPriorituItem(item)}
					/>
				))}
			</div>
		</li>
	);
};

export default React.memo(ContextModalSelectPriorityListItem);
