import React, { FC, DetailedHTMLProps, HTMLAttributes, useCallback } from 'react';
import SectionListItem from '../../ListItems/SectionListItem/SectionListItem';
import { useAppSelector } from '../../../hooks/reduxTK';
import { ITask } from '../../../types/task';
import { selectProject } from '../../../store/slices/ProjectSlice';
import { selectTasksProject } from '../../../store/slices/TasksProjectSlice';

interface EmptySectionListProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const EmptySectionList: FC<EmptySectionListProps> = ({ className, ...props }) => {
	const { project } = useAppSelector(selectProject);
	// const { tasks } = useAppSelector(selectTasks);
	const { tasksProject } = useAppSelector(selectTasksProject);

	const newTaskArray = useCallback(() => {
		const sectionTasks = tasksProject.filter((task) => task.sectionId === '');
		// const sectionTasks = tasks.filter((task) => task.sectionId === '' && task.projectId === project.id);
		const newTasksArr = [] as ITask[];
		const reqArr = (arr: ITask[]) => {
			arr.sort((a, b) => {
				if (a.level < b.level) return -1;
				if (a.level > b.level) return 1;
				if (a.isArchived < b.isArchived) return -1;
				if (a.isArchived > b.isArchived) return 1;
				if (a.order < b.order) return -1;
				if (a.order > b.order) return 1;
				return 0;
			});
			for (let i = 0; i < arr.length; i++) {
				const el = arr[i];
				if (el.parent) {
					const children = sectionTasks.filter((item: ITask) => item.parentId === el.id);
					if (el.level !== 1) {
						const newItem = sectionTasks.splice(sectionTasks.indexOf(el), 1);
						newTasksArr.push(newItem[0]);
					} else {
						newTasksArr.push(el);
					}
					reqArr(children);
				} else if (el.parentId !== '') {
					const newItem = sectionTasks.splice(sectionTasks.indexOf(el), 1);
					newTasksArr.push(newItem[0]);
				} else {
					newTasksArr.push(el);
				}
			}
		};
		reqArr(sectionTasks);
		return project.order !== -2 && project.order !== -3 ? newTasksArr : sectionTasks;
	}, [project.order, tasksProject]);

	const showArchivedTasks = useCallback(
		(arr: ITask[]) => {
			if (project.showArchivedTasks) {
				return arr;
			} else {
				return arr.filter((item) => !item.isArchived);
			}
		},
		[project.showArchivedTasks]
	);

	return <>{<SectionListItem tasks={showArchivedTasks(newTaskArray())} empty />}</>;
};

export default React.memo(EmptySectionList);
