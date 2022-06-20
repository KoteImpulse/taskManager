import React, {
	FC,
	DetailedHTMLProps,
	HTMLAttributes,
	ReactElement,
	useMemo,
	useRef,
	useState,
	useCallback,
	useEffect,
} from 'react';
import cn from 'classnames';
import styles from './MainLayout.module.scss';
import { useProjects, useSections, useTasks, useUserData } from '../../hooks/firebaseData';
import dynamic from 'next/dynamic';
import Header from '../../components/Header/Header';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar/Sidebar';
import { doc, updateDoc } from 'firebase/firestore';
import db from '../../firebase';
import { useAppDispatch } from '../../hooks/reduxTK';
import { toastModalSlice } from '../../store/slices/ToastModalSlice';
import { useRouter } from 'next/router';

const SingleTaskModal = dynamic(() => import('../../components/Modals/SingleTaskModal/SingleTaskModal/SingleTaskModal'), { ssr: true });
const ContextMenuModal = dynamic(() => import('../../components/Modals/ContextMenuModal/ContextMenuModal'), { ssr: false });
const PopUpModal = dynamic(() => import('../../components/Modals/PopUpModal/PopUpModal/PopUpModal'), { ssr: false });
const ProjectModal = dynamic(() => import('../../components/Modals/ProjectModal/ProjectModal'), { ssr: false });
const TaskModal = dynamic(() => import('../../components/Modals/TaskModal/TaskModal'), { ssr: false });
const ToastModal = dynamic(() => import('../../components/Modals/ToastModal/ToastModal'), { ssr: false });
const TolltipModal = dynamic(() => import('../../components/Modals/TolltipModal/TolltipModal'), { ssr: false });
const CheckModal = dynamic(() => import('../../components/Modals/CheckModal/CheckModal'), { ssr: false });

interface MainLayoutProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	children: React.ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ className, children, ...props }) => {
	console.log('render MainLayout');
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { user } = useUserData();
	const { projects } = useProjects();
	const { sections } = useSections();
	const { tasks } = useTasks();

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

	const handleMouseUp = useCallback(
		async (e: MouseEvent) => {
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
		},
		[dispatch, user.sidebarSize, user?.uid]
	);

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

	const animate = useMemo(
		() => ({
			animateSidebar: user.isSidebarOpen
				? { left: 0, width: dragging && currentSize ? currentSize : user.sidebarSize }
				: { left: -user.sidebarSize, width: 0 },
			animateResizer: user.isSidebarOpen ? { left: dragging && currentSize ? currentSize : user.sidebarSize } : { left: 0 },
			animateMain: user.isSidebarOpen
				? { marginLeft: dragging && currentSize ? currentSize : user.sidebarSize }
				: { marginLeft: 0 },
		}),
		[currentSize, dragging, user.isSidebarOpen, user.sidebarSize]
	);

	return (
		<>
			<div className={styles.background} data-theme={user?.theme}>
				<div className={styles.topbar} aria-label={'Заголовок страницы'}>
					<Header />
				</div>
				<div className={styles.mainBar}>
					<div className={styles.container} {...props}>
						<motion.div
							className={styles.sidebar}
							aria-label={`Боковая панель`}
							ref={sizerRef}
							animate={animate.animateSidebar}
							initial={false}
						>
							<Sidebar />
						</motion.div>
						<motion.div
							className={cn(styles.resizer, { [styles.hidden]: !user.isSidebarOpen })}
							ref={resizerRef}
							animate={animate.animateResizer}
						/>
						<motion.main
							className={styles.mainContent}
							aria-label={'Основной контент'}
							animate={animate.animateMain}
							initial={false}
						>
							{children}
						</motion.main>
					</div>
				</div>
			</div>

			<ContextMenuModal />
			<TolltipModal />
			<ToastModal position='bottom-right' />
			<ProjectModal />
			<CheckModal />
			<TaskModal />
			<PopUpModal />
			<SingleTaskModal />
		</>
	);
};

export const getLayout = (page: ReactElement) => <MainLayout>{page}</MainLayout>;

export default React.memo(MainLayout);
