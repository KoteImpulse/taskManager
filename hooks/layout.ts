import { doc, updateDoc } from 'firebase/firestore';
import { useRef, useState, useCallback, useEffect } from 'react';
import db from '../firebase';
import { selectToastModal, toastModalSlice } from '../store/slices/ToastModalSlice';
import { selectUser } from '../store/slices/UserSlice';
import { useAppDispatch, useAppSelector } from './reduxTK';

export const useLayout = () => {
	const { user } = useAppSelector(selectUser);
	const dispatch = useAppDispatch();
	const { toastModal } = useAppSelector(selectToastModal);
	const sizerRef = useRef<HTMLDivElement>(null);
	const resizerRef = useRef<HTMLDivElement>(null);
	const dragging = useRef<boolean>(false);

	const [currentSize, setCurrentSize] = useState<number | null>(null);

	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (!dragging.current) {
			return;
		}
		let size;
		if (e.clientX < 210) {
			size = 210;
		} else if (e.clientX > 350) {
			size = 350;
		} else {
			size = e.clientX;
		}
		setCurrentSize(size);
	}, []);

	const handleMouseDown = useCallback((e: MouseEvent) => {
		dragging.current = true;
	}, []);

	const handleMouseUp = useCallback(async (e: MouseEvent) => {
		if (!dragging.current) {
			return;
		}
		if (user.sidebarSize === e.clientX) {
			dragging.current = false;
			return;
		}
		dragging.current = false;
		let size;
		if (e.clientX < 210) {
			size = 210;
		} else if (e.clientX > 350) {
			size = 350;
		} else {
			size = e.clientX;
		}
		try {
			const userRef = doc(db, 'users', user?.uid);
			await updateDoc(userRef, {
				sidebarSize: size,
			});
		} catch (e) {
			console.log(e);
			dispatch(toastModalSlice.actions.setToastModalError());
		}
	}, []);

	useEffect(() => {
		if (!sizerRef) return;
		const resizerRefConst = resizerRef?.current;

		resizerRefConst?.addEventListener('mousedown', handleMouseDown);
		window?.addEventListener('mousemove', handleMouseMove);
		window?.addEventListener('mouseup', handleMouseUp);
		return () => {
			resizerRefConst?.removeEventListener('mousedown', handleMouseDown);
			window?.addEventListener('mousemove', handleMouseMove);
			window?.addEventListener('mouseup', handleMouseUp);
		};
	}, [handleMouseDown, handleMouseMove, handleMouseUp]);

	return { sizerRef, resizerRef, dragging, currentSize, handleMouseMove, handleMouseDown, handleMouseUp };
};
