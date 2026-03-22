import { Router } from 'express';
import { helloWorld } from '../controllers/helloController';

const router = Router();

router.get('/hello', helloWorld);

export default router;
