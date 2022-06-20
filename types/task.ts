export interface ITask {
	parentId: string;
	parent: boolean;
	order: number;
	taskDescription: string;
	date: number;
	isArchived: boolean;
	userId: string;
	taskName: string;
	sectionId: string;
	projectId: string;
	isDeleted: boolean;
	id: string;
	level: number;
	label: string;
	projectColor: string;
	projectName: string;
	endDate: number;
	priority: number;
	isCollapsed: boolean;
	hidden: boolean;
}
