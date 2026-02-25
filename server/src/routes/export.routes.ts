import { Router } from 'express';
import { ExportController } from '../controllers/export.controller.js';

const router = Router();
const controller = new ExportController();

router.post('/', controller.exportDocument);

export { router as exportRouter };
