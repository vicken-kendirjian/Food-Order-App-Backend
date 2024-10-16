import express, { Request, Response, NextFunction } from 'express';
import { AddToCart, GetCart, DeleteCart, CreateOrder, CustomerLogin, CustomerSignUp, CustomerVerify, EditCustomerProfile, GetCustomerProfile, GetOrderByID, GetOrders, RequestOTP, VerifyOffer, CreatePayment } from '../controllers';
import { Authenticate } from '../middlewares/CommonAuth';

const router = express.Router();


//signup customer
router.post('/signup', CustomerSignUp);

//login customer
router.post('/login', CustomerLogin);

//Authentication

router.use(Authenticate);
//verify account
router.patch('/verify', CustomerVerify);

//otp
router.get('/otp', RequestOTP);

//profile
router.get('/profile', GetCustomerProfile);

router.patch('/profile', EditCustomerProfile)

//cart
router.post('/cart', AddToCart);
router.get('/cart', GetCart);
router.delete('/cart', DeleteCart);

//Offer
router.get('offer/verify/:id', VerifyOffer);

//order
router.post('/create-order', CreateOrder);
router.get('/orders', GetOrders);
router.get('/order/:id', GetOrderByID);

//payment
router.post('/create-payment', CreatePayment)

export {router as CustomerRoute};