export interface Project {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export interface Script {
  id: string;
  project_id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface Entity {
  id: string;
  project_id: string;
  type: 'character' | 'location' | 'event';
  name: string;
  description: string;
  attributes: Record<string, any>;
}

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'The Dragon\'s Quest',
    description: 'An epic fantasy adventure about a young hero destined to save the kingdom',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Mystery at Midnight Manor',
    description: 'A thrilling detective story set in a Victorian mansion',
    created_at: '2024-02-20T14:30:00Z',
  },
  {
    id: '3',
    title: 'Stars Beyond',
    description: 'A science fiction tale of exploration and discovery among distant worlds',
    created_at: '2024-03-10T09:15:00Z',
  },
];

export const mockScripts: Script[] = [
  {
    id: '1',
    project_id: '1',
    title: 'Chapter 1: The Awakening',
    content: 'The morning sun cast long shadows across the valley as young Aric stood at the edge of the cliff, gazing at the distant mountains. Little did he know that his quiet life was about to change forever...',
    created_at: '2024-01-16T10:00:00Z',
  },
  {
    id: '2',
    project_id: '1',
    title: 'Chapter 2: The Call to Adventure',
    content: 'A mysterious stranger arrived at the village, bearing news of a dragon threatening the kingdom. The elders turned to Aric, knowing he was the chosen one...',
    created_at: '2024-01-17T11:00:00Z',
  },
  {
    id: '3',
    project_id: '2',
    title: 'Scene 1: The Invitation',
    content: 'Detective Sarah Blake received an unusual invitation to Midnight Manor. The letter, written in elegant script, promised answers to a decades-old mystery...',
    created_at: '2024-02-21T10:00:00Z',
  },
];

export const mockEntities: Entity[] = [
  {
    id: '1',
    project_id: '1',
    type: 'character',
    name: 'Aric',
    description: 'Young hero destined to save the kingdom',
    attributes: { age: 16, role: 'protagonist', abilities: ['courage', 'swordsmanship'] },
  },
  {
    id: '2',
    project_id: '1',
    type: 'character',
    name: 'Elder Thorne',
    description: 'Wise village elder who guides Aric',
    attributes: { age: 65, role: 'mentor', abilities: ['wisdom', 'magic'] },
  },
  {
    id: '3',
    project_id: '1',
    type: 'location',
    name: 'The Valley',
    description: 'Peaceful valley where Aric grew up',
    attributes: { region: 'Northern Kingdom', climate: 'temperate' },
  },
  {
    id: '4',
    project_id: '1',
    type: 'event',
    name: 'The Dragon\'s Arrival',
    description: 'The moment the dragon attacked the kingdom',
    attributes: { date: 'Year 1000', significance: 'catalyst' },
  },
  {
    id: '5',
    project_id: '2',
    type: 'character',
    name: 'Detective Sarah Blake',
    description: 'Renowned detective investigating the manor mystery',
    attributes: { age: 32, role: 'protagonist', specialty: 'cold cases' },
  },
];

export const mockQA = [
  {
    question: 'What is Aric\'s main motivation?',
    answer: 'Aric is motivated by a desire to protect his village and fulfill his destiny as the chosen hero. His journey is driven by courage and a sense of responsibility to those he loves.',
  },
];
