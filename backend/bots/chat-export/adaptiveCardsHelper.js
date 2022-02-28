const { CardFactory } = require("botbuilder");
const moment = require("moment");
const env = process.env;

class AdaptiveCardsHelper {
  chatExportCard(start, end) {
    // Display chat export option card
    const exportCard = CardFactory.adaptiveCard({
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      type: "AdaptiveCard",
      version: "1.5",

      body: [
        {
          type: "TextBlock",
          text: "Enter date and time to get messeges",
          weight: "bolder",
        },
        {
          type: "Input.Date",
          id: "startDate",
          label: "Start Date",
          min: start,
          max: end,
          isRequired: true,
          errorMessage: "Start date is required",
          placeholder: "Export start date",
        },
        {
          type: "Input.Time",
          id: "startTime",
          label: "Start Time",
          isRequired: true,
          errorMessage: "Start time is required",
          placeholder: "Export start time",
        },
        {
          type: "Input.Date",
          id: "endDate",
          label: "End Date",
          min: start,
          max: end,
          isRequired: true,
          errorMessage: "End date is required",
          placeholder: "Export end date",
        },
        {
          type: "Input.Time",
          id: "endTime",
          label: "End Time",
          isRequired: true,
          errorMessage: "End time is required",
          placeholder: "Export end time",
        },
      ],
      actions: [
        {
          type: "Action.Submit",
          title: "Get Messages",
          data: {
            key: "Selective.Continue",
            start: start,
            end: end,
          },
        },
      ],
    });
    return {
      task: {
        type: "continue",
        value: {
          card: exportCard,
          heigth: 250,
          width: 400,
          title: "",
        },
      },
    };
  }

  showTicketCard(ticketChoices) {
    const card = CardFactory.adaptiveCard({
      version: "1.0.0",
      type: "AdaptiveCard",
      body: [
        {
          type: "TextBlock",
          text: "Select a ticket to show within this chat:",
        },
        {
          type: "Input.ChoiceSet",
          id: "ticket",
          style: "compact",
          isMultiSelect: false,
          value: "1",
          choices: ticketChoices,
        },
      ],
      actions: [
        {
          type: "Action.Submit",
          title: "Show",
          data: {
            key: "insert",
          },
        },
      ],
    });

    return {
      task: {
        type: "continue",
        value: {
          card: card,
          heigth: 200,
          width: 400,
          title: "Show Ticket",
        },
      },
    };
  }

  showSignOutCard() {
    const card = CardFactory.adaptiveCard({
      version: "1.0.0",
      type: "AdaptiveCard",
      body: [
        {
          type: "TextBlock",
          text: "You have been signed out.",
        },
      ],
      actions: [
        {
          type: "Action.Submit",
          title: "Close",
          data: {
            key: "Close",
          },
        },
      ],
    });

    return {
      task: {
        type: "continue",
        value: {
          card: card,
          heigth: 200,
          width: 400,
          title: "Signout",
        },
      },
    };
  }

  showActionNotSupportedCard() {
    const card = CardFactory.adaptiveCard({
      version: "1.0.0",
      type: "AdaptiveCard",
      body: [
        {
          type: "TextBlock",
          text: "This action is not supported yet.",
        },
      ],
      actions: [
        {
          type: "Action.Submit",
          title: "Close",
          data: {
            key: "Close",
          },
        },
      ],
    });

    return {
      task: {
        type: "continue",
        value: {
          card: card,
          heigth: 200,
          width: 400,
          title: "Not Supported",
        },
      },
    };
  }

  createJustInTimeInstallCard = () => {
    return {
      contentType: "application/vnd.microsoft.card.adaptive",
      content: {
        type: "AdaptiveCard",
        version: "1.0",
        body: [
          {
            type: "TextBlock",
            text: "Please click **Continue** to install the app in this conversation",
            wrap: true,
          },
        ],
        actions: [
          {
            type: "Action.Submit",
            title: "Continue",
            data: { msteams: { justInTimeInstall: true } },
          },
        ],
      },
    };
  };

  showMessegeSelectionCard(messages, filter, ticketChoices, status) {
    console.log("Tickets in card", ticketChoices);
    let column1 = [{ type: "TextBlock", text: "Select", weight: "Bolder" }];
    let column2 = [
      {
        type: "TextBlock",
        separator: true,
        text: "Messages",
        weight: "Bolder",
      },
    ];
    messages.forEach((message) => {
      column1.push({
        type: "Input.Toggle",
        separator: true,
        id: message.id,
        value: "false", //message.isSelected.toString()
        valueOn: "true",
        valueOff: "false",
      });

      column2.push({
        type: "TextBlock",
        separator: true,
        id: message.id,
        text: message.body.content,
        wrap: false,
        height: "stretch",
      });
    });

    const card = CardFactory.adaptiveCard({
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      type: "AdaptiveCard",
      version: "1.3",
      body: [
        {
          type: "ColumnSet",
          height: "auto",
          verticalAlignment: "bottom",
          columns: [
            {
              type: "Column",
              items: column1,
              width: "50px",
            },
            {
              type: "Column",
              items: column2,
              width: "auto",
            },
          ],
        },
        {
          type: "TextBlock",
          text: " ",
        },
        {
          type: "TextBlock",
          text: "Select the ticket to attach messages",
          weight: "bolder",
        },
        {
          type: "Input.ChoiceSet",
          id: "ticket",
          style: "compact",
          isMultiSelect: false,
          isRequired: true,
          errorMessage: "You must select a ticket.",
          choices: ticketChoices,
        },
        {
          type: "TextBlock",
          text: " ",
        },
      ],
      actions: [
        {
          type: "Action.Submit",
          title: "Export Messages",
          data: {
            key: "Selective.Export",
            filter: filter,
            status: status,
          },
        },
      ],
    });

    return {
      task: {
        type: "continue",
        value: {
          card: card,
          heigth: 200,
          width: 400,
          title: "Select Messages",
        },
      },
    };
  }

  async getTicketDetailCard(ticket) {
    const adaptive = CardFactory.adaptiveCard({
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      type: "AdaptiveCard",
      version: "1.3",
      body: [
        {
          type: "TextBlock",
          text: ticket.Name,
          size: "large",
        },
        {
          type: "TextBlock",
          text: "ID: " + ticket.ID,
        },
        {
          type: "TextBlock",
          text: "Buyer Name: " + ticket.BuyerMainContactPartyName,
        },
      ],

      actions: [
        {
          type: "Action.OpenUrl",
          title: "Open Ticket",
          url: env.c4cTenantUrl,
        },
      ],
    });
    return adaptive;
  }

  showSelectiveExportErrorCard(start, end, status) {
    const placeholderEnd = moment(end).subtract(1, "days").format("YYYY-MM-D");
    const selectiveExportErrorCard = CardFactory.adaptiveCard({
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      type: "AdaptiveCard",
      version: "1.3",

      body: [
        {
          type: "TextBlock",
          text: "Invalid parameters! Please try again.",
          wrap: true,
          color: "attention",
          weight: "bolder",
        },
        {
          type: "Input.Date",
          id: "startDate",
          label: "Start Date",
          min: start,
          max: end,
          isRequired: true,
          errorMessage: "Start date is required",
          placeholder: "Export start date",
        },
        {
          type: "Input.Time",
          id: "startTime",
          label: "Start Time",
          isRequired: true,
          errorMessage: "Start time is required",
          placeholder: "Export start time",
        },
        {
          type: "Input.Date",
          id: "endDate",
          label: "End Date",
          min: start,
          max: end,
          isRequired: true,
          errorMessage: "End date is required",
          placeholder: "Export end date",
        },
        {
          type: "Input.Time",
          id: "endTime",
          label: "End Time",
          isRequired: true,
          errorMessage: "End time is required",
          placeholder: "Export end time",
        },
      ],
      actions: [
        {
          type: "Action.Submit",
          title: "Get Messages",
          data: {
            key: "Selective.Continue",
            start: start,
            end: end,
          },
        },
      ],
    });

    return {
      task: {
        type: "continue",
        value: {
          card: selectiveExportErrorCard,
          heigth: 250,
          width: 400,
          title: "Selective Export",
        },
      },
    };
  }
}

module.exports = new AdaptiveCardsHelper();
