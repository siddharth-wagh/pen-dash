import axiosClient from '@/lib/axios';

export interface QuestionRequest {
  question: string;
}

export interface QuestionResponse {
  answer: string;
  question: string;
}

export const qaApi = {
  askQuestion: (projectId: number, data: QuestionRequest) => 
    axiosClient.post<QuestionResponse>(`/projects/${projectId}/question`, data),
};
