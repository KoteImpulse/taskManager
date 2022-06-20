import React, { FC, DetailedHTMLProps, HTMLAttributes, useRef } from 'react';
import cn from 'classnames';
import styles from './CheckModal.module.scss';
import { createPortal } from 'react-dom';
import { uuid } from '../../../helpers/helpers';
import { useModalPortal } from '../../../hooks/modals';
import { useAppSelector } from '../../../hooks/reduxTK';
import CheckModalFormForm from '../../Forms/CheckModalForm/CheckModalForm';
import { selectCheckModal } from '../../../store/slices/CheckModalSlice';

interface CheckModalProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const CheckModal: FC<CheckModalProps> = ({ className, ...props }) => {
	const genId = useRef(uuid());
	const { loaded, id, user } = useModalPortal(`checkPortal-${genId.current}`);
	const { checkModal} = useAppSelector(selectCheckModal);

	return loaded && checkModal.show ? (
		<>
			{createPortal(
				<div className={cn(className, styles.checkModal)} data-testid={''} {...props} data-theme={user.theme}>
					<div className={styles.wrapper}>
						<div className={styles.content}>
							<header className={styles.modalHeader}>
								<div className={styles.textContainer}>
									<h1 className={styles.headerText}>{`Подтверждение действия`}</h1>
								</div>
								<div className={styles.link}>
									<span className={styles.icon}>{'icon'}</span>
								</div>
							</header>
							<CheckModalFormForm />
						</div>
					</div>
				</div>,
				document.getElementById(id)!
			)}
		</>
	) : null;
};

export default CheckModal;
