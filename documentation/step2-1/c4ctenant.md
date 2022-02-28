# **Setup SAP Service Cloud C4C demo tenant**

- [Request a Cloud for Customer(C4C) demo tenant](#request-a-cloud-for-customerc4c-demo-tenant).
- [Create a sample ticket in Service Cloud](#create-a-sample-ticket-in-service-cloud).

## Request a Cloud for Customer(C4C) demo tenant

- [Go the wiki page and follow the steps.](https://wiki.wdf.sap.corp/wiki/display/c4crelease/Requesting+a+new+tenant)
- Receive the confirmation email that your demo tenant is created like below.
  ![C4C Tenant Confirmation Email](./images/c4c-tenant-confirmation-email.png)
- Get your demo tenant information from the email.
  - SAP Cloud for Customer tenant URL: <SAP_SERVICE_CLOUD_C4C_TENANT_URL>
  - Admin user: <SAP_SERVICE_CLOUD_C4C_API_ID>
  - Admin user's initial password: <SAP_SERVICE_CLOUD_C4C_API_PASSWORD>
- Go to the URL <SAP_SERVICE_CLOUD_C4C_TENANT_URL> and sign in.
- Reset the password.
- You can see your C4C tenant home like below.
  ![C4C Tenant Home](./images/c4c-tenant-home.png)
- Replace the "/backend/.env" file like below.
```
# SAP Service Cloud (Cloud for Customers, C4C)
c4cApiId=<SAP_SERVICE_CLOUD_C4C_API_ID>
c4cApiPassword=<SAP_SERVICE_CLOUD_C4C_API_PASSWORD>
c4cTenantUrl=<SAP_SERVICE_CLOUD_C4C_TENANT_URL>
```

## Create a sample ticket in Service Cloud

1. Once your request is approved and a demo tenant is assigned to you, login to the SAP Service Cloud C4C tenant using the link and the credentials provided in the email.
   ![C4C Login](./images/c4c-login.png)

2. For the first time login you may be asked to change the password. Follow the on-screen instructions and setup your account.

3. Once the account is setup, you can see the landing page as below. Click on the hamburger menu located at the top-left corner.
   ![C4C Home](./images/c4c-home.png)

4. In the menu, look for "Service", and select "Tickets" from the sub-menu.
   ![C4C Ticket Menu](./images/c4c-ticket-menu.png)

5. After selecting "Tickets" you can see a list of existing tickets (if any). To create a new ticket, click on "+" icon located at the header.
   ![C4C Create Ticket](./images/c4c-create-ticket.png)

6. Give some sample data to create a ticket. Only subject field is mandatory. After entering sample data, click on "Save and Open" button located at the bottom.
   ![C4C New Ticket 1](./images/c4c-new-ticket1.png)
   ![C4C New Ticket 2](./images/c4c-new-ticket2.png)

7. Once the ticket is created, you will be taken to the ticket screen where you can find all the details related to a service ticket.
   ![C4C Ticket](./images/c4c-ticket.png)

8. The newly created ticket can also be found in the list of tickets under the current user.
   ![C4C Ticket List](./images/c4c-ticket-list.png)
