export interface ReviewRequestDTO {
  decision: 'APPROVE' | 'REQUEST_CHANGES';
  comments?: string;
}

export interface ReviewRequestResponse {
  id: string;
  status: string;
  version: number;
}
