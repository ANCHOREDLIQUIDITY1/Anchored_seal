import express from 'express';
import { 
  createAgreement, 
  getAgreements, 
  getAgreement, 
  updateAgreement, 
  deleteAgreement, 
  sendAgreement,
  getAgreementByToken,
  signAgreement
} from '../controllers/agreementController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes (using unique UUID tokens)
router.get('/sign/:token', getAgreementByToken);
router.post('/sign/:token', signAgreement);

// Protected routes
router.use(protect);
router.route('/')
  .get(getAgreements)
  .post(createAgreement);

router.route('/:id')
  .get(getAgreement)
  .put(updateAgreement)
  .delete(deleteAgreement);

router.post('/:id/send', sendAgreement);

export default router;
