const {
  TeamsActivityHandler,
  CardFactory,
  MessageFactory,
  TeamsInfo,
} = require("botbuilder");

const { GraphClient } = require("../../msgraph/graphClient.js");
const { polyfills } = require("isomorphic-fetch");
const IntegrationSuite = require("../../sap/integrationsuite");
require("dotenv").config();
const env = process.env;
const moment = require("moment");
const helper = require("./teamsChatExportBotHelper");
const adaptivecard = require("./adaptiveCardsHelper");

// User Configuration property name
const USER_CONFIGURATION = "userConfigurationProperty";

class TeamsChatExportBot extends TeamsActivityHandler {
  /**
   *
   * @param {UserState} User state to persist configuration settings
   */
  constructor(userState) {
    super();
    this.userConfigurationProperty =
      userState.createProperty(USER_CONFIGURATION);
    this.connectionName = env.connectionName;
    this.userState = userState;
    this.storage = { tickets: [] };
  }

  async run(context) {
    await super.run(context);

    // Save state changes
    await this.userState.saveChanges(context);
  }

  // Fetch tickets under the current user from Service Cloud using "user" object
  getTickets(agent) {
    return new Promise((resolve, reject) => {
      IntegrationSuite.getEmployeeIdentityUuidByEmail(agent.mail)
        .then((uuid) => {
          return IntegrationSuite.getTicketsByCreationIdentityUuid(uuid);
        })
        .then((tickets) => {
          resolve(tickets);
        })
        .catch((error) => {
          console.log('getTickets catch', error);
          reject(error);
        });
    });
  }

  // Overloaded function. Receives invoke activities with the name 'composeExtension/fetchTask'
  async handleTeamsMessagingExtensionFetchTask(context, action) {
    try {
      // Getting member information to check if the bot is a part of the current conversation
      const member = await TeamsInfo.getMember(
        context,
        context.activity.from.id
      );
    } catch (error) {
      console.log("Bot is not a part of the current conversation!", error);
      // console.log(JSON.stringify(error));
      if (
        error.code === "ServiceError" ||
        error.code === "BotNotInConversationRoster"
      ) {
        return {
          task: {
            type: "continue",
            value: {
              title: "App Installation",
              card: adaptivecard.createJustInTimeInstallCard(),
            },
          },
        };
      }
      throw error;
    }

    if (!context.activity.from.aadObjectId) throw new Error("unknown user");
    if (!action.commandId) throw new Error("unknown command");

    const tokenResponse = await helper.checkToken(
      context,
      action,
      this.connectionName
    );

    if (!tokenResponse || !tokenResponse.token) {
      console.log("No token. Asking to login");
      return helper.sendSigninLink(context, this.connectionName);
    }

    if (action.commandId === "ExportChat") {
      let timeOffset = new Date().getTimezoneOffset() * 60 * 1000; // Getting current time zone offset in milliseconds
      timeOffset = timeOffset * -1;
      const client = new GraphClient(tokenResponse.token);

      // Chat export in a channel is currently not supported
      if (context._activity.conversation.conversationType === "channel") {
        return adaptivecard.showActionNotSupportedCard();
      }

      const chat = await client.getChatDetails(
        context._activity.conversation.id
      );

      const startLocalDate = moment.utc(chat.createdDateTime).local().subtract(1, 'days').format("YYYY-MM-DD");
      const endLocalDate = moment().format("YYYY-MM-DD");
      console.log("startLocalDate", startLocalDate, "endLocalDate", endLocalDate);
      return adaptivecard.chatExportCard(startLocalDate, endLocalDate);
    }

    if (action.commandId === "ShowTicketDetails") {
      // Get user details to fetch tickets
      const client = new GraphClient(tokenResponse.token);
      const agent = await client.GetMyProfile();
      try {
        const tickets = await this.getTickets(agent);
        this.storage["tickets"] = tickets;
        let ticketChoices = [];
        tickets.forEach((ticket) => {
          ticketChoices.push({
            title: ticket.Name,
            value: ticket.ID,
          });
        });
        return adaptivecard.showTicketCard(ticketChoices);
      } catch (error) {
        return adaptivecard.showErrorCard(error);
      }
    }

    if (action.commandId === "SignOutCommand") {
      const adapter = context.adapter;
      await adapter.signOutUser(context, this.connectionName);
      return adaptivecard.showSignOutCard();
    }
    return null;
  }

  async handleTeamsMessagingExtensionSubmitAction(context, action) {
    if (action.data.msteams && action.data.msteams.justInTimeInstall === true) {
      return this.handleTeamsMessagingExtensionFetchTask(context, action);
    }

    const tokenResponse = await helper.checkToken(
      context,
      action,
      this.connectionName
    );

    if (
      (!tokenResponse || !tokenResponse.token) &&
      action.commandId !== "SignOutCommand"
    ) {
      console.error("Login was not successful please try again.");
      await context.sendActivity(
        "Login was not successful please try logging in again."
      );
      return {};
    }

    if (action.commandId === "ExportChat") {
      const data = await action.data;
      console.log("Export Data is:", data);

      if (data.key == "Close") {
        return {};
      }

      if (context._activity.conversation.conversationType !== "personal") {
        const client = new GraphClient(tokenResponse.token);
        let messages = await client.getMessages(
          context._activity.conversation.id
        );
        messages.value.forEach((message) => {
          message["isSelected"] = true;
        });

        // Validating dates (if any) and constructing success messages
        let status = "";
        let isValid = true;
        if (data.key === "Selective.Continue") {
          await helper
            .validateDates(data, "chatStartDate", "chatEndDate")
            .then((res) => {
              isValid = res.status;
              status = helper.getSelectiveExportStatus(data);
            })
            .catch((res) => {
              isValid = res.status;
              status = res.reason;
            });

          console.log(status);

          // If dates are valid, extract messages to show
          if (isValid) {
            let messagesExtracted = [];
            const filter = {
              key: "Date.Export",
              startDate: data.startDate,
              startTime: data.startTime,
              endDate: data.endDate,
              endTime: data.endTime,
            };
            await this.filterMessages(messages.value, filter)
              .then((data) => {
                messagesExtracted = data;
              })
              .catch((error) => {
                console.log(error);
              });

            // Getting Ticket Details if not available
            if (
              this.storage.tickets == "undefined" ||
              !this.storage.tickets.length
            ) {
              console.log("Fetching tickets");
              const agent = await client.GetMyProfile();
              const tickets = await this.getTickets(agent);
              this.storage["tickets"] = tickets;
            }

            let ticketChoices = [];
            this.storage["tickets"].forEach((ticket) => {
              ticketChoices.push({
                title: ticket.Name,
                value: ticket.ID,
              });
            });
            if (messagesExtracted && messagesExtracted.length > 0) {
              return adaptivecard.showMessegeSelectionCard(
                messagesExtracted.reverse(),
                filter,
                ticketChoices,
                status
              );
            } else {
              return adaptivecard.showErrorCard("No message to export.");
            }
          }
        } else if (data.key === "Selective.Export") {
          // Export selected messages
          console.log("Values obtained are:", data);
          status = data.status;
          messages.value.forEach((message, i) => {
            for (let key in data) {
              if (key == message.id) {
                messages.value[i].isSelected = data[key] === "true";
              }
            }
          });
        } else {
          status = "Something went wrong!";
          isValid = false;
        }
        console.log("status is", status);

        if (isValid) {
          await this.postTextCollection(
            messages.value,
            data.filter ? data.filter : data,
            data.ticket
          );
          const card = CardFactory.heroCard("Export Successful", status);
          const activity = MessageFactory.attachment(card);
          await context.sendActivity(activity);
        } else {
          if (data.key === "Selective.Continue") {
            return adaptivecard.showSelectiveExportErrorCard(
              data.start,
              data.end,
              status
            );
          } else {
            await context.sendActivity(
              "Something went wrong during chat export. Please try again or contact your administrator."
            );
          }
        }
      } else {
        await context.sendActivity("Personal chats cannot be exported");
      }
      return {};
    }

    if (action.commandId === "ShowTicketDetails") {
      const data = await action.data;
      if (data && data.ticket) {
        if (this.storage.tickets === "undefined" || !this.storage.tickets.length) {
          await context.sendActivity("Tickets not fetched!");
        } else {
          let ticket = {};
          this.storage.tickets.forEach((t) => {
            if (t.ID === data.ticket) {
              ticket = t;
            }
          });

          const adaptive = await adaptivecard.getTicketDetailCard(ticket);
          const activity = MessageFactory.attachment(adaptive);
          await context.sendActivity(activity);
        }
      }
    }

    return {};
  }

  handleTeamsMessagingExtensionCardButtonClicked(context, cardData) {
    console.log("card button clicked", cardData);
    return {};
  }

  async onInvokeActivity(context) {
    console.log("onInvoke, " + context.activity.name);
    return await super.onInvokeActivity(context);
  }

  async filterMessages(messages, filter) {
    // Calculating pacific time offset from UTC
    let timeOffset = new Date().getTimezoneOffset() * 60 * 1000; // Getting PT offset in milliseconds
    timeOffset = timeOffset * -1;
    let actualDay = new Date(new Date() + timeOffset);
    actualDay.setUTCHours(0, 0, 0, 0);
    const startOfDay = new Date(actualDay.getTime() - timeOffset);

    // Adding Daylight Savings check to Date
    Date.prototype.stdTimezoneOffset = function () {
      var jan = new Date(this.getFullYear(), 0, 1);
      var jul = new Date(this.getFullYear(), 6, 1);
      return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    };

    Date.prototype.isDstObserved = function () {
      return this.getTimezoneOffset() < this.stdTimezoneOffset();
    };

    // Array to hold filtered messages
    let filteredMessages = [];

    return new Promise(function (resolve, reject) {
      if (filter.key === "Date.Export") {
        const startLocalMoment = moment(filter.startDate + " " + filter.startTime, "YYYY-MM-DD HH:mm");
        const endLocalMoment = moment(filter.endDate + " " + filter.endTime, "YYYY-MM-DD HH:mm");

        messages.map((element) => {
          const messageLocalMoment = moment.utc(element.lastModifiedDateTime).local();

          if (
            element.messageType == "message" &&
            !element.body.content.includes("</attachment>") &&
            element.body.content !== "" &&
            messageLocalMoment.isAfter(startLocalMoment) &&
            messageLocalMoment.isBefore(endLocalMoment)
          ) {
            let ele = { ...element };
            ele.body.content = ele.body.content.replace(/(<([^>]+)>)/gi, "");
            filteredMessages.push(ele);
          }
        });
        resolve(filteredMessages);
      } else {
        reject("Invalid Export!");
      }
    });
  }

  async postTextCollection(messages, filter, ticketId) {
    await this.filterMessages(messages, filter)
      .then((messages) => {
        return IntegrationSuite.getTicketById(
          ticketId,
          this.formatMessages(messages)
        );
      })
      .then((ticket) => {
        return IntegrationSuite.postTextCollection(ticket);
      })
      .then((responseXml) => {
        console.log("TextData posting is done");
        return;
      })
      .catch((error) => {
        console.log(error);
        throw "TextData posting failed:" + error;
      });
  }

  formatMessages(messages) {
    let textData = "";
    messages.reverse().map((element) => {
      if (element.isSelected) {
        let from = "",
          at = "",
          message = "";
        let date = new Date(element.lastModifiedDateTime);

        // Extracting values
        from =
          element.from.user != null
            ? element.from.user.displayName
            : element.from.application.displayName;

        at =
          date.getFullYear() +
          "-" +
          (date.getMonth() + 1) +
          "-" +
          date.getDate(); // timezone: +` (${date.toTimeString().match(/\((.+)\)/)[1]})`;

        message = element.body.content.replace(/(<([^>]+)>)/gi, "");

        // Writing to textData
        if (message) {
          textData += from + ` [${at}]: ` + message + `<br>`;
        }
      }
    });
    return textData;
  }
}

module.exports.TeamsChatExportBot = TeamsChatExportBot;
