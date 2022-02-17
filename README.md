# mailgun-webhook

To set the Environment Variables :

aws lambda update-function-configuration --function-name receeve-MailgunCallbackFunction-6d4UIBS5q0vE --environment "Variables={TOPICNAME=MAILGUN, REGION=us-west-1,TABLENAME=MAILGUN}"

To run it

sam local start-api --debug --env-vars env.json

To Invoke it
curl -X POST <http://127.0.0.1:3000/receeve> --data "@/home/traisoft/workspace/aws/receeve/mailgun-webhook/testdata.json"


curl -X POST https://nv4u34fem6.execute-api.us-west-1.amazonaws.com/Prod/receeve --data "@/home/traisoft/workspace/aws/receeve/mailgun-webhook/testdata.json"
