import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';
import cn from 'classnames';
import styles from './Sidebar.module.scss';
import { useAppSelector } from '../../hooks/reduxTK';
import { selectProjects } from '../../store/slices/ProjectsSlice';
import SidebarFilters from '../SidebarFilters/SidebarFilters';
import SidebarProjectList from '../SidebarProjectList/SidebarProjectList';
import { ContentType } from '../../store/slices/ContextModalSlice';

interface SidebarProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const Sidebar: FC<SidebarProps> = ({ className, ...props }) => {
	const { projects } = useAppSelector(selectProjects);

	const defProjects = useMemo(() => {
		return projects.filter((item) => item.order < 0);
	}, [projects]);
	const favProjects = useMemo(() => {
		return projects.filter((item) => item.order >= 0 && item.isFavorite && !item.isArchived);
	}, [projects]);
	const allProjects = useMemo(() => {
		return projects.filter((item) => item.order >= 0 && !item.isArchived);
	}, [projects]);
	const archivedProjects = useMemo(() => {
		return projects.filter((item) => item.order >= 0 && item.isArchived);
	}, [projects]);

	return (
		<div className={cn(className, styles.sidebar)} data-testid={''} {...props}>
			<SidebarFilters projects={defProjects} />
			<SidebarProjectList projects={favProjects} contentType={ContentType.favorite} />
			<SidebarProjectList projects={allProjects} contentType={ContentType.standart} shouldAddButton />
			<SidebarProjectList projects={archivedProjects} contentType={ContentType.archived} />
		</div>
	);
};

export default React.memo(Sidebar);
