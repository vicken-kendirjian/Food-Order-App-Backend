import {Request, Response, NextFunction} from 'express';
import { CreateVendorInput } from '../dto';
import { Vendor, Transaction } from '../models';
import { GeneratePassword, GenerateSalt } from '../utility';




export const FindVendor = async(id: string | undefined, email?: string) => {//string can either str or und
                                                                            //email is an optional parameter of type str
  if(email) return await Vendor.findOne({email: email});

  else return await Vendor.findById(id);
}


export const CreateVendor = async (req: Request, res: Response, next: NextFunction) => {
    const {name,address,pincode,foodType,email,password,ownerName, phone} = <CreateVendorInput>req.body;

    const exitsingVendor = await FindVendor('', email);
    if(exitsingVendor){
      return res.json({"message": "Vendor already exists"});
    }

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

     const createVendor = await Vendor.create({
        name:name,
        address:address,
        pincode:pincode,
        foodType:foodType,
        email:email,
        password:userPassword,
        salt: salt,
        ownerName:ownerName,
        phone:phone,
        rating:0,
        servicesAvailable:false,
        coverImages: [],
        foods: []
     })

     return res.json(createVendor);
}



export const GetVendors = async (req: Request, res: Response, next: NextFunction) => {
    
    const vendors = await Vendor.find();
    
    if(vendors) return res.json(vendors);

    return res.json({"message":"No vendors found"});
}

export const GetVendorByID = async (req: Request, res: Response, next: NextFunction) => {

    const vendorID = req.params.id;
    const vendor = await FindVendor(vendorID);

    if(vendor) return res.json(vendor);

    return res.json({"message":"Vendor not found"});
}

export const GetTransactionsByID = async (req: Request, res: Response, next: NextFunction) => {
  
  const id = req.params.id
  const transaction = await Transaction.findById(id);

  if(transaction!==null){
    return res.status(200).json(transaction);
  }

  return res.json({message: "Transactions are not available"});
}


export const GetTransactions= async (req: Request, res: Response, next: NextFunction) => {
  
  
  const transactions = await Transaction.find();

  if(transactions!==null){
    return res.status(200).json(transactions);
  }

  return res.json({message: "Transaction not available"});
}