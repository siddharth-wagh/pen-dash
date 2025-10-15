import axiosClient from '@/lib/axios';

export interface Script {
  id: number;
  project_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScriptData {
  title: string;
  content?: string;
}

export interface UpdateScriptData {
  title?: string;
  content?: string;
}

export interface AnalysisResponse {
  message: string;
  task_id: string;
}

export interface TaskStatus {
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  result?: any;
  error?: string;
}

export const scriptsApi = {
  getById: (id: number) => axiosClient.get<Script>(`/scripts/${id}`),
  
  getByProject: (projectId: number) => 
    axiosClient.get<Script[]>(`/projects/${projectId}/scripts`),
  
  create: (projectId: number, data: CreateScriptData) => 
    axiosClient.post<Script>(`/projects/${projectId}/scripts`, data),
  
  update: (id: number, data: UpdateScriptData) => 
    axiosClient.put<Script>(`/scripts/${id}`, data),
  
  delete: (id: number) => axiosClient.delete(`/scripts/${id}`),
  
  analyze: (id: number) => 
    axiosClient.post<AnalysisResponse>(`/scripts/${id}/analyze`),
  
  getTaskStatus: (taskId: string) => 
    axiosClient.get<TaskStatus>(`/tasks/${taskId}/status`),
};
