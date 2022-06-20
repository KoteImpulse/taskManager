import React, { FC, DetailedHTMLProps, HTMLAttributes, useCallback, useRef } from 'react';
import cn from 'classnames';
import styles from './ActionButton.module.scss';
import { useAppDispatch } from '../../../hooks/reduxTK';
import { tooltipModalSlice } from '../../../store/slices/TooltipModalSlice';

interface ActionButtonProps extends DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	ariaLabel: string;
	disable: boolean;
	icon: React.ReactNode;
	tooltipText?: string;
	fontSize?: number;
	withTooltip?: boolean;
	clickFn?: (e: any) => void;
}
const ActionButton: FC<ActionButtonProps> = ({
	withTooltip = true,
	clickFn,
	fontSize = 20,
	tooltipText,
	icon,
	disable,
	ariaLabel,
	className,
	...props
}) => {
	const dispatch = useAppDispatch();
	const hoverRefButton = useRef<HTMLButtonElement>(null);
	const mouseEnters = useCallback(
		(event: React.MouseEvent) => {
			if (!hoverRefButton.current) return;
			let coords;
			coords = hoverRefButton.current!.getBoundingClientRect();
			dispatch(
				tooltipModalSlice.actions.setTooltipModal({
					show: true,
					text: tooltipText ? tooltipText : '',
					height: coords.height,
					width: coords.width,
					x: event.clientX,
					y: coords.y,
					top: coords.y + coords.height + 5,
					left: event.clientX,
				})
			);
		},
		[dispatch, tooltipText]
	);

	const mouseLeaves = useCallback(() => {
		dispatch(tooltipModalSlice.actions.closeTooltipModal());
	}, [dispatch]);

	return (
		<button
			className={cn(className, styles.actionButton, { [styles.disable]: disable })}
			data-testid={''}
			aria-label={ariaLabel}
			{...props}
			disabled={disable}
			onMouseEnter={(e) => (withTooltip ? mouseEnters(e) : {})}
			onMouseLeave={withTooltip ? mouseLeaves : () => ({})}
			ref={hoverRefButton}
			type='button'
			onClick={clickFn}
		>
			<span className={styles.icon} style={{ fontSize: `${fontSize}px` }}>
				{icon}
			</span>
		</button>
	);
};

export default React.memo(ActionButton);
