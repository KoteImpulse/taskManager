import React, { FC, DetailedHTMLProps, HTMLAttributes } from 'react';
import cn from 'classnames';
import styles from './HideSingleTaskButton.module.scss';

interface HideSingleTaskButtonProps extends DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	isHided: boolean;
	clickFn: () => void;
	disable?: boolean;
}
const HideSingleTaskButton: FC<HideSingleTaskButtonProps> = ({ isHided, clickFn, disable = false, className, ...props }) => {
	return (
		<button
			className={cn(className, styles.hideSingleTaskButton, {})}
			data-testid={''}
			aria-label={`Переключатель состояния`}
			disabled={disable}
			{...props}
			type='button'
			onClick={clickFn}
		>
			<div className={styles.container}>
				<span className={styles.text}>{!isHided ? `Скрыть выполненные` : `Показать выполненные`}</span>
			</div>
		</button>
	);
};

export default React.memo(HideSingleTaskButton);
