import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';
import cn from 'classnames';
import styles from './CollapseSingleTaskButton.module.scss';
import * as Io from 'react-icons/io5';

interface CollapseSingleTaskButtonProps extends DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	isCollapsed: boolean;
	clickFn: () => void;
	disable?: boolean;
	subtasks: number;
	complited:number
}
const CollapseSingleTaskButton: FC<CollapseSingleTaskButtonProps> = ({
	isCollapsed,subtasks,complited,
	clickFn,
	disable = false,
	className,
	...props
}) => {
	const icon = useMemo(() => (isCollapsed ? <Io.IoChevronForwardOutline /> : <Io.IoChevronDownOutline />), [isCollapsed]);

	return (
		<button
			className={cn(className, styles.collapseSingleTaskButton, {})}
			data-testid={''}
			aria-label={`Переключатель состояния`}
			disabled={disable}
			{...props}
			type='button'
			onClick={clickFn}
		>
			<div className={styles.container}>
				<span className={styles.icon}>{icon}</span>
				<span className={styles.text}>{`Подзадачи ${complited}/${subtasks}`}</span>
			</div>
		</button>
	);
};

export default React.memo(CollapseSingleTaskButton);
