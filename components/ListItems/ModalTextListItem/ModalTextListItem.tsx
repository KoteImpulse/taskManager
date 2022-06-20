import React, { FC, DetailedHTMLProps, HTMLAttributes } from 'react';
import cn from 'classnames';
import styles from './ModalTextListItem.module.scss';

interface ModalTextListItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement> {
	text: string;
	clickFn: (e:any) => void;
	icon?: React.ReactNode;
}

const ModalTextListItem: FC<ModalTextListItemProps> = ({ clickFn, text, icon, className, ...props }) => {
	return (
		<li className={cn(className, styles.modalTextListItem)} data-testid={''} onClick={clickFn} {...props}>
			<div className={styles.container}>
				{icon && <div className={styles.icon}>{icon}</div>}
				<span className={styles.text}>{text}</span>
			</div>
		</li>
	);
};

export default React.memo(ModalTextListItem);
