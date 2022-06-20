import React, { FC, DetailedHTMLProps, HTMLAttributes } from 'react';
import cn from 'classnames';
import styles from './ProjectModalButton.module.scss';

interface ProjectModalButtonProps extends DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	typeButton: string;
	textButton: string;
	ariaLabel: string;
	disable: boolean;
	clickFn?: () => void;
}

const ProjectModalButton: FC<ProjectModalButtonProps> = ({
	clickFn,
	className,
	disable,
	ariaLabel,
	typeButton,
	textButton,
	...props
}) => {
	return (
		<button
			className={cn(className, styles.projectModalButton, {
				[styles.submit]: typeButton === 'submit',
				[styles.disable]: disable,
			})}
			data-testid={''}
			type={typeButton === 'submit' ? 'submit' : 'button'}
			aria-label={ariaLabel}
			disabled={disable}
			{...props}
			onClick={clickFn}
		>
			{textButton}
		</button>
	);
};

export default React.memo(ProjectModalButton);
