import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';
import cn from 'classnames';
import styles from './ProjectModalDropdownListItem.module.scss';
import { IoCheckmarkOutline } from 'react-icons/io5';

interface ProjectModalDropdownListItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement> {
	item: { color: string; alias: string; hex: string };
	selected: string;
	clickFn: () => void;
}

const ProjectModalDropdownListItem: FC<ProjectModalDropdownListItemProps> = ({
	clickFn,
	selected,
	item,
	className,
	...props
}) => {
	const icon = useMemo(() => <IoCheckmarkOutline />, []);
	return (
		<li className={cn(className, styles.projectModalDropdownListItem)} data-testid={''} onClick={clickFn} {...props}>
			<span className={styles.colorDot} style={{ backgroundColor: item.hex }} />
			<span className={styles.alias}>{item.alias}</span>
			{item.hex === selected && <span className={styles.checkmark}>{icon}</span>}
		</li>
	);
};

export default React.memo(ProjectModalDropdownListItem);
