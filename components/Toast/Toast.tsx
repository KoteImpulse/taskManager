import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';
import { IoClose } from 'react-icons/io5';
import { useToastLogic } from '../../hooks/modals';
import { IToast } from '../../store/slices/ToastModalSlice';
import styles from './Toast.module.scss';

interface ToastProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	toasts: IToast[];
	setToasts: React.Dispatch<React.SetStateAction<IToast[]>>;
	id: string;
	text: string;
	mode: string;
	title?: string;
	canClose: boolean;
	autoClose: boolean;
	autoCloseTime: number;
	showProgress: boolean;
	pauseOnHover: boolean;
	pauseOnOutFocus: boolean;
}

const Toast: FC<ToastProps> = ({
	autoClose,
	showProgress,
	pauseOnHover,
	pauseOnOutFocus,
	autoCloseTime,
	id,
	toasts,
	setToasts,
	canClose,
	mode,
	title,
	text,
	className,
	...props
}) => {
	const classes = useMemo(() => [styles.toast, styles[mode]].join(' '), [mode]);
	const closeIcon = useMemo(() => <IoClose />, []);

	const { progressBarRef, toastRef, removeToast } = useToastLogic(
		id,
		setToasts,
		toasts,
		autoClose,
		autoCloseTime,
		pauseOnHover,
		pauseOnOutFocus,
	);

	return (
		<div
			ref={toastRef}
			className={classes}
			data-testid={''}
			{...props}
			onClick={canClose ? () => removeToast(id) : () => ({})}
		>
			{canClose && (
				<button className={styles.closeButton} onClick={() => removeToast(id)}>
					{closeIcon}
				</button>
			)}
			<div className={styles.textContainer}>
				{title && <p className={styles.title}>{title}</p>}
				<p className={styles.text}>{text}</p>
			</div>
			{showProgress && (
				<div className={styles.progressBar}>
					<div className={styles.progress} ref={progressBarRef}></div>
				</div>
			)}
		</div>
	);
};

export default Toast;
