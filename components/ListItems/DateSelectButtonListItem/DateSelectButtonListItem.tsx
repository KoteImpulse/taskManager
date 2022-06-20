import React, { FC, DetailedHTMLProps, HTMLAttributes } from 'react';
import cn from 'classnames';
import styles from './DateSelectButtonListItem.module.scss';
import ActionButton from '../../Buttons/ActionButton/ActionButton';

interface DateSelectButtonListItemProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	icon: React.ReactNode;
	text: string;
	color: string;
	dayOfWeek?: string;
	dayOfMonth?: number;
}

const DateSelectButtonListItem: FC<DateSelectButtonListItemProps> = ({
	dayOfMonth,
	color,
	text,
	dayOfWeek,
	icon,
	className,
	...props
}) => {
	return (
		<div className={cn(className, styles.dateSelectButtonListItem)} data-testid={''} {...props}>
			<div className={styles.content}>
				<div className={styles.btnContainer}>
					<ActionButton
						ariaLabel={`Выбрать дату`}
						icon={icon}
						disable={false}
						fontSize={20}
						withTooltip={false}
						style={{ color }}
					/>
					{dayOfMonth && (
						<span className={styles.text} style={{ color }}>
							{dayOfMonth}
						</span>
					)}
				</div>
				<span className={styles.mainText}>{text}</span>
				{dayOfWeek && <span className={styles.day}>{dayOfWeek}</span>}
			</div>
		</div>
	);
};

export default DateSelectButtonListItem;
