import {Handler, APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda"

import {EmailEvent} from "../model/dto";
import { createSchema, saveRecord } from "../configuration/storage";
import { createTopic, publishTopic } from "../configuration/notification";

import * as crypto from "crypto";

const isLocal : boolean = process.env.LOCAL == "Y";
let response;

const verify = (signingKey : string, options : EmailEvent) => 
{
    const toEncode = options.signature.timestamp.concat(options.signature.token);
    console.log(" Value to encode = " + toEncode);
    
    const encodedToken = crypto
        .createHmac('sha256', signingKey)
        .update(toEncode)
        .digest('hex')

    console.log(" Encoded Value = " + encodedToken);

    return (encodedToken === options.signature.signature)
}

if(isLocal)
{
    createSchema();
    createTopic();
}

/**
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @param {Object} context - The Context Doc
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 */
export const mailGunLambdaHandler = async (event : APIGatewayProxyEventV2, context : any) => 
{
    var body  = event.body || "";
    let eventData : EmailEvent;
    console.log("Data Recieved");
    console.log(event.body);
    try 
    {
        eventData = JSON.parse(event.body || "");
    } 
    catch(e)
    {
        console.error(e);
        response = {
            'statusCode': 406,
            'body': JSON.stringify({
                message: `Could Not parse Data packet`
            })
        }
        return response;
    }

    let signingKey : string = <string>process.env.SIGNINGKEY;

    if(!verify(signingKey, eventData))
    {
        response = {
            'statusCode': 406,
            'body': JSON.stringify({
                message: `Invalid Data Packet, Perhaps the Signing key Environment Variable [SIGNINGKEY] was not set`
            })
        }
    } else {
        await saveRecord(eventData);
        await publishTopic(eventData);

        response = {
            'statusCode': 200,
            'body': JSON.stringify(eventData)
        }
    }
    
    return response
};
