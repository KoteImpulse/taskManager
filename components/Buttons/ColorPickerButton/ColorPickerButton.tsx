import React, { FC, DetailedHTMLProps, HTMLAttributes } from 'react';
import styles from './ColorPickerButton.module.scss';
import cn from 'classnames';

interface ColorPickerButtonProps extends DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	ariaLabel: string;
	hex: string;
	alias: string;
	disable: boolean;
	clickFn:()=>void
}

const ColorPickerButton: FC<ColorPickerButtonProps> = ({ clickFn,disable, className, ariaLabel, hex, alias, ...props }) => {
	return (
		<button
			className={cn(styles.colorPickerButton, {
				[styles.disable]: disable,
			})}
			type='button'
			data-testid={''}
			aria-label={ariaLabel}
			{...props}
			onClick={clickFn}
			disabled={disable}
			
		>
			<span className={styles.colorDot} style={{ backgroundColor: hex }} />
			<span className={styles.alias}>{alias}</span>
		</button>
	);
};

export default React.memo(ColorPickerButton);
