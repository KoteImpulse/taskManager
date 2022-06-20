import React, { FC, DetailedHTMLProps, HTMLAttributes, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import cn from 'classnames';
import styles from './TolltipModal.module.scss';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { getTooltipCoords, uuid } from '../../../helpers/helpers';
import { useModalPortal } from '../../../hooks/modals';
import { selectTooltipModal, tooltipModalSlice } from '../../../store/slices/TooltipModalSlice';

interface TolltipModalProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const TolltipModal: FC<TolltipModalProps> = ({ className, ...props }) => {
	const genId = useRef(uuid());
	const { loaded, id, user } = useModalPortal(`tooltipPortal-${genId.current}`);
	const { tooltipModal } = useAppSelector(selectTooltipModal);
	const dispatch = useAppDispatch();
	const refTooltip = useRef<HTMLDivElement>(null);
	let xPosition = useRef(0);
	let yPosition = useRef(0);

	useEffect(() => {
		if (!refTooltip.current) return;
		if (!tooltipModal.show || tooltipModal.show === null) return;
		const tooltipCoords = getTooltipCoords(
			refTooltip,
			tooltipModal.x as number,
			tooltipModal.y as number,
			tooltipModal.width as number,
			tooltipModal.height as number,
			xPosition,
			yPosition
		);
		if (tooltipCoords.xPosition.current === tooltipModal.left && tooltipCoords.yPosition.current === tooltipModal.top) {
			return;
		} else {
			dispatch(
				tooltipModalSlice.actions.setTooltipModal({
					...tooltipModal,
					left: tooltipCoords.xPosition.current,
					top: tooltipCoords.yPosition.current,
				})
			);
		}
	}, [dispatch, tooltipModal, tooltipModal.show]);

	return loaded ? (
		<>
			{createPortal(
				<div
					className={cn(styles.tolltipModal, {
						[styles.hidden]: !tooltipModal.show,
						[styles.show]: tooltipModal.show,
					})}
					data-theme={user.theme}
					style={{
						left: tooltipModal?.left as number,
						top: tooltipModal?.top as number,
					}}
					{...props}
					ref={refTooltip}
				>
					{tooltipModal.text}
				</div>,
				document.getElementById(id)!
			)}
		</>
	) : null;
};

export default TolltipModal;
