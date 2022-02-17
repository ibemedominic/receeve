"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishTopic = exports.createTopic = void 0;
const node_http_handler_1 = require("@aws-sdk/node-http-handler");
const client_sns_1 = require("@aws-sdk/client-sns");
const REGION = process.env.AWS_REGION;
const TOPICNAME = process.env.TOPICNAME;
let TopicARN = process.env.TOPICARN;
const requestHandler = new node_http_handler_1.NodeHttpHandler({
    connectionTimeout: 30000,
    socketTimeout: 30000,
});
const options = {
    region: REGION,
    maxAttempts: 2,
    requestHandler,
};
const snsClient = new client_sns_1.SNSClient(options);
const MailGunTopic = {
    Name: TOPICNAME
};
const checkTopicExists = async () => {
    console.log(`Listing existing SNS Topics \n`);
    try {
        const found = await snsClient.send(new client_sns_1.ListTopicsCommand({}));
        let topics = found.Topics || [];
        let topicExists = false;
        topics.forEach((value, index) => {
            if (value.TopicArn.indexOf(TOPICNAME) > 0) {
                TopicARN = value.TopicArn;
                topicExists = true;
            }
        });
        return topicExists;
        /*
        console.log("Existing Topics ");
        console.log(JSON.stringify(topics));
        
        console.log(`Checking if SNS Topic ${TopicARN} already exists \n`);
        const result = await snsClient.send(new GetTopicAttributesCommand({ TopicArn : TopicARN }));
        console.log("Existing SNS Topic ");
        console.log(result);
        return result.$metadata.httpStatusCode == 200;
        */
    }
    catch (err) {
        console.error("Error Retrieving Topic \n\n");
        console.log(err.stack, err.code, err.message);
        return false;
    }
};
const createTopic = async () => {
    var topicFound = await checkTopicExists();
    if (!topicFound) {
        console.log(`Creating Sns Topic ${TOPICNAME} \n`);
        try {
            const data = await snsClient.send(new client_sns_1.CreateTopicCommand(MailGunTopic));
            console.log("Successfully created Topic.");
            console.log(JSON.stringify(data));
            return data;
        }
        catch (err) {
            console.error("Error Creating Topic ");
            console.log(err.stack, err.code, err.message);
        }
    }
};
exports.createTopic = createTopic;
const publishTopic = async (data) => {
    let content = { Provider: "Mailgun", timestamp: data["event-data"].timestamp, type: data["event-data"].event };
    let params = {
        Message: JSON.stringify(content),
        TopicArn: TopicARN
    };
    console.log(`Sending Data to Sns Topic ${JSON.stringify(params)}`);
    try {
        const data = await snsClient.send(new client_sns_1.PublishCommand(params));
        console.log("Successfully sent Topic Notification.");
        console.log(JSON.stringify(data));
        return data;
    }
    catch (err) {
        console.log("Error", err);
        console.log(err.stack, err.code, err.message);
    }
};
exports.publishTopic = publishTopic;
