import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './CheckModalForm.module.scss';
import ProjectModalButton from '../../Buttons/ProjectModalButton/ProjectModalButton';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { checkModalSlice, selectCheckModal } from '../../../store/slices/CheckModalSlice';

interface CheckModalFormProps extends DetailedHTMLProps<HTMLAttributes<HTMLFormElement>, HTMLFormElement> {}

const CheckModalFormForm: FC<CheckModalFormProps> = ({ className, ...props }) => {
	const dispatch = useAppDispatch();
	const { checkModal } = useAppSelector(selectCheckModal);
	const closeCheckModal = useCallback(() => dispatch(checkModalSlice.actions.closeCheckModal()), [dispatch]);
	const disableButton = useMemo(() => checkModal.disable, [checkModal.disable]);
	
	const submitCheckModal = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			dispatch(checkModalSlice.actions.setCheckModal({ ...checkModal, disable: true }));
			if (checkModal.show && checkModal.cbFunc !== null) {
				await checkModal?.cbFunc();
			}
		},
		[checkModal, dispatch]
	);

	return (
		<form className={cn(className, styles.formContent)} onSubmit={(e) => submitCheckModal(e)} data-testid={''} {...props}>
			<section className={styles.content}>
				<div className={styles.textContent}>
					<span className={styles.text}>{checkModal.text}</span>
				</div>
			</section>
			<footer className={styles.buttons}>
				<ProjectModalButton
					typeButton={'button'}
					ariaLabel={`Отмена`}
					textButton={`Отмена`}
					clickFn={closeCheckModal}
					disable={checkModal.disable as boolean}
				/>
				<ProjectModalButton
					typeButton={'submit'}
					ariaLabel={checkModal.buttonText as string}
					textButton={checkModal.buttonText as string}
					disable={disableButton as boolean}
				/>
			</footer>
		</form>
	);
};
export default React.memo(CheckModalFormForm);
