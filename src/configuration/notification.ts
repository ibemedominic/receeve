
import {NodeHttpHandler} from "@aws-sdk/node-http-handler";
import  { SNSClient, PublishCommand, CreateTopicCommand, GetTopicAttributesCommand, ListTopicsCommand, Topic } from "@aws-sdk/client-sns";
import { EmailEvent} from "../model/dto";

    const REGION = process.env.AWS_REGION;
    const TOPICNAME : string = <string>process.env.TOPICNAME;
    let TopicARN : string = <string>process.env.TOPICARN;

    const requestHandler = new NodeHttpHandler({
        connectionTimeout: 30000,
        socketTimeout: 30000,
    });
    
    const options = {
        region: REGION,
        maxAttempts: 2,
        requestHandler,
    };
    
    const snsClient = new SNSClient(options);

    const MailGunTopic = 
    {
        Name : TOPICNAME
    };
    
    const checkTopicExists = async () : Promise<boolean> => 
    {
        console.log(`Listing existing SNS Topics \n`);
        try 
        {
            const found = await snsClient.send(new ListTopicsCommand({  }));
            let topics = found.Topics || [];
            let topicExists : boolean = false;
            topics.forEach((value : Topic, index)=>
            {
                if((value.TopicArn as string).indexOf(TOPICNAME) > 0)
                {
                    TopicARN = value.TopicArn as string;
                    topicExists = true;
                }
            })
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
        } catch (err : any) 
        {
            console.error("Error Retrieving Topic \n\n");
            console.log(err.stack, err.code, err.message);
            return false;
        }
    };

    const createTopic = async () => 
    {
        var topicFound = await checkTopicExists();
        if(!topicFound)
        {
            console.log(`Creating Sns Topic ${TOPICNAME} \n`);
            try {
                const data = await snsClient.send(new CreateTopicCommand(MailGunTopic));
                console.log("Successfully created Topic.");
                console.log(JSON.stringify(data));
                return data;
            } catch (err : any) 
            {
                console.error("Error Creating Topic ");
                console.log(err.stack, err.code, err.message);
            }
        }
    };


    const publishTopic = async (data : EmailEvent) => 
    {
        var content = { Provider : "Mailgun", timestamp : data["event-data"].timestamp, type : data["event-data"].event };
        let params = {
            Message : JSON.stringify(content),
            TopicArn : TopicARN
        }
        console.log(`Sending Data to Sns Topic ${JSON.stringify(params)}`);

        try 
        {
            const data = await snsClient.send(new PublishCommand(params));
            console.log("Successfully sent Topic Notification.");
            console.log(JSON.stringify(data))
            return data;
        } catch (err : any) 
        {
            console.log("Error", err);
            console.log(err.stack, err.code, err.message);
        }

    };
  

  export { createTopic, publishTopic };
