require("dotenv").config();

const { response } = require("express");
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.serviceAccount);

admin.initializeApp(
    {
        credential: admin.credential.cert(serviceAccount)
    }
);

const db = admin.firestore();

//Sending Normal Notification to users using token
exports.sendNormalPushNotification = async (req, res, next) => {
    try {
        const message = {
            notification: {
                title: req.body.title,
                body: req.body.body
            },
            token: req.body.token
        }
        await admin.messaging().send(message).then(() => {
            return res.send("Sent")
        }

        ).catch((err) => {
            return res.send(err)
        })
    }
    catch (err) {
        return res.send(err)
    }
}

//Sending location with the help push notification
exports.SendLocationToTopic = async (req, res, next) => {
    try {
        const message = {
            data: {
                lat: req.body.lat,
                lng: req.body.lng
            },
            topic: req.body.topic
        }

        await admin.messaging().send(message)
            .then((response) => {
                return res.sent("Sent")
            })
            .catch((err) => {
                return res.send(err)
            })
    }
    catch (err) {
        return res.send(err)
    }
}

//sending location to multiple Users using push notification
exports.sendLocationToMultiUser = async (req, res, next) => {
    try {
        const message = {
            data: {
                lat: req.body.lat,
                lng: req.body.lng
            },
            tokens: req.body.tokens
        };

        await admin.messaging().sendEachForMulticast(message).then((response) => {
            return res.send("Sent");
        }).catch((err) => {
            return res.send(err)
        })
    } catch (error) {
        return res.send(error);
    }
}

//creating user using email and password and sending its uid
exports.createUser = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            return res.send([true, userRecord]);
        } catch (error) {
            if (error["code"] == "auth/user-not-found") {
                await admin.auth().createUser({
                    email: email,
                    password: password
                }).then((cred) => {
                    return res.send([true, cred]);
                });
            }
        }
    }
    catch (err) {
        return res.send([false, err]);
    }
}


//adding driver details to the database
exports.addDriverDetails = async (req, res, next) => {
    try {
        const uid = req.body.uid;
        const email = req.body.email;
        const fName = req.body.fName;
        const lName = req.body.lName;
        const busNumber = req.body.busNumber;
        const contact = req.body.contact;
        const address = req.body.address;

        const details = {
            "Uid": uid,
            "Email": email,
            "First Name": fName,
            "Last Name": lName,
            "Bus Number": busNumber,
            "Contact": contact,
            "Address": address
        }

        const docRef = db.collection("User-Driver").doc(uid);

        const response = await docRef.set(details);
        return res.send(true);

    }
    catch (err) {
        return res.send(false);
    }
}