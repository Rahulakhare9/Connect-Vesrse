const express = require("express");
const route = express.Router();
const services = require("../services/render");
const controller = require("../controller/controller");

// Ensure these service methods are correctly defined in the services/render file
route.get("/", services.homeRoutes);
route.get("/second", services.second);
route.get("/video", services.video);
route.get("/chat", services.chat);

// Ensure the create method is correctly defined and exported in the controller file
route.post("/api/users", controller.create);
route.put("/leaving-user-update/:id", controller.leavingUserUpdate);
route.put("/update-on-otheruser-closing/:id", controller.updateOnOtherUserClosing);
route.put("/new-user-update/:id", controller.newUserUpdate);
route.post("/get-remote-users", controller.remoteUserFind);
route.put("/update-on-engagement/:id", controller.updateOnEngagement);
route.put("/update-on-next/:id", controller.updateOnNext);
route.post("/get-next-user", controller.getNextUser);



module.exports = route;