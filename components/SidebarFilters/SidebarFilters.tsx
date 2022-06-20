import React, { FC, DetailedHTMLProps, HTMLAttributes, useCallback } from 'react';
import cn from 'classnames';
import styles from './SidebarFilters.module.scss';
import * as Io from 'react-icons/io5';
import { IProject } from '../../types/projects';
import SidebarListItemDefault from '../ListItems/SidebarListItemDefault/SidebarListItemDefault';

interface SidebarFiltersProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	projects: IProject[];
}

const SidebarFilters: FC<SidebarFiltersProps> = ({ projects, className, ...props }) => {
	const icon = useCallback((index: number) => {
		const iconObj: { [key: number]: React.ReactNode } = {
			0: <Io.IoDocumentTextOutline />,
			1: <Io.IoTodayOutline />,
			2: <Io.IoAppsOutline />,
		};
		return iconObj[index];
	}, []);

	return (
		<div className={cn(className, styles.sidebarFilters)} data-testid={''} {...props}>
			<ul>
				{projects.map((item, i) => {
					return (
						<SidebarListItemDefault
							key={item.id}
							tooltipText={`Перейти к ${item.projectName}`}
							projectItem={item}
							icon={icon(i)}
						/>
					);
				})}
			</ul>
		</div>
	);
};

export default React.memo(SidebarFilters);
