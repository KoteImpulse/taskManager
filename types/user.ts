export interface IUser {
	uid: string;
	theme: string;
	sidebarSize: number;
	startPage: string;
	firstName: string;
	lastName: string;
	isFavOpen: boolean;
	isProjectsOpen: boolean;
	language: string;
	isSidebarOpen: boolean;
	isArchivedOpen: boolean;
	numberOfProjects: number;
	numberOfSectionsInProject: number;
	numberOfTasksInSection: number;
}
