import React, { FC, DetailedHTMLProps, HTMLAttributes, useMemo, useCallback } from 'react';
import { useAppSelector } from '../../../hooks/reduxTK';
import { ITask } from '../../../types/task';
import SectionListItem from '../../ListItems/SectionListItem/SectionListItem';
import { ISection } from '../../../types/sections';
import { selectProject } from '../../../store/slices/ProjectSlice';
import { selectTasksProject } from '../../../store/slices/TasksProjectSlice';
import { selectSectionsProject } from '../../../store/slices/SectionsProjectSlice';

interface SectionListProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const SectionList: FC<SectionListProps> = ({ className, ...props }) => {
	const { project } = useAppSelector(selectProject);
	// const { sections } = useAppSelector(selectSections);
	// const { tasks } = useAppSelector(selectTasks);
	const { tasksProject } = useAppSelector(selectTasksProject);
	const { sectionsProject } = useAppSelector(selectSectionsProject);

	const newSectionsArray = useMemo(() => {
		const arr = [...sectionsProject]
			// .filter((item) => item.projectId === project.id)
			.sort((a, b) => {
				if (a.isArchived < b.isArchived) return -1;
				if (a.isArchived > b.isArchived) return 1;
				if (a.order < b.order) return -1;
				if (a.order > b.order) return 1;
				return 0;
			});
		if (project.showArchivedTasks) {
			return arr;
		} else {
			return arr.filter((item) => !item.isArchived);
		}
	}, [project.showArchivedTasks, sectionsProject]);

	const newTaskArray = useCallback(
		(item: ISection) => {
			const sectionTasks = tasksProject.filter((task) => task.sectionId === item.id);
			// const sectionTasks = tasks.filter((task) => task.sectionId === item.id && task.projectId === project.id);
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
			return newTasksArr;
		},
		[tasksProject]
	);
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
	return (
		<>
			{newSectionsArray.map((item: ISection) => {
				return <SectionListItem key={item.id} section={item} tasks={showArchivedTasks(newTaskArray(item))} />;
			})}
		</>
	);
};

export default React.memo(SectionList);
