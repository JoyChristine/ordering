const express = require("express");
const menuModel = require("../models/menu");
const orderModel = require("../models/order");
const router = express.Router();
require('dotenv').config()

//aficanstalking APIs
const credentials = {
    apiKey: process.env.API_KEY,
    username: process.env.USERNAME,
};

const Africastalking = require("africastalking")(credentials);

const sms = Africastalking.SMS;


router.get("/", async(request, response) => {
    const menu = "Taking orders <br>";

    try {
        response.status(200).send(menu);
    } catch (error) {
        response.status(500).send(error);
    }
});

//feature 1
router.post("/menu", async(request, response) => {
    const menu = new menuModel(request.body);

    try {
        await menu.save();
        response.status(200).send({ status: "201", message: "OK", data: menu });
    } catch (error) {
        response.status(500).send(error);
    }
});

//feature 2
router.get("/menu", async(request, response) => {
    const menu = await menuModel.find({});

    try {
        response.status(200).send({ status: "201", message: "OK", data: menu });
    } catch (error) {
        response.status(500).send(error);
    }
});
//feature 3
router.get("/menu/:id", async(request, response) => {
    const menu = await menuModel.findById(request.params.id);
    console.log(menu)
    try {
        response.status(200).send(menu);
    } catch (error) {
        response.status(500).send(error);
    }
});


//PUT Update menu by id
router.put("/menu/:id", async(request, response) => {

    try {
        const menu = await menuModel.findByIdAndUpdate(request.params.id, request.body);
        await menu.save();
        response.status(200).send(menu);
    } catch (error) {
        response.status(500).send(error);
    }
});

//DELETE menu using id
router.delete("/menu/:id", async(request, response) => {
    try {
        const menu = await menuModel.findByIdAndDelete(request.params.id);

        if (!menu) response.status(404).send("No item found");
        response.status(200).send("Item Deleted ");
    } catch (error) {
        response.status(500).send(error);
    }
});

//create POST meal
router.post("/order", async(request, response) => {
    const { menuItemId, userPhoneNumber } = request.body;
    const order = new orderModel(request.body);
    const menu = await menuModel.findById(menuItemId).populate("order");

    // Use the service
    const options = {
        to: userPhoneNumber,
        message: `Your order will be ready soon.`,
    };

    try {
        await order.save();

        //sendSMS.JS
        sms
            .send(options)
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
            });
        response.status(200).send(request.body);
    } catch (error) {
        response.status(500).send(error);
    }
});

//list GET order
router.get("/orders", async(request, response) => {
    const orders = await orderModel.find({});

    try {
        response.status(200).send({ status: "201", message: "OK", data: orders });
    } catch (error) {
        response.status(500).send(error);
    }
});

//feature 4
router.get("/order/:id", async(request, response) => {
    const { id } = request.params;
    const order = await orderModel.findById(id).populate("order");
    console.log(order);
    try {
        response.status(200).send(order);
    } catch (error) {
        response.status(500).send(error);
    }
});

// Incomming-message report route
router.post("/incoming-messages", (request, response) => {
    const data = request.body;
    console.log(`Received message: \n ${data}`);
    response.sendStatus(200);
});

//  Delivery reports route
router.post("/delivery-reports", (request, response) => {
    const data = request.body;
    console.log(`Received report: \n ${data}`);
    response.sendStatus(200);
});

module.exports = router;