import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';
import cn from 'classnames';
import styles from './PrioritySelectListItem.module.scss';
import { useAppSelector } from '../../../hooks/reduxTK';
import { IoCheckmarkOutline, IoFlag } from 'react-icons/io5';
import { ITask } from '../../../types/task';
import { selectTaskModal, TaskModalType, TaskModalTypeWhere } from '../../../store/slices/TaskModalSlice';

interface PrioritySelectListItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement> {
	priority: number;
	selectedItem?: ITask;
	clickFn: () => void;
}
const PrioritySelectListItem: FC<PrioritySelectListItemProps> = ({ clickFn, priority, selectedItem, className, ...props }) => {
	const { taskModal } = useAppSelector(selectTaskModal);
	const chechIcon = useMemo(() => <IoCheckmarkOutline />, []);
	const flagIcon = useMemo(() => <IoFlag />, []);
	const condition = useMemo(
		() =>
			taskModal.typeWhere !== TaskModalTypeWhere.down &&
			taskModal.typeWhere !== TaskModalTypeWhere.up &&
			taskModal.typeWhere !== TaskModalTypeWhere.subTask &&
			taskModal.type !== TaskModalType.edit,
		[taskModal.type, taskModal.typeWhere]
	);
	return (
		<li className={cn(className, styles.prioritySelectListItem)} data-testid={''} onClick={clickFn} {...props}>
			<div className={styles.content}>
				<span className={styles.flagIcon} data-priority={priority}>
					{flagIcon}
				</span>
				<span className={styles.text}>{`Приоритет ${priority}`}</span>
				{((priority === selectedItem?.priority && condition) || taskModal.priority === priority) && (
					<span className={styles.chechIcon}>{chechIcon}</span>
				)}
			</div>
		</li>
	);
};

export default React.memo(PrioritySelectListItem);
