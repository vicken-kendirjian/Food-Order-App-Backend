import { IsEmail, IsEmpty, Length } from "class-validator"

export class CreateCustomerInputs{
    
    @IsEmail()
    email: string;

    @Length(7,12)
    phone: string;

    @Length(6, 12)
    password: string;
}


export interface CustomerPayload{
    _id: string;
    email: string;
    verified: boolean;
}


export class UserLoginInputs{
    @IsEmail()
    email: string;

    @Length(6, 12)
    password: string;
}

export class EditCustomerInput{

    @Length(2,16)
    firstName: string;

    @Length(2,20)
    lastName: string;

    @Length(6, 12)
    address: string;
}

export class CartItem{
    _id: string;
    unit: number;
}

export class OrderInputs{
    
    transactionID: string;
    amount: string;
    items: [CartItem]
}