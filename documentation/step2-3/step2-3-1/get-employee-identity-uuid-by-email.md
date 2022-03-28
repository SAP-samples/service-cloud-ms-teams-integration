# Get Employee Identity UUID by Email
* Add "Integration Flow" and go into it
  * Name: Get Employee Identity UUID by Email
  * ID: (auto filled)
  ![Add Integration Flow](./images/14-add-iflow.png)
  ![List](./images/15-iflow-list.png)
* Click "Edit" on the top menu
  ![Edit](./images/16-edit-iflow.png)
* Connect "HTTPS" from "Sender" to "Start"
  * "Connection" tab
    * Address: ```/EmployeeIdentityUuidByEmail```
    * CSRF Protected: unchecked
    ![HTTP Connector](./images/17-connector.png)
    ![HTTP Connector](./images/18-https.png)
* Add "JSON to XML Converter" between "Start" and "End"
  ![JSON to XML Converter](./images/19-converter.png)
  ![JSON to XML Converter](./images/20-json-to-xml-converter.png)
  ![JSON to XML Converter](./images/21-json-to-xml-converter.png)
  ![JSON to XML Converter](./images/22-json-to-xml-converter.png)
* Add "Content Modifier" between "JSON to XML Converter" and "End"
  * "Message Header" tab
    * Create, ```X-CSRF-Token```, Constant, ```Fetch```
    * Create, ```Authorization```, XPath, ```//authBasic```, ```java.lang.String```
    * Create, ```filter```, XPath, ```//filter```, ```java.lang.String```
    ![Content Modifier](./images/23-content-modifier.png)
    ![Content Modifier](./images/24-content-modifier.png)
    ![Content Modifier](./images/25-content-modifier.png)
* Add "Request Reply" between "Content Modifier" and "End"
* Connect "HTTP" from "Request Reply" to "Receiver"
  * "Connection" tab
    * Address: ```https://<TENANT_ID>.crm.ondemand.com/sap/c4c/odata/uid/v1/c4codataapi/EmployeeCollection```
    * Query: ```$format=json&$top=1&$filter=${header.filter}```
    * Method: GET
    * Authentication: None
    * Request Headers: ```*```
    * Response Headers: ```*```
    ![Request Reply](./images/26-request-reply.png)
    ![Request Reply](./images/27-request-reply.png)
    ![Request Reply](./images/28-request-reply.png)
    ![Request Reply](./images/29-request-reply.png)
    ![Request Reply](./images/30-request-reply.png)
    ![Request Reply](./images/31-request-reply.png)
* Click "Save"
* Click "Deploy"
  ![Save and Deploy](./images/32-save-and-deploy.png)
* Go to "Monitor"
* Go to "Manage Integration Content" > "All"
* Check that the artifact is started successfully
  ![Monitor](./images/33-monitor.png)
  ![Monitor](./images/34-monitor.png)