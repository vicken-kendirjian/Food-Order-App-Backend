import {Request, Response, NextFunction} from 'express';
import { plainToClass } from 'class-transformer'
import { CreateCustomerInputs, UserLoginInputs, EditCustomerInput, OrderInputs, CartItem } from '../dto/Customer.dto';
import { validate } from 'class-validator';
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword, onRequestOTP } from '../utility';
import { Customer, Food, Order, Offer, Transaction } from '../models';
import { sign } from 'jsonwebtoken';

export const CustomerSignUp = async (req: Request, res: Response, next: NextFunction) => {
        
    const customerInputs = plainToClass(CreateCustomerInputs, req.body);//turns inputs into instance of class

    const inputErrors = await validate(customerInputs, {validationError: {target: true}})

    if(inputErrors.length>0){
        return res.status(400).json(inputErrors);
    }

    const {email, phone, password} = customerInputs;

    const salt = await GenerateSalt()
    const userPassword = await GeneratePassword(password, salt);

    const {otp, expiry} = GenerateOtp();
    
    const existingCustomer = await Customer.findOne({email: email})

    if(existingCustomer!==null){
        return res.status(409).json({message: 'User already exists'})
    }

    const result = await Customer.create({
        email: email,
        password: userPassword,
        salt: salt,
        phone: phone,
        otp: otp,
        otp_expiry: expiry,
        firstName: '',
        lastName: '',
        address: '',
        verified: false,
        lat: 0,
        lng: 0,
        orders: []
    });
    

    if(result){
        //send otp to customer
        await onRequestOTP(otp, phone)

        //generate signature
        const signature = GenerateSignature({
            _id: result._id,
            email: result.email,
            verified: result.verified
        })
        //send result to client
        return res.status(201).json({signature: signature, verified: result.verified, email: result.verified})
    }

    return res.status(400).json({message: 'Error has occured'});

}

export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {

    const loginInputs = plainToClass(UserLoginInputs, req.body);
    const loginErrors = await validate(loginInputs, {validationError: {target: false}});

    if(loginErrors.length>0){
        return res.json(400).json(loginErrors);
    }

    const {email ,password} = loginInputs;
    const customer = await Customer.findOne({email: email});

    if(customer){
        const validation = await ValidatePassword(password, customer.password, customer.salt);
        if(validation){
            const signature = GenerateSignature({
                _id: customer._id,
                email: customer.email,
                verified: customer.verified
            })

            return res.status(201).json({signature: signature, verified: customer.verified, email: customer.verified})

        }


    }
    return res.status(404).json({message: "Login Error"});
}


export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {

    const {otp} = req.body;
    const customer = req.user;

    if(customer){
        const profile = await Customer.findById(customer._id);

        if(profile){
            if(profile.otp == parseInt(otp) && profile.otp_expiry >= new Date()){
                profile.verified = true;
                const updatedCustomer = await profile.save();

                const signature = GenerateSignature({
                    _id: updatedCustomer._id,
                    email: updatedCustomer.email,
                    verified: updatedCustomer.verified
                });

                return res.status(201).json({signature: signature, verified: updatedCustomer.verified, email: updatedCustomer.verified})

            }
        }
    }

    return res.status(400).json({message: "Error has occured"})
}

export const RequestOTP = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    if(customer){
        const profile = await Customer.findById(customer._id);

        if(profile){
            const {otp, expiry} = GenerateOtp();

            profile.otp=otp;
            profile.otp_expiry=expiry;

            await profile.save();
            await onRequestOTP(otp, profile.phone);

            return res.status(200).json({message: "OTP sent to your registered phone number!"})
        }
    }
    return res.status(400).json({message: "Something went wrong."});
}

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    if(customer){
        const profile = await Customer.findById(customer._id);

        if(profile){
        return res.status(200).json(profile);
        }
    }
    return res.status(400).json({message: "Something went wrong."})
    
}

export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;
    const profileInputs = plainToClass(EditCustomerInput, req.body);
    const profileErrors = await validate(profileInputs, {validationError: {target: false}})

    if(profileErrors.length>0){
        return res.status(400).json(profileErrors);
    }

    if(customer){

        const { firstName, lastName, address} = profileInputs
        const profile = await Customer.findById(customer._id);

        

        if(profile){

            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;

            const result = await profile.save();
            return res.status(200).json(result);

        }
    }
    return res.status(400).json({message: "Something went wrong."})
}

export const validateTransaction = async (transactionID: string) => {
    const currentTransaction = await Transaction.findById(transactionID);
    if(currentTransaction){
        if(currentTransaction.status.toLowerCase() !== "failed"){
            return {status: true, currentTransaction}
        }
    }
    return {status: false, currentTransaction}
}




export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {

    //grab logged in customer
    const customer = req.user;

    const {transactionID, amount, items} = <OrderInputs>req.body

    if(customer){
        //validate txn

        const {status, currentTransaction} = await validateTransaction(transactionID);
        if(!status){
            return res.status(404).json({message: "Error while creating order"});
        }

        //generate order id
        const orderID = `${Math.floor(Math.random()*89999) + 1000}`;

        const profile = await Customer.findById(customer._id);
        
        

        let cartItems = Array();
        let netAmount = 0.0


        let vendorID;
        //calculate order amount
        const foods = await Food.find().where('_id').in(items.map(item=>item._id)).exec();

        foods.map(food=> {
            items.map(({_id, unit}) => {
                if(food._id == _id){
                    vendorID = food.vendorID;
                    netAmount += (food.price*unit);
                    cartItems.push({food, unit});
                }
            })
        })
        //create order with descriptions
        if(cartItems){
            const currentOrder = await Order.create({
                orderID: orderID,
                vendorID: vendorID,
                items: cartItems,
                totalAmount: netAmount,
                paidAmount: amount,
                orderDate: new Date(),
                orderStatus: 'Waiting',
                remarks: '',
                deliveryID: '',
                readyTime: 45
            })

            if(currentOrder && profile && currentTransaction && vendorID){
                //update order to user account
                profile.cart = [] as any;
                profile.orders.push(currentOrder);

                currentTransaction.vendorID = vendorID;
                currentTransaction.orderID = orderID;
                currentTransaction.status = "CONFIRMED";

                await currentTransaction.save();

                

                

                await profile.save();

                return res.status(200).json(currentOrder);
            }
        }
    
    }
    return res.status(400).json({message: "Error while creating your order!"});
}

export const GetOrders = async (req: Request, res: Response, next: NextFunction) => {
    
    const customer = req.user;
    if(customer){
        const profile = await Customer.findById(customer._id).populate("orders");

        if(profile){
            return res.status(200).json(profile.orders);
        }
    }
    return res.status(400).json({message: "Error has occured!"});
}

export const GetOrderByID = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;

    if(orderId){
        const order = await Order.findById(orderId).populate("items.food");

        return res.status(200).json(order);
    }
    return res.status(400).json({message: "Error has occured!"});
    
}


export const AddToCart = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;
    
    if(customer){
        const profile = await Customer.findById(customer._id).populate('cart.food');
        let cartItems = Array();
        const {_id, unit} = <CartItem>req.body;
        const food = await Food.findById(_id);

        if(profile!=null && food){
            cartItems = profile.cart;
            if(cartItems.length>0){//check if there are existing items
                let existingItems = cartItems.filter((item => item.food._id.toString() === _id));
                if(existingItems.length>0){//checking if the food we are adding is already in
                    const index = cartItems.indexOf(existingItems[0]);
                    if(unit>0){
                        cartItems[index] = {food, unit};//update existing food with new unit
                    }else{
                        cartItems.splice(index, 1);//means unit is 0 hence removing the item from cart
                    }

                }else{
                    cartItems.push({food, unit})
                }

            }else{
                //empty cart
                cartItems.push({food: food, unit: unit})
            }

            if(cartItems){
                profile.cart = cartItems as any;
                const cartResult =await profile.save();
                return res.status(200).json(cartResult.cart);
            }
        }

    }
    
    return res.status(400).json({message: "Error has occured!"})
    
    
}

export const GetCart = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    if(customer){
        const profile = await Customer.findById(customer._id).populate("cart.food");
        if(profile){
            return res.status(200).json(profile.cart);
        }
    }
    return res.status(400).json({message: "Cart is empty"});
    
    
}

export const DeleteCart = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    if(customer){
        const profile = await Customer.findById(customer._id).populate("cart.food");
        if(profile!=null){
            profile.cart = [] as any;
            const cartResult = await profile.save();
            return res.status(200).json(profile);
        }
    }
    return res.status(400).json({message: "Cart is already empty"});
    
}


export const VerifyOffer = async (req: Request, res: Response, next: NextFunction) => {

    const offerID = req.params.id;
    const customer = req.user;
    
    if(customer){
        const appliedOffer = await Offer.findById(offerID);

        if(appliedOffer){

            if(appliedOffer.promoType === "USER_BASE"){

                //applicable once for any user

            }else{
                if(appliedOffer.isActive){
                    return res.status(200).json({message: "Offer is valid", offer:appliedOffer})
                }
            }

            
        }
    }
    return res.status(400).json({message: "Invalid offer."})

}

export const CreatePayment = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    const{amount, paymentMode, offerID} = req.body;

    let payableAmount = Number(amount);
    if(offerID){
        const appliedOffer = await Offer.findById(offerID);

        if(appliedOffer){
            payableAmount = (payableAmount - appliedOffer.offerAmount);
        }
    }
    //Perform Payment Gateway Charge API call

    //Create record on transaction
    if(customer){
        const transaction = Transaction.create({
            customer: customer._id,
            vendorID: '',
            orderID: '',
            orderValue: offerID || 'NA',
            status: 'OPEN',
            paymentMode: paymentMode,
            PaymentResponse: 'Payment is cash on delivery'

            
        })
    //return transactionID
    return res.status(200).json(transaction);
    }

    return res.status(400).json({message: "An error has occured"});

    
}