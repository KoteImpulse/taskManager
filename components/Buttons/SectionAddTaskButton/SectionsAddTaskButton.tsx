import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';
import cn from 'classnames';
import styles from './SectionsAddTaskButton.module.scss';
import { IoAddOutline } from 'react-icons/io5';

interface SectionAddTaskButtonProps extends DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	disable: boolean;
	clickFn: () => void;
	text: string
}
const SectionAddTaskButton: FC<SectionAddTaskButtonProps> = ({ text,clickFn, disable, className, ...props }) => {
	const addTaskIcon = useMemo(() => <IoAddOutline />, []);
	return (
		<button
			className={cn(className, styles.sectionAddTaskButton, { [styles.disable]: disable })}
			data-testid={''}
			aria-label={text}
			{...props}
			disabled={disable}
			type='button'
			onClick={clickFn}
		>
			<span className={styles.icon}>{addTaskIcon}</span>
			<span className={styles.text}>{text}</span>
		</button>
	);
};

export default React.memo(SectionAddTaskButton);
