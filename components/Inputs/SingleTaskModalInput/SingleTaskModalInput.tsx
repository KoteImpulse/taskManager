import React, { FC, DetailedHTMLProps, HTMLAttributes, useState, useCallback, useRef, useEffect } from 'react';
import cn from 'classnames';
import styles from './SingleTaskModalInput.module.scss';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { useAppDispatch } from '../../../hooks/reduxTK';

interface SingleTaskModalInputProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	disable: boolean;
	labelText: string;
	maxLength: number;
	value: string;
	setValue: ActionCreatorWithPayload<string, string>;
	fontWeight: number;
	fontSize: number;
}
const SingleTaskModalInput: FC<SingleTaskModalInputProps> = ({
	value,
	fontSize,
	fontWeight,
	setValue,
	labelText,
	maxLength,
	disable,
	className,
	...props
}) => {
	const dispatch = useAppDispatch();
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
	const autoGrow = useCallback(() => {
		if (!textAreaRef.current) return;
		textAreaRef.current.style.height = `${5}px`;
		textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
	}, []);
	useEffect(() => {
		autoGrow();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<div className={cn(className, styles.singleTaskModalInput)} data-testid={''} {...props}>
			<textarea
				onInput={autoGrow}
				// onBlur={autoGrow}
				placeholder={labelText}
				className={styles.input}
				maxLength={maxLength}
				autoComplete='off'
				onChange={(e) => dispatch(setValue(e.target.value))}
				value={value}
				minLength={1}
				disabled={disable}
				ref={textAreaRef}
				style={{ fontWeight, fontSize }}
			/>
			{maxLength - value.length < 15 && (
				<div className={styles.charLength}>{`Лимит ${maxLength < 700 ? `названия` : `описания`} ${
					value.length
				}/${maxLength}`}</div>
			)}
		</div>
	);
};

export default React.memo(SingleTaskModalInput);
