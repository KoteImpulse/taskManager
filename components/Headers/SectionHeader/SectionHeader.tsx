import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './SectionHeader.module.scss';
import ActionButton from '../../Buttons/ActionButton/ActionButton';
import * as Io from 'react-icons/io5';
import { ISection } from '../../../types/sections';
import { ITask } from '../../../types/task';
import SectionForm from '../../Forms/SectionForm/SectionForm';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { selectProject } from '../../../store/slices/ProjectSlice';
import { ContentType, contextModalSlice, ModalType } from '../../../store/slices/ContextModalSlice';
import { sectionEditModalSlice, SectionEditModalType, selectSectionEditModal } from '../../../store/slices/SectionEditModalSlice';
import { doc, updateDoc } from 'firebase/firestore';
import db from '../../../firebase';
import { toastModalSlice } from '../../../store/slices/ToastModalSlice';

interface SectionHeaderProps extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
	section?: ISection;
	tasks?: ITask[];
}

const SectionHeader: FC<SectionHeaderProps> = ({ section, tasks, className, ...props }) => {
	const dispatch = useAppDispatch();
	const { project } = useAppSelector(selectProject);
	const { sectionEditModal } = useAppSelector(selectSectionEditModal);

	const restIcon = useMemo(() => <Io.IoEllipsisHorizontalOutline />, []);
	const collapseIcon = useMemo(
		() => (section?.isCollapsed ? <Io.IoChevronForwardOutline /> : <Io.IoChevronDownOutline />),
		[section?.isCollapsed]
	);
	const ariaLabelText = useMemo(
		() => (section?.isCollapsed ? 'Разввернуть список' : 'Свернуть список'),
		[section?.isCollapsed]
	);
	const contentType = useMemo(() => (section?.isArchived ? ContentType.archived : ContentType.standart), [section?.isArchived]);
	const tasksNumber = useMemo(
		() => (!project.isArchived && tasks && tasks?.filter((item) => !item.isArchived).length) || 0,
		[project.isArchived, tasks]
	);

	const openContextMenuModal = useCallback(
		(event: React.MouseEvent, id: string, modalType: ModalType, contentType: ContentType) => {
			event.stopPropagation();
			if (modalType) {
				dispatch(
					contextModalSlice.actions.setContextMenuModal({
						id: id,
						x: event.clientX,
						y: event.clientY,
						height: 0,
						width: 0,
						show: true,
						left: event.clientX,
						top: event.clientY + 15,
						modalType: modalType,
						contentType: contentType,
					})
				);
			}
		},
		[dispatch]
	);
	const openSectionEditModalEdit = useCallback(
		(event: React.MouseEvent, section: ISection) => {
			event.stopPropagation();
			dispatch(
				sectionEditModalSlice.actions.setSectionEditModal({
					id: section.id,
					show: true,
					type: SectionEditModalType.edit,
					sectionName: section.sectionName,
					projectId: section.projectId,
					userId: section.userId,
					order: section.order,
				})
			);
		},
		[dispatch]
	);
	const changeCollapsed = useCallback(
		async (section: ISection) => {
			try {
				const sectionRef = doc(db, 'sections', section.id);
				await updateDoc(sectionRef, {
					isCollapsed: section.isCollapsed ? false : true,
				});
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			}
		},
		[dispatch]
	);

	const showSectionEditModal = useMemo(() => {
		if (section) {
			return (
				sectionEditModal.show &&
				sectionEditModal.id === section?.id &&
				sectionEditModal.type === SectionEditModalType.edit
			);
		} else {
			return sectionEditModal.show && sectionEditModal.id === '' && sectionEditModal.type === SectionEditModalType.edit;
		}
	}, [section, sectionEditModal.id, sectionEditModal.show, sectionEditModal.type]);

	return (
		<header className={cn(className, styles.sectionHeader)} data-testid={''} {...props}>
			{!showSectionEditModal ? (
				<>
					<div className={styles.buttons}>
						{!project.isArchived && tasks && tasks.length > 0 && (
							<ActionButton
								ariaLabel={ariaLabelText}
								withTooltip={false}
								icon={collapseIcon}
								disable={project.isArchived}
								clickFn={(e) => changeCollapsed(section as ISection)}
								fontSize={14}
							/>
						)}
					</div>
					<div className={cn(styles.textWrapper)}>
						<span
							className={cn(styles.text, { [styles.archived]: section?.isArchived })}
							onClick={(e) => (section?.isArchived ? {} : openSectionEditModalEdit(e, section as ISection))}
						>
							{section?.sectionName}
						</span>
						{tasksNumber > 0 && <small className={styles.tasks}>{` осталось задач: ${tasksNumber}`}</small>}
					</div>
					<div className={styles.restButton}>
						{!project.isArchived && (
							<ActionButton
								disable={project.isArchived}
								ariaLabel='Действия в разделе'
								tooltipText={'Действия в разделе'}
								icon={restIcon}
								clickFn={(e) => openContextMenuModal(e, section?.id as string, ModalType.section, contentType)}
							/>
						)}
					</div>
				</>
			) : (
				<div className={styles.editSectionForm}>
					<SectionForm />
				</div>
			)}
		</header>
	);
};

export default React.memo(SectionHeader);
