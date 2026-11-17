import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware';

const router = Router();
const controller = new UserController();

router.post('/users', authenticate, controller.createUser.bind(controller));
router.get('/users/:id', authenticate, controller.getUser.bind(controller));
router.get('/users/username/:username', authenticate, controller.getUserByUsername.bind(controller));

export default router;
