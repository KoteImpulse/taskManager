import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';
import cn from 'classnames';
import styles from './ProjectSelectListItem.module.scss';
import { ISection } from '../../../types/sections';
import { useAppSelector } from '../../../hooks/reduxTK';
import { ITask } from '../../../types/task';
import { IoCheckmarkOutline } from 'react-icons/io5';
import { IProject } from '../../../types/projects';
import { ModalPopUpTypeWhere, selectPopupModal } from '../../../store/slices/PopupModalSlice';
import { selectTaskModal } from '../../../store/slices/TaskModalSlice';

interface ProjectSelectListItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement> {
	type: 'section' | 'project';
	value: string;
	clickFn: () => void;
	selectedItem?: ITask;
	section?: ISection;
	project?: IProject;
}
const ProjectSelectListItem: FC<ProjectSelectListItemProps> = ({
	selectedItem,
	clickFn,
	value,
	project,
	type,
	section,
	className,
	...props
}) => {
	const { popUpModal } = useAppSelector(selectPopupModal);
	const { taskModal } = useAppSelector(selectTaskModal);
	const icon = useMemo(() => <IoCheckmarkOutline />, []);
	return (
		<li className={cn(className, styles.projectSelectListItem)} data-testid={''} onClick={clickFn} {...props}>
			<div className={styles.content}>
				{type === 'section' ? (
					<div className={styles.section}>
						{value.length === 0 ? (
							<>
								<div className={styles.setionNameBlock}>
									<span className={styles.sectionName}>{section?.sectionName}</span>
									{popUpModal.modalTypeWhere === ModalPopUpTypeWhere.add ||
									popUpModal.modalTypeWhere === ModalPopUpTypeWhere.edit
										? taskModal.sectionDestination === section?.id && (
												<span className={styles.checkmark}>{icon}</span>
										  )
										: selectedItem?.sectionId === section?.id && (
												<span className={styles.checkmark}>{icon}</span>
										  )}
								</div>
							</>
						) : (
							<>
								<div className={styles.setionNameBlockNew}>
									<span className={styles.sectionName}>{section?.sectionName}</span>
									{popUpModal.modalTypeWhere === ModalPopUpTypeWhere.add ||
									popUpModal.modalTypeWhere === ModalPopUpTypeWhere.edit
										? taskModal.sectionDestination === section?.id && (
												<span className={styles.checkmark}>{icon}</span>
										  )
										: selectedItem?.sectionId === section?.id && (
												<span className={styles.checkmark}>{icon}</span>
										  )}
								</div>
								<span className={styles.projectName}>{`Проект ${project?.projectName}`}</span>
							</>
						)}
					</div>
				) : (
					<div className={styles.project}>
						<span className={styles.projectDot} style={{ backgroundColor: project?.color }} />
						<span className={styles.projectName}>{project?.projectName}</span>
						{popUpModal.modalTypeWhere === ModalPopUpTypeWhere.add ||
						popUpModal.modalTypeWhere === ModalPopUpTypeWhere.edit
							? taskModal.projectDestination === project?.id && <span className={styles.checkmark}>{icon}</span>
							: selectedItem?.projectId === project?.id && <span className={styles.checkmark}>{icon}</span>}
					</div>
				)}
			</div>
		</li>
	);
};

export default React.memo(ProjectSelectListItem);
