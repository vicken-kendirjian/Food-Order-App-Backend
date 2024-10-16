import express, { Request, Response, NextFunction } from 'express';
import { GetCurrentOrders, ProcessOrder, GetOrderDetails, AddFood, GetFoods, GetVendorProfile, UpdateVendorCoverImage, UpdateVendorProfile, UpdateVendorService, VendorLogin, GetOffers, AddOffer, EditOffer } from '../controllers'
import { Authenticate } from '../middlewares/CommonAuth';
import multer from 'multer';


const router = express.Router();

const imageStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images')
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString().replace(/:/g,"-")+'_'+file.originalname)
    }
})

const images = multer({storage: imageStorage}).array('images', 10)

router.post('/login', VendorLogin);

router.use(Authenticate);
router.get('/profile', GetVendorProfile);
router.patch('/profile', UpdateVendorProfile);
router.patch('/service', UpdateVendorService);
router.patch('/coverimage', images, UpdateVendorCoverImage);
router.post('/food', images, AddFood);
router.get('/foods', GetFoods);

//Orders
router.get('/orders', GetCurrentOrders);
router.put('/order/:id/process', ProcessOrder);
router.get('/order/:id', GetOrderDetails);


router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.json({message: "Hello from Vendor"});
})

//Offers
router.get('/offers', GetOffers);
router.post('/offer', AddOffer);
router.put('/offer/:id', EditOffer);



export{router as VendorRoute};