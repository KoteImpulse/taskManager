import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, MutableRefObject, useCallback, useRef, useEffect } from 'react';
import cn from 'classnames';
import styles from './SidebarProjectList.module.scss';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxTK';
import { IProject } from '../../types/projects';
import CollapseProjectButton from '../Buttons/CollapseProjectButton/CollapseProjectButton';
import { selectUser } from '../../store/slices/UserSlice';
import SidebarListItem from '../ListItems/SidebarListItem/SidebarListItem';
import { motion, Variants } from 'framer-motion';
import ActionButton from '../Buttons/ActionButton/ActionButton';
import { IoAddOutline } from 'react-icons/io5';
import { ContentType, contextModalSlice, ModalType } from '../../store/slices/ContextModalSlice';
import { projectModalSlice, ProjectModalType } from '../../store/slices/ProjectModalSlice';
import { doc, updateDoc } from 'firebase/firestore';
import db from '../../firebase';
import { toastModalSlice } from '../../store/slices/ToastModalSlice';
import { tooltipModalSlice } from '../../store/slices/TooltipModalSlice';
import { selectTasks } from '../../store/slices/TasksSlice';
import { selectProject } from '../../store/slices/ProjectSlice';

interface SidebarProjectListProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	projects: IProject[];
	contentType: ContentType;
	shouldAddButton?: boolean;
}

const heightVariants: Variants = {
	opened: { height: 'auto', transition: { duration: 0.4 } },
	closed: { height: 0, transition: { duration: 0.4 } },
};

const SidebarProjectList: FC<SidebarProjectListProps> = ({ contentType, projects, shouldAddButton, className, ...props }) => {
	const { user } = useAppSelector(selectUser);
	const dispatch = useAppDispatch();
	const { tasks } = useAppSelector(selectTasks);
	const { project } = useAppSelector(selectProject);
	const refListItem = useRef<Array<HTMLLIElement | null>>([]);
	const listRef = useRef<HTMLUListElement>(null);

	useEffect(() => {
		if (!listRef.current || !refListItem.current) return;
		const list = listRef.current;

		function contextMenuClick(event: MouseEvent) {
			event.preventDefault();
			const item = refListItem?.current?.find((item) => item?.contains(event.target as HTMLUListElement));
			if (item?.id) {
				const coords = item.getBoundingClientRect();
				dispatch(
					contextModalSlice.actions.setContextMenuModal({
						id: item.id,
						x: event.clientX,
						y: event.clientY,
						height: coords.height,
						width: coords.width,
						show: true,
						left: event.clientX,
						top: event.clientY + 15,
						modalType: ModalType.project,
						contentType: contentType,
					})
				);
			}
		}

		list.addEventListener('contextmenu', contextMenuClick);

		return () => {
			list.removeEventListener('contextmenu', contextMenuClick);
		};
	}, [contentType, dispatch, project.order, tasks]);

	const listName = useMemo(() => {
		if (
			contentType === ContentType.archived ||
			contentType === ContentType.standart ||
			contentType === ContentType.favorite
		) {
			const name = {
				[ContentType.favorite]: 'Избранное',
				[ContentType.archived]: 'Архив',
				[ContentType.standart]: 'Проекты',
			};
			return name[contentType];
		}
	}, [contentType]);

	const isCollapsed = useMemo(() => {
		if (
			contentType === ContentType.archived ||
			contentType === ContentType.standart ||
			contentType === ContentType.favorite
		) {
			const collapsed = {
				[ContentType.favorite]: user.isFavOpen,
				[ContentType.archived]: user.isArchivedOpen,
				[ContentType.standart]: user.isProjectsOpen,
			};
			return collapsed[contentType];
		}
	}, [contentType, user.isArchivedOpen, user.isFavOpen, user.isProjectsOpen]);

	const addIcon = useMemo(() => <IoAddOutline />, []);

	const openModalProjectAdd = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			dispatch(
				projectModalSlice.actions.setProjectModal({
					type: ProjectModalType.add,
					show: true,
					color: '#ff8d85',
					isFavorite: false,
					projectDescription: '',
					projectName: '',
					id: null,
				})
			);
		},
		[dispatch]
	);

	const changeCollapsed = useCallback(
		async (contentType: ContentType) => {
			dispatch(tooltipModalSlice.actions.closeTooltipModal());
			try {
				const userRef = doc(db, 'users', user.uid);
				if (contentType === ContentType.favorite) {
					await updateDoc(userRef, {
						isFavOpen: !user.isFavOpen,
					});
				} else if (contentType === ContentType.standart) {
					await updateDoc(userRef, {
						isProjectsOpen: !user.isProjectsOpen,
					});
				} else if (contentType === ContentType.archived) {
					await updateDoc(userRef, {
						isArchivedOpen: !user.isArchivedOpen,
					});
				}
			} catch (e) {
				console.log(e);
				dispatch(toastModalSlice.actions.setToastModalError());
			}
		},
		[dispatch, user.isArchivedOpen, user.isFavOpen, user.isProjectsOpen, user.uid]
	);

	return (
		<div className={cn(className, styles.sidebarProjectList)} data-testid={''} {...props} aria-label={listName}>
			<div className={styles.buttons}>
				<CollapseProjectButton
					isCollapsed={isCollapsed as boolean}
					text={listName as string}
					ariaLabel={`Кнопка ${listName}`}
					disable={false}
					clickFn={() => changeCollapsed(contentType)}
				/>
				{shouldAddButton && (
					<ActionButton
						className={styles.addButton}
						ariaLabel={`Открыть окно создания проекта`}
						tooltipText={`Открыть окно создания проекта`}
						icon={addIcon}
						disable={false}
						clickFn={(e) => openModalProjectAdd(e)}
						fontSize={24}
					/>
				)}
			</div>
			<motion.div
				className={styles.collapse}
				animate={isCollapsed ? 'closed' : 'opened'}
				initial={false}
				variants={heightVariants}
			>
				<ul ref={listRef} className={styles.listItems}>
					{projects.map((item) => {
						return (
							<SidebarListItem
								key={item.id}
								projectItem={item}
								ref={(el: HTMLLIElement) => {
									if (!refListItem?.current.includes(el) && el !== null) {
										return (refListItem as MutableRefObject<Array<HTMLLIElement | null>>).current.push(el);
									}
								}}
								contentType={contentType}
							/>
						);
					})}
				</ul>
			</motion.div>
		</div>
	);
};

export default React.memo(SidebarProjectList);
