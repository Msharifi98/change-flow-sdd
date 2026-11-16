export interface CreateRequestDTO {
  title: string;
  description: string;
  reason: string;
}

export interface CreateRequestResponse {
  id: string;
  title: string;
  description: string;
  reason: string;
  requesterId: string;
  status: string;
  version: number;
  createdAt: string;
}
