import React, { FC, DetailedHTMLProps, HTMLAttributes } from 'react';
import cn from 'classnames';
import styles from './ProjectModalInput.module.scss';
import { useAppDispatch } from '../../../hooks/reduxTK';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';

interface ProjectModalInputProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	labelFor: string;
	labelText: string;
	maxLength: number;
	value: string;
	setValue: ActionCreatorWithPayload<string, string>;
	disable: boolean;
}

const ProjectModalInput: FC<ProjectModalInputProps> = ({
	setValue,
	disable,
	labelFor,
	labelText,
	maxLength,
	value,
	className,
	...props
}) => {
	const dispatch = useAppDispatch();
	return (
		<div className={cn(className, styles.projectModalInput)} data-testid={''} {...props}>
			<label htmlFor={labelFor} className={styles.label}>
				{labelText}
			</label>
			{maxLength - value.length < 15 && <div className={styles.charLength}>{`${value.length}/${maxLength}`}</div>}
			<input
				type='text'
				id={labelFor}
				name={labelFor}
				className={styles.input}
				maxLength={maxLength}
				autoComplete='off'
				onChange={(e) => dispatch(setValue(e.target.value))}
				value={value}
				minLength={1}
				disabled={disable}
			/>
		</div>
	);
};

export default React.memo(ProjectModalInput);
