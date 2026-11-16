export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  reason: string;
  requesterId: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'CHANGES_REQUESTED';
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChangeRequestInput {
  title: string;
  description: string;
  reason: string;
  requesterId: string;
}
