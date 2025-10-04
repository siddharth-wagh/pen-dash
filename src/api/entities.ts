import axiosClient from '@/lib/axios';

export type EntityType = 'character' | 'location' | 'event';

export interface Entity {
  id: number;
  script_id: number;
  type: EntityType;
  name: string;
  description: string;
  attributes: Record<string, any>;
  created_at: string;
}

export const entitiesApi = {
  getByProject: (projectId: number, type?: EntityType) => {
    const params = type ? { type } : {};
    return axiosClient.get<Entity[]>(`/projects/${projectId}/entities`, { params });
  },
  
  getById: (id: number) => axiosClient.get<Entity>(`/entities/${id}`),
};
