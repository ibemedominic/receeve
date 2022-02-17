# mailgun-webhook

You would need to install the Sam Cli to be able to build the project locally
as well as nodejs

To Deploy the Project run the script

    ./deploy.sh

Please ensure that the user stored in the aws shared credentials files has enough priviledges to Create/Update the necessary resources including Lambda otherwise the deployment would fail.

To run it locally, you can create a file called env.json and setup the following entries

    { 
        "MailgunCallbackFunction": 
        { 
            "TOPICNAME": "<Topic Name>",
            "TOPICARN" : "<Topic ARN>",
            "AWS_REGION": "us-west-1",
            "TABLENAME": "<Table Name>",
            "SIGNINGKEY" : "<mailgun sigining key>",
            "AWS_ACCESS_KEY_ID" : "<Aws Access key>",
            "AWS_SECRET_ACCESS_KEY" : "<Aws Secret key>",
            "LOCAL" : "Y"
        } 
    }

sam local start-api --debug --env-vars env.json

To Invoke it locally, you can create a file called testdata.json and paste the Mailgun payload there, then run the command below (Replace accordingly)

    curl -X POST <http://127.0.0.1:3000/receeve> --data "@/home/traisoft/workspace/aws/receeve/mailgun-webhook/testdata.json"

To Invoke it Remotely, you can also use the format as well (Replace URL accordingly)

    curl -X POST https://nv4u34fem6.execute-api.us-west-1.amazonaws.com/Prod/receeve --data "@/home/traisoft/workspace/aws/receeve/mailgun-webhook/testdata.json"
