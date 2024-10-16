import express, { Request, Response, NextFunction } from 'express';
import { CreateVendor, GetTransactions, GetTransactionsByID, GetVendorByID, GetVendors } from '../controllers';

const router = express.Router();

router.post('/vendor', CreateVendor)
router.get('/vendors', GetVendors)
router.get('/vendors/:id', GetVendorByID)

router.get('/transactions/:id', GetTransactionsByID)
router.get('/transactions', GetTransactions)



router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.json({message: "Hello from Admin"});
})

export{router as AdminRoute};