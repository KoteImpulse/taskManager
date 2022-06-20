import { serverTimestamp } from 'firebase/firestore';
import { MutableRefObject, RefObject, useCallback } from 'react';
import { useAppDispatch } from '../hooks/reduxTK';
import { IUser } from '../types/user';
export const setCookie = (name: string, value: string, days: number) => {
	var expires = '';
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = '; expires=' + date.toUTCString();
	}
	document.cookie = `${name}=${value || ''}${expires}; path=/`;
};
export const eraseCookie = (name: string) => {
	document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};
export const fetchValidate = async (token: string | undefined) => {
	const result = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/validate`, {
		headers: {
			'Context-Type': 'application/json',
			Authorization: JSON.stringify({
				token,
			}),
		},
	}).then((res) => res.json());
	return result;
};
export const newUser = () => {
	return {
		theme: 'light',
		sidebarSize: 250,
		startPage: 'today',
		firstName: 'firstName',
		lastName: 'lastName',
		isFavOpen: false,
		isProjectsOpen: true,
		isSidebarOpen: true,
		language: 'RU',
		isArchivedOpen: false,
		numberOfProjects: 5,
		numberOfSectionsInProject: 15,
		numberOfTasksInSection: 100,
	} as IUser;
};
export const defaultProjects = (
	uid: string,
	inboxDesc: string,
	inboxName: string,
	todayDesc: string,
	todayName: string,
	nextWeekDesc: string,
	nextWeekName: string
) => {
	return {
		inbox: {
			isArchived: false,
			isDeleted: false,
			collapsed: false,
			order: -1,
			projectDescription: inboxDesc,
			projectName: inboxName,
			date: serverTimestamp(),
			isFavorite: false,
			userId: uid,
			color: '#6f027f',
			showArchivedTasks: false,
		},
		today: {
			isArchived: false,
			isDeleted: false,
			collapsed: false,
			order: -2,
			projectDescription: todayDesc,
			projectName: todayName,
			date: serverTimestamp(),
			isFavorite: false,
			userId: uid,
			color: '#48c906',
			showArchivedTasks: false,
		},
		nextWeek: {
			isArchived: false,
			isDeleted: false,
			collapsed: false,
			order: -3,
			projectDescription: nextWeekDesc,
			projectName: nextWeekName,
			date: serverTimestamp(),
			isFavorite: false,
			userId: uid,
			color: '#1b0df9',
			showArchivedTasks: false,
		},
	};
};
export const newSection = (userId: string, projectId: string, sectionName?: string, order?: number) => {
	return {
		isCollapsed: false,
		isArchived: false,
		isDeleted: false,
		sectionName: sectionName || `section name ${order || 0}`,
		order: order || 0,
		projectId,
		userId,
	};
};
export const getTooltipCoords = (
	ref: RefObject<HTMLDivElement>,
	x: number,
	y: number,
	widthEl: number,
	heightEl: number,
	xPosition: React.MutableRefObject<number>,
	yPosition: React.MutableRefObject<number>
) => {
	let width = window.innerWidth;
	let height = window.innerHeight;

	let tooltipWidth = ref?.current?.getBoundingClientRect().width;
	let tooltipHeight = ref?.current?.getBoundingClientRect().height;

	if (tooltipWidth && tooltipHeight) {
		if (tooltipHeight + y > height) {
			if (tooltipWidth + x > width) {
				xPosition.current = x - (tooltipWidth + x - width + 10);
			} else {
				xPosition.current = x;
			}
			yPosition.current = y - (tooltipHeight + y - height);
		} else {
			if (tooltipWidth + x > width) {
				xPosition.current = x - (tooltipWidth + x - width + 10);
			} else {
				xPosition.current = x;
			}
			yPosition.current = y + heightEl + 5;
		}
	}
	return { xPosition, yPosition };
};
export const getContextMenuModalCoords = (
	ref: MutableRefObject<HTMLDivElement | null>,
	x: number,
	y: number,
	widthEl: number,
	heightEl: number,
	xPosition: React.MutableRefObject<number>,
	yPosition: React.MutableRefObject<number>
) => {
	let width = window.innerWidth;
	let height = window.innerHeight;

	let contextMenuWidth = ref?.current?.getBoundingClientRect().width;
	let contextMenuHeight = ref?.current?.getBoundingClientRect().height;

	if (contextMenuWidth && contextMenuHeight) {
		if (contextMenuHeight + y > height) {
			if (contextMenuWidth + x > width) {
				xPosition.current = x - (contextMenuWidth + x - width + 10);
			} else {
				xPosition.current = x;
			}
			yPosition.current = y - (contextMenuHeight + y - height);
		} else {
			if (contextMenuWidth + x > width) {
				xPosition.current = x - (contextMenuWidth + x - width + 10);
			} else {
				xPosition.current = x;
			}
			yPosition.current = y + 15;
		}
	}
	return { xPosition, yPosition };
};

export const uuid = (sections = 4, charInSection = 4) => {
	const str = 'y';
	const arr = [] as string[];
	arr.length = sections;
	const stringForReplace = arr.fill(str.padEnd(charInSection, 'x')).join('-');
	let dateTime = new Date().getTime();
	return stringForReplace.replace(/[xy]/g, function (char: string) {
		const random = (dateTime + Math.random() * 16) % 16 | 0;
		dateTime = Math.floor(dateTime / 16);
		return (char === 'x' ? random : (random & 0x3) | 0x8).toString(16);
	});
};

export const dateToTime = (date: number | string | Date) => {
	const dt = new Date(date).toDateString();
	const dateMs = new Date(dt).setHours(23, 59, 59, 999);
	const newDate = new Date(dateMs);
	return { dateMs, newDate };
};
