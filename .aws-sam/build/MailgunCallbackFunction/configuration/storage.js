"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveRecord = exports.createSchema = void 0;
const node_http_handler_1 = require("@aws-sdk/node-http-handler");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const REGION = process.env.AWS_REGION;
const TABLENAME = process.env.TABLENAME;
// Use default Https agent, but override the socket timeout
const requestHandler = new node_http_handler_1.NodeHttpHandler({
    connectionTimeout: 30000,
    socketTimeout: 30000,
});
const options = {
    region: REGION,
    maxAttempts: 2,
    requestHandler,
};
const ddbClient = new client_dynamodb_1.DynamoDBClient(options);
// Define the Storage schemas
const MailGunSchema = {
    AttributeDefinitions: [{
            AttributeName: "Id",
            AttributeType: "S"
        }],
    KeySchema: [{
            AttributeName: "Id",
            KeyType: "HASH",
        }],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
    },
    TableName: TABLENAME
};
const checkSchemaExists = async () => {
    console.log(`Checking if DynamoDB Table ${TABLENAME} already exists \n`);
    try {
        const result = await ddbClient.send(new client_dynamodb_1.DescribeTableCommand({ TableName: TABLENAME }));
        console.log("Existing DynamoDB Table ");
        console.log(result);
        return result.$metadata.httpStatusCode == 200;
    }
    catch (err) {
        console.error("Error Retrieving Table \n\n");
        console.log(err.stack, err.code, err.message);
        return false;
    }
};
const createSchema = async () => {
    const exists = await checkSchemaExists();
    if (!exists) {
        try {
            console.log(`Creating DynamoDB Table ${TABLENAME} \n`);
            const data = await ddbClient.send(new client_dynamodb_1.CreateTableCommand(MailGunSchema));
            console.log(`\n\nTable Created ${JSON.stringify(data)} \n\n`);
        }
        catch (err) {
            console.error("Error Creating Table \n\n");
            console.log(err.stack, err.code, err.message);
        }
    }
};
exports.createSchema = createSchema;
const saveRecord = async (data) => {
    let params = {
        TableName: TABLENAME,
        Item: {
            Id: { S: data["event-data"].id },
            EventType: { S: data["event-data"].event },
            Content: { S: JSON.stringify(data) }
        }
    };
    console.log(`Writing Data to Dynamo DB ${JSON.stringify(params)} \n\n`);
    try {
        const data = await ddbClient.send(new client_dynamodb_1.PutItemCommand(params));
        console.log(`Record Added ${JSON.stringify(data)} \n\n`);
        return;
    }
    catch (err) {
        console.log("Error Writing Data to Dynamo DB");
        console.log(err.stack, err.code, err.message);
    }
};
exports.saveRecord = saveRecord;
