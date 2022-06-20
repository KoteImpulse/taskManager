import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import cn from 'classnames';
import styles from './ColorPicker.module.scss';
import ColorPickerButton from '../Buttons/ColorPickerButton/ColorPickerButton';
import { useAppDispatch } from '../../hooks/reduxTK';
import ProjectModalDropdownListItem from '../ListItems/ProjectModalDropdownListItem/ProjectModalDropdownListItem';
import { projectModalSlice } from '../../store/slices/ProjectModalSlice';

interface ColorPickerProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	disable: boolean;
	projectColor: string;
}

const ColorPicker: FC<ColorPickerProps> = ({ projectColor, disable, className, ...props }) => {
	const [dropDown, setDropDown] = useState(false);
	const dispatch = useAppDispatch();
	const colors = useMemo(
		() => [
			{ color: 'pink', alias: 'Розовый', hex: '#ff8d85' },
			{ color: 'light-pink', alias: 'Ярко-розовый', hex: '#e05194' },
			{ color: 'green', alias: 'Зеленый', hex: '#299438' },
			{ color: 'grey', alias: 'Серый', hex: '#b8b8b8' },
			{ color: 'mint', alias: 'Мятный', hex: '#6accbc' },
			{ color: 'yellow', alias: 'Желтый', hex: '#fad000' },
			{ color: 'blue', alias: 'Синий', hex: '#4073ff' },
		],
		[]
	);
	const selectedItem = useMemo(() => colors.find((item) => item.hex === projectColor), [colors, projectColor]);
	const clickHandler = useCallback(() => {
		setDropDown(dropDown ? false : true);
	}, [dropDown]);
	const clickListItemHandler = useCallback(
		(hex: string) => {
			dispatch(projectModalSlice.actions.setProjectModalColor(hex));
			setDropDown(false);
		},
		[dispatch]
	);

	return (
		<div className={cn(className, styles.colorPicker)} data-testid={''} {...props}>
			<label className={styles.label}>{`Выбрать цвет`}</label>
			<ColorPickerButton
				ariaLabel={`Выбрать цвет`}
				hex={selectedItem ? selectedItem.hex : colors[0].hex}
				alias={selectedItem ? selectedItem.alias : colors[0].alias}
				clickFn={clickHandler}
				disable={disable}
			/>
			<div
				className={cn(styles.dropdown, {
					[styles.show]: dropDown,
					[styles.hide]: !dropDown,
				})}
			>
				<ul className={styles.dropdownListItems}>
					{dropDown &&
						colors.map((item) => {
							return (
								<ProjectModalDropdownListItem
									key={item.hex}
									clickFn={() => clickListItemHandler(item.hex)}
									selected={projectColor || colors[0].hex}
									item={item}
								/>
							);
						})}
				</ul>
			</div>
		</div>
	);
};

export default React.memo(ColorPicker);
