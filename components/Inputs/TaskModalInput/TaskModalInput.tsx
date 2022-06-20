import React, { FC, DetailedHTMLProps, HTMLAttributes, useState, useRef, useCallback, useEffect } from 'react';
import cn from 'classnames';
import styles from './TaskModalInput.module.scss';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { useAppDispatch } from '../../../hooks/reduxTK';

interface TaskModalInputProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	disable: boolean;
	labelFor: string;
	labelText: string;
	maxLength: number;
	value: string;
	setValue: ActionCreatorWithPayload<string, string>;
}
const TaskModalInput: FC<TaskModalInputProps> = ({
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
		<div className={cn(className, styles.taskModalInput)} data-testid={''} {...props}>
			<textarea
				onInput={autoGrow}
				onBlur={autoGrow}
				placeholder={labelText}
				className={styles.input}
				maxLength={maxLength}
				autoComplete='off'
				onChange={(e) => dispatch(setValue(e.target.value))}
				value={value}
				minLength={1}
				disabled={disable}
				ref={textAreaRef}
			/>
			{maxLength - value.length < 15 && (
				<div className={styles.charLength}>{`Лимит ${maxLength < 700 ? `названия` : `описания`} ${
					value.length
				}/${maxLength}`}</div>
			)}
		</div>
	);
};

export default React.memo(TaskModalInput);
