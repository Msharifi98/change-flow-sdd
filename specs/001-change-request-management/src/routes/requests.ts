import { Router } from 'express';
import { RequestController } from '../controllers/request.controller';
import { authenticate, authorize } from '../middleware';

const router = Router();
const controller = new RequestController();

// POST /api/requests - Create a new change request
router.post('/requests', authenticate, controller.createRequest.bind(controller));

// POST /api/requests/:id/submit - Submit a draft request for review
router.post('/requests/:id/submit', authenticate, controller.submitRequest.bind(controller));

// POST /api/requests/:id/review - Review a pending request
router.post('/requests/:id/review', authenticate, authorize(['REVIEWER']), controller.reviewRequest.bind(controller));

// GET /api/requests/:id - Get a specific request
router.get('/requests/:id', authenticate, controller.getRequest.bind(controller));

// GET /api/requests - List requests
router.get('/requests', authenticate, controller.listRequests.bind(controller));

export default router;


