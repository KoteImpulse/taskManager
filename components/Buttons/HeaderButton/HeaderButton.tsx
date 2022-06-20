import React, { FC, DetailedHTMLProps, HTMLAttributes, useRef, useCallback } from 'react';
import cn from 'classnames';
import styles from './HeaderButton.module.scss';
import { useAppDispatch } from '../../../hooks/reduxTK';
import { tooltipModalSlice } from '../../../store/slices/TooltipModalSlice';

interface HeaderButtonProps extends DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	ariaLabel: string;
	icon: React.ReactNode;
	text: string;
	clickFn: () => void;
	disable: boolean;
	fontSize?: number;
}

const HeaderButton: FC<HeaderButtonProps> = ({ clickFn, disable, ariaLabel, text, icon, fontSize = 28, className, ...props }) => {
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
					text: text,
					height: coords.height,
					width: coords.width,
					x: event.clientX,
					y: coords.y,
					top: coords.y + coords.height + 5,
					left: event.clientX,
				})
			);
		},
		[dispatch, text]
	);

	const mouseLeaves = useCallback(() => {
		dispatch(tooltipModalSlice.actions.closeTooltipModal());
	}, [dispatch]);

	return (
		<>
			<button
				className={cn(className, styles.headerButton, { [styles.disable]: disable })}
				data-testid={''}
				aria-label={ariaLabel}
				onMouseEnter={(e) => mouseEnters(e)}
				onMouseLeave={mouseLeaves}
				ref={hoverRefButton}
				disabled={disable}
				type='button'
				onClick={clickFn}
				{...props}
			>
				<span className={styles.icon} style={{ fontSize: `${fontSize || 24}px` }}>
					{icon}
				</span>
			</button>
		</>
	);
};

export default React.memo(HeaderButton);
