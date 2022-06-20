import React, { FC, DetailedHTMLProps, HTMLAttributes } from 'react';
import cn from 'classnames';
import styles from './SectionAddSectionButton.module.scss';

interface SectionAddSectionButtonProps extends DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	disable: boolean;
	clickFn: (e: any) => void;
}
const SectionAddSectionButton: FC<SectionAddSectionButtonProps> = ({ clickFn, disable, className, ...props }) => {
	return (
		<button
			className={cn(className, styles.sectionAddSectionButton, { [styles.disable]: disable })}
			data-testid={''}
			aria-label={'Добавить раздел'}
			{...props}
			disabled={disable}
			type='button'
			onClick={clickFn}
		>
			<span className={styles.text}>Добавить раздел</span>
		</button>
	);
};

export default React.memo(SectionAddSectionButton);
