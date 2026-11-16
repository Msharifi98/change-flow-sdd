export interface Review {
  id: string;
  changeRequestId: string;
  reviewerId: string;
  decision: 'APPROVE' | 'REQUEST_CHANGES';
  comments: string | null;
  createdAt: Date;
}

export interface CreateReviewInput {
  changeRequestId: string;
  reviewerId: string;
  decision: 'APPROVE' | 'REQUEST_CHANGES';
  comments?: string;
}
