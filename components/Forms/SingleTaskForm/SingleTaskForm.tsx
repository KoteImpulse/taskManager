import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './SingleTaskForm.module.scss';
import ProjectModalButton from '../../Buttons/ProjectModalButton/ProjectModalButton';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { doc, writeBatch } from 'firebase/firestore';
import { selectTaskModal, taskModalSlice, TaskModalTypeWhere } from '../../../store/slices/TaskModalSlice';
import db from '../../../firebase';
import { toastModalSlice } from '../../../store/slices/ToastModalSlice';
import SingleTaskModalInput from '../../Inputs/SingleTaskModalInput/SingleTaskModalInput';

interface SingleTaskFormProps extends DetailedHTMLProps<HTMLAttributes<HTMLFormElement>, HTMLFormElement> {}

const SingleTaskForm: FC<SingleTaskFormProps> = ({ className, ...props }) => {
	const dispatch = useAppDispatch();
	const { taskModal } = useAppSelector(selectTaskModal);
	const disableButton = useMemo(() => {
		return !taskModal.taskName || taskModal.taskName.trim().length < 1;
	}, [taskModal.taskName]);

	const closeTaskModal = useCallback(() => dispatch(taskModalSlice.actions.closeTaskModal()), [dispatch]);

	const submitTaskModal = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			dispatch(taskModalSlice.actions.closeTaskModal());
			const batch = writeBatch(db);
			try {
				const taskRef = doc(db, 'tasks', taskModal.id as string);
				batch.update(taskRef, {
					taskName: taskModal.taskName,
					taskDescription: taskModal.taskDescription,
				});
				await batch.commit();
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			}
		},
		[dispatch, taskModal.id, taskModal.taskDescription, taskModal.taskName]
	);
	return (
		<form
			className={cn(className, styles.taskForm, {
				[styles.modal]: taskModal.typeWhere === TaskModalTypeWhere.quick,
				[styles.project]: taskModal.typeWhere !== TaskModalTypeWhere.quick,
			})}
			data-testid={''}
			{...props}
			onSubmit={(e) => submitTaskModal(e)}
		>
			<section className={styles.content}>
				<div className={styles.textInputs}>
					<SingleTaskModalInput
						value={taskModal.taskName || ''}
						setValue={taskModalSlice.actions.setTaskModalName}
						labelText={`Название задачи`}
						maxLength={500}
						disable={false}
						fontWeight={600}
						fontSize={20}
					/>
					<SingleTaskModalInput
						value={taskModal.taskDescription || ''}
						setValue={taskModalSlice.actions.setTaskModalDesc}
						labelText={`Описание задачи`}
						maxLength={2000}
						disable={false}
						fontWeight={400}
						fontSize={14}
					/>
				</div>
			</section>
			<footer className={styles.buttons}>
				<ProjectModalButton
					typeButton={'button'}
					ariaLabel={`Отмена`}
					textButton={`Отмена`}
					clickFn={closeTaskModal}
					disable={false}
				/>
				<ProjectModalButton
					typeButton={'submit'}
					ariaLabel={'Сохранить'}
					textButton={'Сохранить'}
					disable={disableButton}
				/>
			</footer>
		</form>
	);
};

export default React.memo(SingleTaskForm);
