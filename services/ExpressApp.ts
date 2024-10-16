import express, { Application } from "express";
import bodyParser from "body-parser";
import path from 'path';

import { AdminRoute, VendorRoute, ShoppingRoute, CustomerRoute } from "../routes";

export default async(app: Application) => {

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use('/images', express.static(path.join(__dirname, 'images')))


    app.use('/admin', AdminRoute);
    app.use('/vendor', VendorRoute);
    app.use('/customer', CustomerRoute);
    app.use('/shop',ShoppingRoute);

    return app;

}



