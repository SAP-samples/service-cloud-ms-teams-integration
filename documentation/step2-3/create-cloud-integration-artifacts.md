# Create Cloud Integration artifacts

- [Create a design package](#create-a-design-package).
- [Create Integration Flow(iFlow)](#create-integration-flowiflow).

## Create a design package

- Go to the Cloud Integration Suite application from your SAP BTP Cockpit
  ![Go to the Cloud Integration Suite application](./images/01-go-to-integration-suite.png)
- Add Capabilities
  ![Add Capabilities](./images/02-add-capabilities.png)
- Select "Design, Develop and Operate Integration Scenarios" and activate it
  ![Select Capabilities](./images/03-activate-capabilities.png)
  ![Cloud Integration](./images/04-activate-capabilities.png)
  ![Summary](./images/05-activate-capabilities.png)
  ![In Progress](./images/06-activate-capabilities.png)
  ![Active](./images/07-activate-capabilities.png)
- Go back to home > Capabilities > Click "Design, Develop and Operate Integration Scenarios"
  ![Select the capability](./images/08-select-capability.png)
- Click "Design" menu on the left side
  ![Design](./images/09-design.png)
- Create a package and save it
  - Name: Teams Integration
  - Technical Name: (auto filled)
  - Short Description: Teams Integration description
    ![Create](./images/10-create.png)
    ![Create](./images/11-create.png)

## Create Integration Flow(iFlow)

- Go to the package "Teams Integration"
- Go to "Artifacts"
- Click "Edit" on the top menu
  ![Artifacts edit](./images/12-artifacts-edit.png)
- Click "Add" > "Integration Flow"
  ![Add Integration Flow](./images/13-add-iflow.png)
  1. Add [Get Employee Identity UUID by Email](./step2-3-1/get-employee-identity-uuid-by-email.md)
  2. Add [Get Tickets by Creation Identity UUID](./step2-3-2/get-tickets-by-creation-identity-uuid.md)
  3. Add [Get Ticket Info](./step2-3-3/get-ticket-info.md)
  4. Add [Post Ticket TextCollection](./step2-3-4/post-ticket-textcollection.md)
