import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';
import cn from 'classnames';
import styles from './TaskModalProjectButton.module.scss';

interface TaskModalProjectButtonProps extends DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	clickFn: (e: any) => void;
	projectName: string;
	projectDestination: string;
	sectionName: string;
	projectColor: string;
}

const TaskModalProjectButton: FC<TaskModalProjectButtonProps> = ({
	projectName,
	projectDestination,
	sectionName,
	projectColor,
	clickFn,
	className,
	...props
}) => {
	const buttonText = useMemo(
		() => projectName !== null && projectDestination && projectName,
		[projectName, projectDestination]
	);
	const buttonText2 = useMemo(() => sectionName !== null && sectionName, [sectionName]);
	const buttonColor = useMemo(() => projectColor !== null && projectColor, [projectColor]);

	return (
		<button
			className={cn(className, styles.taskModalProjectButton)}
			data-testid={''}
			aria-label={'Выбрать проект'}
			{...props}
			disabled={false}
			type='button'
			onClick={clickFn}
		>
			<div className={styles.text}>
				<div className={styles.dot}>
					<span className={styles.projectDot} style={{ backgroundColor: buttonColor as string }} />
				</div>
				<div className={styles.projectName}>
					<span className={styles.innerTExt}>{buttonText}</span>
				</div>
				{buttonText2 && (
					<>
						<span className={styles.delimetr}>/</span>
						<div className={styles.sectionName}>
							<span className={styles.innerTExt}>{buttonText2}</span>
						</div>
					</>
				)}
			</div>
		</button>
	);
};

export default React.memo(TaskModalProjectButton);
