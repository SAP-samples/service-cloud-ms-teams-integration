# Post Ticket TextCollection
* Add "Integration Flow" and go into it
  * Name: Post Ticket TextCollection
  * ID: (auto filled)
  ![Add Integration Flow](./images/01-add-iflow.png)
  ![List](./images/02-list-iflow.png)
* Click "Edit" on the top menu
  ![Edit](./images/03-edit-iflow.png)
* Connect "HTTPS" from "Sender" to "Start"
  * "Connection" tab 
    * Address: ```/TicketTextCollection```
    * CSRF Protected: unchecked
    ![HTTP Connector](./images/05-https.png)
    ![HTTP Connector](./images/06-https.png)
    ![HTTP Connector](./images/07-https.png)
* Add "JSON to XML Converter" between "Start" and "End"
  ![JSON to XML Converter](./images/08-json-to-xml.png)
  ![JSON to XML Converter](./images/09-json-to-xml.png)
  ![JSON to XML Converter](./images/10-json-to-xml.png)
  ![JSON to XML Converter](./images/11-json-to-xml.png)
* Add "Content Modifier" between "JSON to XML Converter" and "End"
  * "Message Header" tab
    * Create, ```X-CSRF-Token```, XPath, ```//xCsrfToken```, ```java.lang.String```
    * Create, ```Authorization```, XPath, ```//authBasic```, ```java.lang.String```
    * Create, ```Cookie```, XPath, ```//Cookie```, ```java.lang.String```
    * Create, ```Content-Type```, Constant, ```application/json```
    * Create, ```ParentObjectID```, XPath, ```//ParentObjectID```, ```java.lang.String```
    * Create, ```Text```, XPath, ```//Text```, ```java.lang.String```
    * Create, ```TypeCode```, XPath, ```//TypeCode```, ```java.lang.String```
  * "Message Body" tab
    * Type: Expression
    * Body:
```json
{
    "ParentObjectID": "${header.ParentObjectID}",
    "TypeCode": "${header.TypeCode}",
    "Text": "${header.Text}"
}
```
  ![Content Modifier](./images/12-content-modifier.png)
  ![Content Modifier](./images/13-content-modifier.png)
  ![Content Modifier](./images/14-1-content-modifier.png)
  ![Content Modifier](./images/14-2-content-modifier.png)
* Add "Request Reply" bwtween "Content Modifier" and "End"
* Connect "HTTP" from "Request Reply" to "Receiver"
  * "Connection" tab
    * Address: ```https://<TENANT_ID>.crm.ondemand.com/sap/c4c/odata/v1/ticket/ServiceRequestCollection('${header.ParentObjectID}')/ServiceRequestTextCollection```
    * Method: POST
    * Authentication: None
    * Request Headers: ```*```
    * Response Headers: ```*```
    ![Request Reply](./images/15-request-reply.png)
    ![Request Reply](./images/16-request-reply.png)
    ![Request Reply](./images/17-request-reply.png)
    ![Request Reply](./images/18-request-reply.png)
    ![Request Reply](./images/19-request-reply.png)
    ![Request Reply](./images/20-request-reply.png)
* Click "Save"
* Click "Deploy"
  ![Save and Deploy](./images/21-save-and-deploy.png)
* Go to "Monitor"
* Go to "Manage Integration Content" > "All"
* Check that the artifact is started successfully
  ![Monitor](./images/22-monitor.png)
  ![Monitor](./images/23-monitor.png)