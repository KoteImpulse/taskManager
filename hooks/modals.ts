import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getContextMenuModalCoords } from '../helpers/helpers';
import { ContentType, contextModalSlice, ModalType, selectContextModal } from '../store/slices/ContextModalSlice';
import { popupModalSlice, selectPopupModal } from '../store/slices/PopupModalSlice';
import { selectProject } from '../store/slices/ProjectSlice';
import { selectProjects } from '../store/slices/ProjectsSlice';
import { selectSections } from '../store/slices/SectionsSlice';
import { selectTasks } from '../store/slices/TasksSlice';
import { IToast } from '../store/slices/ToastModalSlice';
import { selectTooltipModal, tooltipModalSlice } from '../store/slices/TooltipModalSlice';
import { selectUser } from '../store/slices/UserSlice';
import { ITask } from '../types/task';
import { useAppDispatch, useAppSelector } from './reduxTK';

export const useModalPortal = (id: string) => {
	const [loaded, setLoaded] = useState(false);
	const { user } = useAppSelector(selectUser);

	useEffect(() => {
		const div = document.createElement('div');
		div.setAttribute('id', id);
		const modalParent = document.getElementById('modals');
		modalParent?.append(div);
		setLoaded(true);

		return () => {
			modalParent?.removeChild(div);
		};
	}, [id]);

	return { loaded, id, user };
};

export const useTooltipModal = (text: string, shouldShow: boolean, type: 'button' | 'div') => {
	const dispatch = useAppDispatch();
	const hoverRefButton = useRef<HTMLButtonElement>(null);
	const hoverRefDiv = useRef<HTMLDivElement>(null);
	const { tooltipModal } = useAppSelector(selectTooltipModal);

	const mouseEnters = useCallback(
		(event: React.MouseEvent) => {
			if (!shouldShow) return;
			if (!hoverRefButton.current && type === 'button') return;
			if (!hoverRefDiv.current && type === 'div') return;
			if (tooltipModal.text === text) return;
			let coords;
			coords =
				type === 'button'
					? hoverRefButton.current!.getBoundingClientRect()
					: hoverRefDiv.current!.getBoundingClientRect();
			dispatch(
				tooltipModalSlice.actions.setTooltipModal({
					show: true,
					text: text,
					height: coords.height,
					width: coords.width,
					x: event.clientX,
					y: coords.y,
					top: coords.y + coords.height + 5,
					left: event.clientX,
				})
			);
		},
		[dispatch, shouldShow, text, tooltipModal.text, type]
	);

	const mouseLeaves = useCallback(() => {
		dispatch(tooltipModalSlice.actions.closeTooltipModal());
	}, [dispatch]);

	return type === 'button'
		? { hoverRefButton, mouseEnters, mouseLeaves, tooltipModal, dispatch }
		: { hoverRefDiv, mouseEnters, mouseLeaves, tooltipModal, dispatch };
};

export const useToastLogic = (
	id: string,
	setToasts: React.Dispatch<React.SetStateAction<IToast[]>>,
	toasts: IToast[],
	autoClose: boolean,
	autoCloseTime: number,
	pauseOnHover: boolean,
	pauseOnOutFocus: boolean
) => {
	const progressBarRef = useRef<HTMLDivElement>(null);
	const toastRef = useRef<HTMLDivElement>(null);

	const removeToast = useCallback(
		(id: string) => {
			setToasts(toasts.filter((item) => item.id !== id));
		},
		[setToasts, toasts]
	);

	const timeVisible = useRef(0);
	const isPause = useRef(false);
	const shouldUnPause = useRef(false);

	const setOnPause = useCallback(() => {
		isPause.current = true;
	}, []);
	const setUnPause = useCallback(() => {
		isPause.current = false;
	}, []);
	const changeVisibility = useCallback(() => {
		shouldUnPause.current = document.visibilityState === 'visible';
	}, []);

	useEffect(() => {
		let autoCloseInterval: number;
		if (autoClose === false) return;
		let lastTime: number | null;
		const func = (time: number) => {
			if (shouldUnPause.current) {
				lastTime = null;
				shouldUnPause.current = false;
			}
			if (lastTime == null) {
				lastTime = time;
				autoCloseInterval = requestAnimationFrame(func);
				return;
			}
			if (!isPause.current) {
				timeVisible.current = timeVisible.current + (time - lastTime);
				progressBarRef.current?.style.setProperty('--progress', `${timeVisible.current / autoCloseTime}`);
				if (timeVisible.current >= autoCloseTime) {
					setToasts(toasts.filter((item) => item.id !== id));
					return;
				}
			}
			lastTime = time;
			autoCloseInterval = requestAnimationFrame(func);
		};

		autoCloseInterval = requestAnimationFrame(func);

		return () => cancelAnimationFrame(autoCloseInterval);
	}, [autoClose, autoCloseTime, id, setToasts, toasts]);

	useEffect(() => {
		if (!toastRef.current || !pauseOnHover) return;
		const toast = toastRef.current;

		toast.addEventListener('mouseenter', setOnPause);
		toast.addEventListener('mouseleave', setUnPause);

		return () => {
			toast.removeEventListener('mouseenter', setOnPause);
			toast.removeEventListener('mouseleave', setUnPause);
		};
	}, [pauseOnHover, setOnPause, setUnPause]);

	useEffect(() => {
		if (!toastRef.current || !pauseOnOutFocus) return;

		document.addEventListener('visibilitychange', changeVisibility);

		return () => {
			document.removeEventListener('visibilitychange', changeVisibility);
		};
	}, [setOnPause, setUnPause, pauseOnOutFocus, changeVisibility]);

	return { progressBarRef, toastRef, removeToast };
};

export const useContextMenuModal = () => {
	const dispatch = useAppDispatch();
	const refContentModal = useRef<HTMLDivElement>(null);
	const refOverlay = useRef<HTMLDivElement>(null);
	const { contextMenuModal } = useAppSelector(selectContextModal);
	let xPosition = useRef(0);
	let yPosition = useRef(0);
	const { projects } = useAppSelector(selectProjects);
	const { sections } = useAppSelector(selectSections);
	const { tasks } = useAppSelector(selectTasks);

	useEffect(() => {
		if (!refContentModal) return;
		if (!contextMenuModal.show || contextMenuModal.show === null) return;
		const contextMenuModalCoords = getContextMenuModalCoords(
			refContentModal,
			contextMenuModal.x as number,
			contextMenuModal.y as number,
			contextMenuModal.width as number,
			contextMenuModal.height as number,
			xPosition,
			yPosition
		);

		if (
			contextMenuModalCoords.xPosition.current === contextMenuModal.left &&
			contextMenuModalCoords.yPosition.current === contextMenuModal.top
		) {
			return;
		} else {
			dispatch(
				contextModalSlice.actions.setContextMenuModal({
					...contextMenuModal,
					left: contextMenuModalCoords.xPosition.current,
					top: contextMenuModalCoords.yPosition.current,
				})
			);
		}
	}, [contextMenuModal.show]);

	useEffect(() => {
		if (!refContentModal.current || !refOverlay.current) return;
		const overlay = refOverlay.current;
		const modal = refContentModal.current;
		function contextMenuClick(event: MouseEvent) {
			if (contextMenuModal.show && !refContentModal?.current?.contains(event.target as HTMLUListElement)) {
				dispatch(contextModalSlice.actions.closeContextMenuModal());
			}
		}

		function handleClick(event: MouseEvent) {
			if (
				contextMenuModal.show &&
				refContentModal.current &&
				!refContentModal?.current?.contains(event.target as HTMLUListElement)
			) {
				dispatch(contextModalSlice.actions.closeContextMenuModal());
			}
		}

		function contextMenuClickModal(event: MouseEvent) {
			event.preventDefault();
			if (contextMenuModal.show && modal && modal?.contains(event.target as HTMLUListElement)) {
			}
		}

		modal.addEventListener('contextmenu', contextMenuClickModal);
		overlay.addEventListener('contextmenu', contextMenuClick);
		overlay.addEventListener('click', handleClick);

		return () => {
			modal.removeEventListener('contextmenu', contextMenuClickModal);
			overlay.removeEventListener('contextmenu', contextMenuClick);
			overlay.removeEventListener('click', handleClick);
		};
	}, [contextMenuModal.show, dispatch, refContentModal]);

	return { refContentModal, refOverlay, contextMenuModal,
		//  selectedItem 
		};
};

export const usePopUpModal = () => {
	const dispatch = useAppDispatch();
	const refContentModal = useRef<HTMLDivElement>(null);
	const refOverlay = useRef<HTMLDivElement>(null);
	const { popUpModal } = useAppSelector(selectPopupModal);
	const { tasks } = useAppSelector(selectTasks);
	let xPosition = useRef(0);
	let yPosition = useRef(0);

	const selectedItem = useMemo(() => tasks.find((item) => item.id === popUpModal.id), [popUpModal.id, tasks]);

	useEffect(() => {
		if (!refContentModal) return;
		if (!popUpModal.show || popUpModal.show === null) return;
		const popUpModalCoords = getContextMenuModalCoords(
			refContentModal,
			popUpModal.x as number,
			popUpModal.y as number,
			popUpModal.width as number,
			popUpModal.height as number,
			xPosition,
			yPosition
		);

		if (popUpModalCoords.xPosition.current === popUpModal.left && popUpModalCoords.yPosition.current === popUpModal.top) {
			return;
		} else {
			dispatch(
				popupModalSlice.actions.setPopUpModal({
					...popUpModal,
					left: popUpModalCoords.xPosition.current,
					top: popUpModalCoords.yPosition.current,
				})
			);
		}
	}, [popUpModal.show]);

	useEffect(() => {
		if (!refContentModal.current || !refOverlay.current) return;
		const overlay = refOverlay.current;
		const modal = refContentModal.current;
		function contextMenuClick(event: MouseEvent) {
			if (popUpModal.show && !refContentModal?.current?.contains(event.target as HTMLDivElement)) {
				dispatch(popupModalSlice.actions.closePopUpModal());
			}
		}

		function handleClick(event: MouseEvent) {
			if (
				popUpModal.show &&
				refContentModal.current &&
				!refContentModal?.current?.contains(event.target as HTMLDivElement)
			) {
				dispatch(popupModalSlice.actions.closePopUpModal());
			}
		}

		function contextMenuClickModal(event: MouseEvent) {
			event.preventDefault();
			if (popUpModal.show && modal && modal?.contains(event.target as HTMLDivElement)) {
			}
		}

		modal.addEventListener('contextmenu', contextMenuClickModal);
		overlay.addEventListener('contextmenu', contextMenuClick);
		overlay.addEventListener('click', handleClick);

		return () => {
			modal.removeEventListener('contextmenu', contextMenuClickModal);
			overlay.removeEventListener('contextmenu', contextMenuClick);
			overlay.removeEventListener('click', handleClick);
		};
	}, [popUpModal.show, dispatch, refContentModal]);

	return { refContentModal, refOverlay, popUpModal, selectedItem };
};

export const useListItemsContext = (modalType: ModalType, contentType: ContentType) => {
	const { contextMenuModal } = useAppSelector(selectContextModal);
	const { tasks } = useAppSelector(selectTasks);
	const { project } = useAppSelector(selectProject);
	const refListItem = useRef<Array<HTMLLIElement | null>>([]);
	const listRef = useRef<HTMLUListElement>(null);
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (!listRef.current || !refListItem.current) return;
		const list = listRef.current;

		function contextMenuClick(event: MouseEvent) {
			event.preventDefault();
			const item = refListItem?.current?.find((item) => item?.contains(event.target as HTMLUListElement));
			let content: ContentType;
			if (modalType === ModalType.task) {
				const task = tasks.find((i) => i.id === item?.id) as ITask;
				content = task?.isArchived
					? ContentType.archived
					: project.order !== -2 && project.order !== -3
					? ContentType.standart
					: ContentType.defaultProjects;
			} else {
				content = contentType;
			}
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
						modalType: modalType,
						contentType: content,
					})
				);
			}
		}

		list.addEventListener('contextmenu', contextMenuClick);

		return () => {
			list.removeEventListener('contextmenu', contextMenuClick);
		};
	}, [contentType, dispatch, modalType, project.order, tasks]);

	return { listRef, refListItem, contextMenuModal };
};
