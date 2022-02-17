
import {NodeHttpHandler} from "@aws-sdk/node-http-handler";
import { DynamoDBClient, CreateTableCommand, ListTablesCommand, PutItemCommand, PutItemCommandInput, ListTablesCommandInput, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { EmailEvent} from "../model/dto";

const REGION = process.env.AWS_REGION;
const TABLENAME : string = <string>process.env.TABLENAME;

// Use default Https agent, but override the socket timeout
const requestHandler = new NodeHttpHandler({
  connectionTimeout: 30000,
  socketTimeout: 30000,
});

const options = {
  region: REGION,
  maxAttempts: 2,
  requestHandler, 
};

const ddbClient = new DynamoDBClient(options);


    // Define the Storage schemas

    const MailGunSchema = 
    {
        AttributeDefinitions: 
        [{
            AttributeName: "Id",
            AttributeType: "S"
        }],
        KeySchema: 
        [{
            AttributeName: "Id",
            KeyType: "HASH",
        }],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
        TableName: TABLENAME
    };
    
    const checkSchemaExists = async () : Promise<boolean> => 
    {
        console.log(`Checking if DynamoDB Table ${TABLENAME} already exists \n`);
        try 
        {
            const result = await ddbClient.send(new DescribeTableCommand({ TableName : TABLENAME }));
            console.log("Existing DynamoDB Table ");
            console.log(result);
            return result.$metadata.httpStatusCode == 200;
        } catch (err : any) 
        {
            console.error("Error Retrieving Table \n\n");
            console.log(err.stack, err.code, err.message);
            return false;
        }
    };

    const createSchema = async () => 
    {
        const exists = await checkSchemaExists();
        if(!exists)
        {
            try 
            {
                console.log(`Creating DynamoDB Table ${TABLENAME} \n`);
                const data = await ddbClient.send(new CreateTableCommand(MailGunSchema));
                console.log(`\n\nTable Created ${JSON.stringify(data)} \n\n`);
            } catch (err : any) {
                console.error("Error Creating Table \n\n");
                console.log(err.stack, err.code, err.message);
            }
        }
    };


    const saveRecord = async (data : EmailEvent) => 
    {
        let params : PutItemCommandInput = 
        {
            TableName : TABLENAME,
            Item : {
                Id : { S : data["event-data"].id },
                EventType : { S : data["event-data"].event },
                Content : { S : JSON.stringify(data) }
            } 
        }
        console.log(`Writing Data to Dynamo DB ${JSON.stringify(params)} \n\n`);
        try 
        {
            const data = await ddbClient.send(new PutItemCommand(params));
            console.log(`Record Added ${JSON.stringify(data)} \n\n`);
            return;
        } catch (err: any) {
            console.log("Error Writing Data to Dynamo DB");
            console.log(err.stack, err.code, err.message);
        }
    };
  

  export { createSchema, saveRecord };
