import React, { DetailedHTMLProps, HTMLAttributes, useMemo, forwardRef, ForwardedRef, useCallback, useRef } from 'react';
import cn from 'classnames';
import styles from './SidebarListItemDefault.module.scss';
import { IProject } from '../../../types/projects';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxTK';
import { projectSlice, selectProject } from '../../../store/slices/ProjectSlice';
import { useRouter } from 'next/router';
import { selectProjects } from '../../../store/slices/ProjectsSlice';
import { tooltipModalSlice } from '../../../store/slices/TooltipModalSlice';

interface SidebarListItemDefaultProps extends DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement> {
	projectItem: IProject;
	tooltipText: string;
	icon?: React.ReactNode;
}

const SidebarListItemDefault = (
	{ projectItem, icon, tooltipText, className, ...props }: SidebarListItemDefaultProps,
	ref: ForwardedRef<HTMLLIElement>
) => {
	const dispatch = useAppDispatch();
	const prItem = useMemo(() => projectItem, [projectItem]);
	const hoverRefDiv = useRef<HTMLDivElement>(null);
	const router = useRouter();

	const mouseEnters = useCallback(
		(event: React.MouseEvent) => {
			if (!hoverRefDiv.current) return;
			const coords = hoverRefDiv.current!.getBoundingClientRect();
			dispatch(
				tooltipModalSlice.actions.setTooltipModal({
					show: true,
					text: tooltipText ? tooltipText : '',
					height: coords.height,
					width: coords.width,
					x: event.clientX,
					y: coords.y,
					top: coords.y + coords.height + 5,
					left: event.clientX,
				})
			);
		},
		[dispatch, tooltipText]
	);
	const mouseLeaves = useCallback(() => {
		dispatch(tooltipModalSlice.actions.closeTooltipModal());
	}, [dispatch]);

	const { projects } = useAppSelector(selectProjects);
	const { project } = useAppSelector(selectProject);

	const clickHandler = useCallback(() => {
		const selectedProject = projects.find((item) => item.id === prItem?.id);
		if (JSON.stringify(project) === JSON.stringify(selectedProject)) return;
		dispatch(projectSlice.actions.setProject(selectedProject as IProject));
		router.push(`/project/${prItem?.id}`, undefined, { shallow: true });
	}, [dispatch, project, prItem?.id, projects, router]);

	return (
		<li
			className={cn(className, styles.sidebarListItem)}
			data-testid={''}
			{...props}
			onMouseEnter={mouseEnters}
			onMouseLeave={mouseLeaves}
			ref={ref}
			id={prItem.id}
		>
			<div className={styles.wrapper} ref={hoverRefDiv}>
				<div
					className={cn(styles.content, {
						[styles.active]:router.query.project &&  prItem.id === router.query.project[0],
					})}
				>
					<span className={styles.linkItem} onClick={clickHandler}>
						<span className={styles.projectIcon} style={{ color: prItem.color }}>
							{icon}
						</span>
						<span className={styles.projectName}>{prItem.projectName}</span>
					</span>
				</div>
			</div>
		</li>
	);
};

export default React.memo(forwardRef(SidebarListItemDefault));
