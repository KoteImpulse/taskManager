import React, { FC, DetailedHTMLProps, HTMLAttributes, useState, useEffect, useRef } from 'react';
import styles from './ToastModal.module.scss';
import { useModalPortal } from '../../../hooks/modals';
import { createPortal } from 'react-dom';
import { uuid } from '../../../helpers/helpers';
import Toast from '../../Toast/Toast';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { IToast, selectToastModal, toastModalSlice } from '../../../store/slices/ToastModalSlice';

interface ToastModalProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	position?: 'bottom-right' | 'bottom-left' | 'top-left' | 'top-right';
}

const ToastModal: FC<ToastModalProps> = ({ position = 'bottom-right', ...props }) => {
	const genId = useRef(uuid());
	const { loaded, id, user } = useModalPortal(`tostPortal-${genId.current}`);
	const { toastModal } = useAppSelector(selectToastModal);
	const dispatch = useAppDispatch();
	const [toasts, setToasts] = useState<IToast[]>([]);

	useEffect(() => {
		if (toastModal.show) {
			setToasts([...toasts, { ...(toastModal as IToast) }]);
			dispatch(toastModalSlice.actions.closeToastModal());
		}
	}, [toastModal.show, toasts]);

	return loaded ? (
		<>
			{createPortal(
				<>
					<div className={styles.toastsContainer} data-position={position} data-theme={user.theme} {...props}>
						{toasts.map((t: IToast) => (
							<Toast
								key={t.id}
								id={t.id}
								text={t.text}
								title={t.title}
								mode={t.mode}
								canClose={t.canClose}
								autoClose={t.autoClose}
								autoCloseTime={t.autoCloseTime}
								showProgress={t.showProgress}
								pauseOnHover={t.pauseOnHover}
								pauseOnOutFocus={t.pauseOnOutFocus}
								toasts={toasts}
								setToasts={setToasts}
							/>
						))}
					</div>
				</>,
				document.getElementById(id)!
			)}
		</>
	) : (
		<></>
	);
};

export default ToastModal;
