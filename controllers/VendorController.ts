import {Request, Response, NextFunction} from 'express';
import { EditVendorInputs, OfferInputs, VendorLoginInputs } from '../dto';
import { FindVendor } from './AdminController';
import { GeneratePassword, GenerateSignature, ValidatePassword } from '../utility';
import { VendorDoc, Food, Order, Offer } from '../models';
import { CreateFoodInput } from '../dto/Food.dto';


export const VendorLogin = async (req: Request, res: Response, next: NextFunction) => {
    
    const {email, password} = <VendorLoginInputs>req.body;

    const vendor = await FindVendor('', email);
    const existingVendor = vendor as VendorDoc;

    if(existingVendor!==null){
        
        const validation = await ValidatePassword(password, existingVendor.password, existingVendor.salt);
        if(validation){

            const signature = GenerateSignature({
                _id: existingVendor.id,
                email: existingVendor.email,
                foodtypes: existingVendor.foodType,
                name: existingVendor.name
            })

            return res.json(signature);
        }
    
        

    }
    return res.json({"message": "Login Credentials not Valid"});
}


export const GetVendorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;
    if(user){
        const existingVendor = await FindVendor(user._id)
        return res.json(existingVendor);
    }

    return res.json({"message":"Vendor not found"});
}


export const UpdateVendorProfile = async (req: Request, res: Response, next: NextFunction) => {

    const { foodtypes, name, address, phone } = <EditVendorInputs>req.body;
    const user = req.user;
    if(user){
        const vendor = await FindVendor(user._id);
        const existingVendor = vendor as VendorDoc;

        if(existingVendor!==null){
            existingVendor.name=name;
            existingVendor.address=address;
            existingVendor.foodType=foodtypes;
            existingVendor.phone=phone;
            
            const savedResult = await existingVendor.save();
            return res.json(savedResult);

        }
        return res.json(existingVendor);
    }

    return res.json({"message":"Vendor not found"});
    
}

export const UpdateVendorService = async (req: Request, res: Response, next: NextFunction) => {

    
    const user = req.user;
    if(user){
        const vendor = await FindVendor(user._id);
        const existingVendor = vendor as VendorDoc;
        if(existingVendor!==null){
            existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
            const savedResult = await existingVendor.save();
            return res.json({savedResult});
        
        }
        return res.json(existingVendor);
    }

    return res.json({"message":"Vendor not found"});
    
}


export const UpdateVendorCoverImage = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;
    if(user){
        const vendor = await FindVendor(user._id);
        const existingVendor = vendor as VendorDoc;

        if(existingVendor!==null){

            const files = req.files as [Express.Multer.File]
            const images = files.map((file: Express.Multer.File) => file.filename)

            existingVendor.coverImages.push(...images);
            const result = await existingVendor.save();

            return res.json(result);
        }
    }

    return res.json({"message":"Error occured"});
    
}



export const AddFood = async (req: Request, res: Response, next: NextFunction) => {

    
    const user = req.user;
    if(user){
        const { name, description, category, foodType, readyTime, price} = <CreateFoodInput>req.body;
        const vendor = await FindVendor(user._id);
        const existingVendor = vendor as VendorDoc;

        if(existingVendor!==null){

            const files = req.files as [Express.Multer.File]
            const images = files.map((file: Express.Multer.File) => file.filename)

            const createdFood = await Food.create({
                vendorID: existingVendor.id,
                name: name,
                description: description,
                category: category,
                foodType: foodType,
                images: images,
                readyTime: readyTime,
                price: price,
                rating: 0
            })

            existingVendor.foods.push(createdFood);
            const result = await existingVendor.save();

            return res.json(result);
        }
    }

    return res.json({"message":"Error occured"});
    
}


export const GetFoods = async (req: Request, res: Response, next: NextFunction) => {

    
    const user = req.user;
    if(user){
        
        const foods = await Food.find({ vendorID: user._id});

        if(foods!==null){
            return res.json(foods);
        }
    }

    return res.json({"message":"No Foods to show"});
    
}


export const GetCurrentOrders = async (req: Request, res: Response, next: NextFunction) => {

    const vendor = req.user;
    if(vendor){
        const orders = await Order.find({ vendorID: vendor._id}).populate('items.food');
        if(orders!=null){
            return res.status(200).json(orders);
        }
    }
    return res.json({message: "Order not found!"})
}

export const GetOrderDetails = async (req: Request, res: Response, next: NextFunction) => {
    
    const orderID = req.params.id;
    if(orderID){
        const order = await Order.findById(orderID).populate('items.food')
        if(order!=null){
            return res.status(200).json(order);
        }
    }
    return res.json({message: "Order not found!"})
}



export const ProcessOrder = async (req: Request, res: Response, next: NextFunction) => {
   
    const orderID = req.params.id;
    const {status, remarks, time} = req.body; //ACCEPT REJECT UNDER-PROCESS READY


    if(orderID){
        const order = await Order.findById(orderID).populate('food');
        if(order){
            order.orderStatus = status;
            order.remarks = remarks;
            if(time){
                order.readyTime=time;
            }
            
            const orderResult = await order.save();
            return res.status(200).json(orderResult);
        }
    }
    return res.json({message: "Order not found!"});
    
}


export const GetOffers = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;
    let currentOffers = Array();
    if(user){
        const offers = await Offer.find().populate('vendors');

        if(offers){
            
            
            offers.map(item=>{
                if(item.vendors){
                    item.vendors.map(vendor=>{
                        if(vendor._id.toString() === user._id){
                            currentOffers.push(item);
                        }
                    })
                }

                if(item.offerType === "GENERIC"){
                    currentOffers.push(item);
                }
            })
        }

        return res.status(200).json(currentOffers)
    }
    return res.status(400).json({message: "Offers not available."})

}

export const AddOffer = async (req: Request, res: Response, next: NextFunction) => {
    
    const user = req.user;
    if(user){

        const {title, description, offerType, offerAmount, pincode, promocode,
        promoType, startValidity, endValidity, bank, bins, minValue, isActive} = <OfferInputs>req.body;

        const vendor = await FindVendor(user._id)

        if(vendor){

            const offer = await Offer.create({
                title,
                description,
                offerType,
                offerAmount,
                pincode,
                promocode,
                promoType,
                startValidity, 
                endValidity, 
                bank, 
                bins, 
                minValue, 
                isActive,
                vendors:[vendor]
            })

            return res.status(200).json(offer);


        }
    }

    return res.status(400).json({message: "An error has occured."})
}

export const EditOffer = async (req: Request, res: Response, next: NextFunction) => {
    
    const user = req.user;

    const offerID = req.params.id;

    if(user){

        const {title, description, offerType, offerAmount, pincode, promocode,
            promoType, startValidity, endValidity, bank, bins, minValue, isActive} = <OfferInputs>req.body;

        const currentOffer = await Offer.findById(offerID);

        if(currentOffer){
            currentOffer.title = title,
            currentOffer.description = description,
            currentOffer.offerType = offerType,
            currentOffer.offerAmount = offerAmount,
            currentOffer.pincode = pincode,
            currentOffer.promocode = promocode,
            currentOffer.promoType = promoType,
            currentOffer.startValidity = startValidity, 
            currentOffer.endValidity = endValidity, 
            currentOffer.bank = bank, 
            currentOffer.bins = bins, 
            currentOffer.minValue = minValue, 
            currentOffer.isActive = isActive

            const result = await currentOffer.save();

            return res.json(result);
                
        }
    }
}