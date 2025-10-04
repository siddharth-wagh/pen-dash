import axiosClient from '@/lib/axios';

export interface Project {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  title: string;
  description: string;
}

export const projectsApi = {
  getAll: () => axiosClient.get<Project[]>('/projects'),
  
  getById: (id: number) => axiosClient.get<Project>(`/projects/${id}`),
  
  create: (data: CreateProjectData) => 
    axiosClient.post<Project>('/projects', data),
  
  update: (id: number, data: Partial<CreateProjectData>) => 
    axiosClient.put<Project>(`/projects/${id}`, data),
  
  delete: (id: number) => axiosClient.delete(`/projects/${id}`),
};
