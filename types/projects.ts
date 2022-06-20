export interface IProject {
	order: number;
	projectDescription: string;
	date: number;
	userId: string;
	projectName: string;
	isArchived: boolean;
	collapsed: boolean;
	isDeleted: boolean;
	isFavorite: boolean;
	id: string;
	color: string;
	showArchivedTasks: boolean
}
