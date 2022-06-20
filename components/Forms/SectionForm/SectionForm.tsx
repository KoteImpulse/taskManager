import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './SectionForm.module.scss';
import ProjectModalButton from '../../Buttons/ProjectModalButton/ProjectModalButton';
import SectionEditModalInput from '../../Inputs/SectionEditModalInput/SectionEditModalInput';
import { sectionEditModalSlice, SectionEditModalType, selectSectionEditModal } from '../../../store/slices/SectionEditModalSlice';
import { toastModalSlice } from '../../../store/slices/ToastModalSlice';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { selectSections } from '../../../store/slices/SectionsSlice';
import { selectUser } from '../../../store/slices/UserSlice';
import { addDoc, doc, updateDoc, writeBatch, collection } from 'firebase/firestore';
import { ISection } from '../../../types/sections';
import db from '../../../firebase';

interface SectionFormProps extends DetailedHTMLProps<HTMLAttributes<HTMLFormElement>, HTMLFormElement> {}

const SectionForm: FC<SectionFormProps> = ({ className, ...props }) => {
	const dispatch = useAppDispatch();
	const { sections } = useAppSelector(selectSections);
	const { user } = useAppSelector(selectUser);
	const { sectionEditModal } = useAppSelector(selectSectionEditModal);

	const disableButton = useMemo(
		() => !sectionEditModal.sectionName || sectionEditModal.sectionName.trim().length < 1,
		[sectionEditModal.sectionName]
	);
	const buttonText = useMemo(
		() => (sectionEditModal.type === SectionEditModalType.add ? `Добавить раздел` : `Сохранить`),
		[sectionEditModal.type]
	);
	const submitSectionEditModal = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			dispatch(sectionEditModalSlice.actions.closeSectionEditModal());
			const batch = writeBatch(db);
			const addBatch = (arr: ISection[]) => {
				for (let i = 0; i < arr.length; i++) {
					const el = arr[i];
					const laRef = doc(db, 'sections', el.id);
					batch.update(laRef, { order: el.order + 1 });
				}
			};
			const selectedSection = sections.find((item) => item.id === sectionEditModal.id);
			const sectionsInProject = sections.filter((item) => item.projectId === sectionEditModal.projectId);
			if (sectionsInProject.length >= user.numberOfSectionsInProject) {
				dispatch(
					toastModalSlice.actions.setToastModalWarning(
						`Максимум доступно ${user.numberOfSectionsInProject} разделов в проекте`
					)
				);
				return;
			}
			try {
				let order = 1;
				let nextSections: ISection[];
				if (selectedSection) {
					order = selectedSection.order + 1;
					nextSections = sectionsInProject.filter((item) => item.order > selectedSection.order);
				} else {
					nextSections = sectionsInProject;
				}
				if (nextSections.length > 0) {
					addBatch(nextSections);
					await batch.commit();
				}
				if (sectionEditModal.type === SectionEditModalType.add) {
					await addDoc(collection(db, 'sections'), {
						isCollapsed: false,
						isArchived: false,
						isDeleted: false,
						sectionName: sectionEditModal.sectionName,
						order: order,
						projectId: sectionEditModal.projectId,
						userId: sectionEditModal.userId,
					});
				} else {
					const sectionRef = doc(db, 'sections', sectionEditModal.id as string);
					await updateDoc(sectionRef, {
						sectionName: sectionEditModal.sectionName,
					});
				}
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			}
		},
		[
			dispatch,
			sectionEditModal.id,
			sectionEditModal.projectId,
			sectionEditModal.sectionName,
			sectionEditModal.type,
			sectionEditModal.userId,
			sections,
			user.numberOfSectionsInProject,
		]
	);
	const closeSectionEditModal = useCallback(() => dispatch(sectionEditModalSlice.actions.closeSectionEditModal()), [dispatch]);

	return (
		<form
			className={cn(className, styles.sectionForm)}
			data-testid={''}
			{...props}
			onSubmit={(e) => submitSectionEditModal(e)}
		>
			<section className={styles.content}>
				<div className={styles.textInputs}>
					<SectionEditModalInput
						value={sectionEditModal.sectionName || ''}
						setValue={sectionEditModalSlice.actions.setSectionEditModalName}
						labelFor={'sectionName'}
						labelText={`Название раздела`}
						maxLength={50}
						disable={false}
					/>
				</div>
			</section>
			<footer className={styles.buttons}>
				<ProjectModalButton
					typeButton={'button'}
					ariaLabel={`Отмена`}
					textButton={`Отмена`}
					clickFn={closeSectionEditModal}
					disable={false}
				/>
				<ProjectModalButton
					typeButton={'submit'}
					ariaLabel={buttonText}
					textButton={buttonText}
					disable={disableButton}
				/>
			</footer>
		</form>
	);
};

export default React.memo(SectionForm);
