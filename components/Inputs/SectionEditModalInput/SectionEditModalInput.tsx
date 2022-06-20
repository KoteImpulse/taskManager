import React, { FC, DetailedHTMLProps, HTMLAttributes, useState } from 'react';
import cn from 'classnames';
import styles from './SectionEditModalInput.module.scss';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { useAppDispatch } from '../../../hooks/reduxTK';

interface SectionEditModalInputProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	disable: boolean;
	labelFor: string;
	labelText: string;
	maxLength: number;
	value: string;
	setValue: ActionCreatorWithPayload<string, string>;
}
const SectionEditModalInput: FC<SectionEditModalInputProps> = ({
	value,
	setValue,
	labelFor,
	labelText,
	maxLength,
	disable,
	className,
	...props
}) => {
	const dispatch = useAppDispatch();
	return (
		<div className={cn(className, styles.sectionEditModalInput)} data-testid={''} {...props}>
			<input
				placeholder={labelText}
				className={styles.input}
				maxLength={maxLength}
				autoComplete='off'
				onChange={(e) => dispatch(setValue(e.target.value))}
				value={value}
				minLength={1}
				disabled={disable}
			/>
			{maxLength - value.length < 15 && (
				<div className={styles.charLength}>{`Лимит названия${value.length}/${maxLength}`}</div>
			)}
		</div>
	);
};

export default React.memo(SectionEditModalInput);
