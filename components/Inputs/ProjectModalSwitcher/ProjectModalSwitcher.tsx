import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import cn from 'classnames';
import styles from './ProjectModalSwitcher.module.scss';
import { motion } from 'framer-motion';
import { useAppDispatch } from '../../../hooks/reduxTK';
import { projectModalSlice } from '../../../store/slices/ProjectModalSlice';

interface ProjectModalSwitcherProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	disable: boolean;
	isFavorite: boolean;
}

const ProjectModalSwitcher: FC<ProjectModalSwitcherProps> = ({ isFavorite, disable, className, ...props }) => {
	const dispatch = useAppDispatch();
	const labelText = useMemo(() => (isFavorite ? `Удалить из избранного` : `Добавить в избранное`), [isFavorite]);
	const clickHandler = useCallback(() => {
		disable ? {} : dispatch(projectModalSlice.actions.setProjectModalIsFav(!isFavorite));
	}, [disable, dispatch, isFavorite]);

	return (
		<div className={cn(className, styles.projectModalSwitcher)} data-testid={''} {...props}>
			<label className={styles.label}>{labelText}</label>
			<motion.div
				className={cn(styles.switcher, {
					[styles.on]: isFavorite,
					[styles.off]: !isFavorite,
				})}
				onClick={clickHandler}
				animate
				layout
			>
				<motion.div className={styles.circle} layout animate initial={false} />
			</motion.div>
		</div>
	);
};

export default React.memo(ProjectModalSwitcher);
