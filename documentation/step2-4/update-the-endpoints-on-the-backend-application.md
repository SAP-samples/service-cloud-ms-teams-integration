# Update the endpoints on the backend application
* Get <SAP_BTP_INTEGRATION_SUITE_ENDPOINT>
  * Go to the SAP Integration Suite
  * Go to the Monitor tab
  * Go to the Manage Integration Contents
  ![iFlow URL](./images/01-iflow-url.png)
  * Select one of Integration Contents
  * Copy the endpoint url except the "http/..." part
  * Save as <SAP_BTP_INTEGRATION_SUITE_ENDPOINT>
  ![iFlow URL](./images/02-iflow-url.png)
* Get <SAP_BTP_PROCESS_INTEGRATION_RUNTIME_...>
  * Go to the SAP BTP Cockpit
  * Go to the Services > Instances and Subscriptions
  ![iFlow key](./images/03-iflow-key.png)
  * Create an instance
    * Service: Process Integration Runtime
    * Plan: integration-flow
    * Runtime Environment: Cloud Foundry
    * Space: <YOUR_SPACE>
    * Instance Name: ms-teams-integration-runtime (or any name you want)
  ![iFlow key](./images/04-iflow-key.png)
  * After created, click the created instance
  * Go to the Service Keys
  * Create a key
  ![iFlow key](./images/05-iflow-key.png)
  * Service Key Name: ms-teams-process-integration-key (or any name you want)
  ![iFlow key](./images/06-iflow-key.png)
  * After created, click the created service key
  ![iFlow key](./images/07-iflow-key.png)
  * Save the key information
    * "clientid" as <SAP_BTP_PROCESS_INTEGRATION_RUNTIME_CLIENT_ID>
    * "clientsecret" as <SAP_BTP_PROCESS_INTEGRATION_RUNTIME_CLIENT_SECRET>
  ![iFlow key](./images/08-iflow-key.png)
* update /backend/.env
```
# SAP Integration flow
iFlowUrl=<SAP_BTP_INTEGRATION_SUITE_ENDPOINT>
iFlowClientId=<SAP_BTP_PROCESS_INTEGRATION_RUNTIME_CLIENT_ID>
iFlowClientSecret=<SAP_BTP_PROCESS_INTEGRATION_RUNTIME_CLIENT_SECRET>
```
