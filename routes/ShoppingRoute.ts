import express, { Request, Response, NextFunction } from 'express';
import { GetAvailableOffers, GetFoodAvailability, GetFoodsIn30Mins, GetTopRestaurants, RestaurantByID, SearchFoods } from '../controllers';

const router = express.Router();

//Food Availability
router.get('/:pincode', GetFoodAvailability)


//Top Restos
router.get('/top-restaurants/:pincode', GetTopRestaurants)


//Foods Available in 30mins
router.get('/food-in-30-mins/:pincode', GetFoodsIn30Mins)


//Search Foods
router.get('/search/:pincode', SearchFoods)

router.get('/offers/:pincode', GetAvailableOffers)


//Find Resto by ID
router.get('/restaurant/:id', RestaurantByID)

export { router as ShoppingRoute};