import React, { FC, DetailedHTMLProps, HTMLAttributes } from 'react';
import cn from 'classnames';
import styles from './ProjectSelectInput.module.scss';

interface ProjectSelectInputProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	setValue: React.Dispatch<React.SetStateAction<string>>;
	value: string;
}

const ProjectSelectInput: FC<ProjectSelectInputProps> = ({ setValue, value, className, ...props }) => {
	return (
		<div className={cn(className, styles.projectSelectInput)} data-testid={''} {...props}>
			<input
				type='text'
				className={styles.input}
				maxLength={100}
				autoComplete='off'
				onChange={(e) => setValue(e.target.value)}
				value={value}
				minLength={1}
				disabled={false}
				placeholder={`Поиск`}
			/>
		</div>
	);
};

export default React.memo(ProjectSelectInput);
