import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useEffect, useRef, useCallback } from 'react';
import cn from 'classnames';
import styles from './CollapseProjectButton.module.scss';
import * as Io from 'react-icons/io5';
import { useAppDispatch } from '../../../hooks/reduxTK';
import { tooltipModalSlice } from '../../../store/slices/TooltipModalSlice';

interface CollapseProjectButtonProps extends DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	ariaLabel: string;
	disable: boolean;
	isCollapsed: boolean;
	text: string;
	clickFn: () => void;
}
const CollapseProjectButton: FC<CollapseProjectButtonProps> = ({
	isCollapsed,
	clickFn,
	text,
	disable,
	ariaLabel,
	className,
	...props
}) => {
	const dispatch = useAppDispatch();
	const icon = useMemo(() => (isCollapsed ? <Io.IoChevronForwardOutline /> : <Io.IoChevronDownOutline />), [isCollapsed]);
	const tooltipText = useMemo(() => (isCollapsed ? `Развернуть список` : `Свернуть список`), [isCollapsed]);
	const hoverRefButton = useRef<HTMLButtonElement>(null);
	const mouseEnters = useCallback(
		(event: React.MouseEvent) => {
			if (!hoverRefButton.current) return;
			let coords;
			coords = hoverRefButton.current!.getBoundingClientRect();
			dispatch(
				tooltipModalSlice.actions.setTooltipModal({
					show: true,
					text: tooltipText,
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
			className={cn(className, styles.collapseProjectButton, {})}
			data-testid={''}
			aria-label={ariaLabel}
			onMouseEnter={(e) => mouseEnters(e)}
			onMouseLeave={mouseLeaves}
			ref={hoverRefButton}
			disabled={disable}
			{...props}
			type='button'
			onClick={clickFn}
		>
			<div className={styles.container}>
				<span className={styles.icon}>{icon}</span>
				<span className={styles.text}>{text}</span>
			</div>
		</button>
	);
};

export default React.memo(CollapseProjectButton);
