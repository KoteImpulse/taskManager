export interface ISection {
	id: string;
	isCollapsed: boolean;
	isArchived: boolean;
	isDeleted: boolean;
	sectionName: string;
	order: number;
	projectId: string;
	userId: string;
}
