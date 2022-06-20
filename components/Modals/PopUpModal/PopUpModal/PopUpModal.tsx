import React, { FC, DetailedHTMLProps, HTMLAttributes, useRef, useMemo } from 'react';
import cn from 'classnames';
import styles from './PopUpModal.module.scss';
import { useModalPortal, usePopUpModal } from '../../../../hooks/modals';
import { uuid } from '../../../../helpers/helpers';
import { createPortal } from 'react-dom';
import ProjectSelect from '../ProjectSelect/ProjectSelect';
import { ITask } from '../../../../types/task';
import PrioritySelect from '../PrioritySelect/PrioritySelect';
import ProjectSelectNoSec from '../ProjectSelectNoSec/ProjectSelectNoSec';
import DateSelect from '../DateSelect/DateSelect';
import { ModalPopUpType } from '../../../../store/slices/PopupModalSlice';

interface PopUpModalProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const PopUpModal: FC<PopUpModalProps> = ({ className, ...props }) => {
	const genId = useRef(uuid());
	const { loaded, id, user } = useModalPortal(`popUpPortal-${genId.current}`);
	const { refContentModal, refOverlay, popUpModal, selectedItem } = usePopUpModal();

	const typeOfContent = useMemo(() => {
		if (popUpModal.modalType === ModalPopUpType.projectSelect) {
			return <ProjectSelect selectedItem={selectedItem as ITask} />;
		} else if (popUpModal.modalType === ModalPopUpType.prioritySelect) {
			return <PrioritySelect selectedItem={selectedItem as ITask} />;
		} else if (popUpModal.modalType === ModalPopUpType.projectSectionSelect) {
			return <ProjectSelectNoSec />;
		} else if (popUpModal.modalType === ModalPopUpType.dateSelect) {
			return <DateSelect selectedItem={selectedItem as ITask} />;
		}
	}, [popUpModal.modalType, selectedItem]);

	return loaded && popUpModal.show ? (
		<>
			{createPortal(
				<div
					className={cn(className, styles.popUpModal)}
					data-testid={''}
					{...props}
					data-theme={user.theme}
					ref={refOverlay}
				>
					<div className={styles.wrapper}>
						<div
							className={styles.content}
							style={{
								visibility: popUpModal.show ? 'visible' : 'hidden',
								opacity: popUpModal.show ? 1 : 0,
								left: popUpModal.show ? `${popUpModal.left}px` : 0,
								top: popUpModal.show ? `${popUpModal.top}px` : 0,
							}}
							ref={refContentModal}
						>
							{typeOfContent}
						</div>
					</div>
				</div>,
				document.getElementById(id)!
			)}
		</>
	) : null;
};

export default PopUpModal;
