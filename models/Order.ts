import mongoose, {Schema, Document, Model} from 'mongoose';

export interface OrderDoc extends Document{
    orderID: string,
    vendorID: string,
    items: [any], //[{food, unit: 1}]
    totalAmount: number,
    paidAmount: number,
    orderDate: Date,
    orderStatus: string,
    remarks: string,
    deliveryID: string,
    readyTime: number // max 60mins   
}

const OrderSchema = new Schema({
    orderID: {type: String, required: true},
    vendorID: {type: String, required: true},
    items: [{
        food: {type: Schema.Types.ObjectId, ref: "food", required: true},
        unit: {type: Number, required:true}
    }],
    totalAmount: {type: Number, required: true},
    paidAmount: {type: Number, required: true},
    orderDate: {type: Date},
    orderStatus: {type: String},
    remarks: {type: String},
    deliveryID: {type: String},
    readyTime: {type: Number},
},{
    toJSON: {
        transform(doc, ret){
            delete ret.__v,
            delete ret.createdAt,
            delete ret.updatedAt
        }
    },
    timestamps: true
})


const Order = mongoose.model<OrderDoc>('order', OrderSchema);

export {Order};