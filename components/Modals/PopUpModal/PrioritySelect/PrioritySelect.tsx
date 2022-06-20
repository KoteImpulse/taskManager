import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './PrioritySelect.module.scss';
import PrioritySelectListItem from '../../../ListItems/PrioritySelectListItem/PrioritySelectListItem';
import { ITask } from '../../../../types/task';
import { useAppDispatch, useAppSelector } from '../../../../hooks/reduxTK';
import { ModalPopUpTypeWhere, popupModalSlice, selectPopupModal } from '../../../../store/slices/PopupModalSlice';
import { taskModalSlice } from '../../../../store/slices/TaskModalSlice';
import { tooltipModalSlice } from '../../../../store/slices/TooltipModalSlice';
import { contextModalSlice, selectContextModal } from '../../../../store/slices/ContextModalSlice';
import { toastModalSlice } from '../../../../store/slices/ToastModalSlice';
import { doc, updateDoc } from 'firebase/firestore';
import db from '../../../../firebase';

interface PrioritySelectProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	selectedItem: ITask;
}

const PrioritySelect: FC<PrioritySelectProps> = ({ selectedItem, className, ...props }) => {
	const { popUpModal } = useAppSelector(selectPopupModal);
	const dispatch = useAppDispatch();

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

	const arr = useMemo(() => [1, 2, 3, 4], []);

	const clickPriorituItem = useCallback(
		(priority: number) => {
			if (popUpModal.modalTypeWhere === ModalPopUpTypeWhere.quick) {
				setPriorityTask(selectedItem, priority);
			} else {
				dispatch(taskModalSlice.actions.setTaskModalPriority(priority));
				dispatch(popupModalSlice.actions.closePopUpModal());
			}
		},
		[dispatch, popUpModal.modalTypeWhere, selectedItem, setPriorityTask]
	);

	return (
		<div className={cn(className, styles.prioritySelect)} data-testid={''} {...props}>
			<ul className={styles.listItems}>
				{arr.map((item) => {
					return (
						<PrioritySelectListItem
							key={item}
							priority={item}
							selectedItem={selectedItem}
							clickFn={() => clickPriorituItem(item)}
						/>
					);
				})}
			</ul>
		</div>
	);
};

export default React.memo(PrioritySelect);
