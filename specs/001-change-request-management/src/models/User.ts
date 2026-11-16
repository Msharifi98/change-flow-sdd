export interface User {
  id: string;
  username: string;
  role: 'REQUESTER' | 'REVIEWER';
  createdAt: Date;
}

export interface CreateUserInput {
  username: string;
  role: 'REQUESTER' | 'REVIEWER';
}
