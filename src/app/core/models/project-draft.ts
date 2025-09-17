import { Project } from './project';

export interface ProjectDraft extends Partial<Project> {
    impactIndicators?: any[];
    reachIndicators?: any[];
}
