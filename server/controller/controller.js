const mongoose = require("mongoose");
var UserDB = require("../model/model");

exports.create = (req, res) => {
  const user = new UserDB({
    active: "yes",
    status: "0",
  });

  user
    .save(user)
    .then((data) => {
      res.send(data._id);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occoured while creating a create operation",
      });
    });
};

exports.leavingUserUpdate = (req, res) => {
  const userid = req.params.id;
  console.log("leaving userid is:", userid);

  UserDB.updateOne({ _id: userid }, { $set: { active: "no", status: "0" } })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: 'cannot upadate user with ${userid} Maybe user not found!',
        });
      } else {
        res.send("1 document updated");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error Update user information" });
    });
};

exports.updateOnOtherUserClosing = (req, res) => {
  const userid = req.params.id;
  console.log("leaving userid is:", userid);

  UserDB.updateOne({ _id: userid }, { $set: { active: "yes", status: "0" } })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: 'cannot upadate user with ${userid} Maybe user not found!',
        });
      } else {
        res.send("1 document updated");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error Update user information" });
    });
};

exports.newUserUpdate = (req, res) => {
  const userid = req.params.id;
  console.log("leaving userid is:", userid);

  UserDB.updateOne({ _id: userid }, { $set: { active: "yes" } })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: 'cannot upadate user with ${userid} Maybe user not found!',
        });
      } else {
        res.send("1 document updated");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error Update user information" });
    });
};

exports.updateOnNext = (req, res) => {
  const userid = req.params.id;
  console.log("leaving userid is:", userid);

  UserDB.updateOne({ _id: userid }, { $set: { status: "0" } })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: 'cannot upadate user with ${userid} Maybe user not found!',
        });
      } else {
        res.send("1 document updated");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error Update user information" });
    });
};

exports.remoteUserFind = (req, res) => {
  const cnID = req.body.cnID;

  UserDB.aggregate([
    {
      $match: {
        _id: { $ne: new mongoose.Types.ObjectId(cnID) },
        active: "yes",
        status: "0",
      }
    },
    { $sample: { size: 1 } },
  ])
    .limit(1)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error occured while retriving user information.",
      })
    }
    )
};

exports.updateOnEngagement = (req, res) => {
  const userid = req.params.id;
  console.log("leaving userid is:", userid);

  UserDB.updateOne({ _id: userid }, { $set: { status: "1" } })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: 'cannot upadate user with ${userid} Maybe user not found!',
        });
      } else {
        res.send("1 document updated");
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error Update user information" });
    });
};

exports.getNextUser = (req, res) => {
  const cnID = req.body.cnID;
  const remoteUser = req.body.remoteUser;
  let excludeIds = [cnID, remoteUser];

  UserDB.aggregate([{
    $match: {
      _id: { $nin: excludeIds.map((id) => new mongoose.Types.ObjectId(id)) },
      active: "yes",
      status: "0",
    },
  },
  { $simple: { size: 1 } },
  ])
  .then((data)=>{
    res.send(data);
  })
  .catch((err)=>{
    res. status(500).send({
      message:
          err.message  || "Error occured while user information.",
    });
  });
};