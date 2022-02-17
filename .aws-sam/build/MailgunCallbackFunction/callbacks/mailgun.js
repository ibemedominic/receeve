"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailGunLambdaHandler = void 0;
const storage_1 = require("../configuration/storage");
const notification_1 = require("../configuration/notification");
const crypto = __importStar(require("crypto"));
const isLocal = process.env.LOCAL == "Y";
let response;
const verify = (signingKey, options) => {
    const toEncode = options.signature.timestamp.concat(options.signature.token);
    console.log(" Value to encode = " + toEncode);
    const encodedToken = crypto
        .createHmac('sha256', signingKey)
        .update(toEncode)
        .digest('hex');
    console.log(" Encoded Value = " + encodedToken);
    return (encodedToken === options.signature.signature);
};
// If we are running locally, create the Schema and TOpic accordingly
if (isLocal) {
    // The DynamoDB would fail the first time due to delayed creation cos of eventual consistency.
    // This does not happen when cloud formation is used to deploy it
    (0, storage_1.createSchema)();
    (0, notification_1.createTopic)();
}
/**
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @param {Object} context - The Context Doc
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 */
const mailGunLambdaHandler = async (event, context) => {
    let body = event.body || "";
    let eventData;
    console.log("Data Recieved");
    console.log(event.body);
    try {
        eventData = JSON.parse(event.body || "");
    }
    catch (e) {
        console.error(e);
        response = {
            'statusCode': 406,
            'body': JSON.stringify({
                message: `Could Not parse Data packet`
            })
        };
        return response;
    }
    let signingKey = process.env.SIGNINGKEY;
    if (!verify(signingKey, eventData)) {
        response = {
            'statusCode': 406,
            'body': JSON.stringify({
                message: `Invalid Data Packet, Perhaps the Signing key Environment Variable [SIGNINGKEY] was not set`
            })
        };
    }
    else {
        await (0, storage_1.saveRecord)(eventData);
        await (0, notification_1.publishTopic)(eventData);
        response = {
            'statusCode': 200,
            'body': JSON.stringify(eventData)
        };
    }
    return response;
};
exports.mailGunLambdaHandler = mailGunLambdaHandler;
