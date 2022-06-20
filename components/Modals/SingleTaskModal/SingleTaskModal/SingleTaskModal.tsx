import React, { FC, DetailedHTMLProps, HTMLAttributes, useRef } from 'react';
import cn from 'classnames';
import styles from './SingleTaskModal.module.scss';
import { useModalPortal } from '../../../../hooks/modals';
import { uuid } from '../../../../helpers/helpers';
import { createPortal } from 'react-dom';
import { useAppSelector } from '../../../../hooks/reduxTK';
import { useRouter } from 'next/router';
import { selectSections } from '../../../../store/slices/SectionsSlice';
import SingleTaskHeader from '../../../Headers/SingleTaskHeader/SingleTaskHeader';
import SingleTaskContent from '../SingleTaskContent/SingleTaskContent';
import { useSingleTaskData } from '../../../../hooks/firebaseData';

interface SingleTaskModalProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const SingleTaskModal: FC<SingleTaskModalProps> = ({ className, ...props }) => {
	const router = useRouter();
	const genId = useRef(uuid());
	const { loaded, id, user } = useModalPortal(`singleTaskPortal-${genId.current}`);
	const { task } = useSingleTaskData();
	const { sections } = useAppSelector(selectSections);

	const modalContent =
		(router.query.project &&
			router.query.project[1] === 'task' &&
			!!router.query.task &&
			router.route === `/project/[...project]`) ||
		(router.query.project &&
			router.query.project[1] === 'task' &&
			!!router.query.project[2] &&
			router.route === `/project/[...project]`) ? (
			<div className={cn(className, styles.singleTaskModal)} data-testid={''} {...props} data-theme={user.theme}>
				<div className={styles.wrapper}>
					<div className={styles.content}>
						<SingleTaskHeader
							task={task}
							sectionName={sections.find((item) => item.id === task.sectionId)?.sectionName || ''}
						/>
						<SingleTaskContent />
					</div>
				</div>
			</div>
		) : null;

	return loaded ? <>{createPortal(modalContent, document.getElementById(id)!)}</> : null;
};

export default React.memo(SingleTaskModal);
