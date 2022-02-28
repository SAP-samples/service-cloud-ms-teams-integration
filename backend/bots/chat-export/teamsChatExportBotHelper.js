const moment = require("moment");

class TeamsChatExportBotHelper {
  async checkToken(context, action, connection) {
    const magicCode =
      action.state && Number.isInteger(Number(action.state))
        ? action.state
        : "";

    const tokenResponse = await context.adapter.getUserToken(
      context,
      connection,
      magicCode
    );
    return tokenResponse;
  }

  async sendSigninLink(context, connection) {
    // There is no token, so the user has not signed in yet.
    // Retrieve the OAuth Sign in Link to use in the MessagingExtensionResult Suggested Actions
    const signInLink = await context.adapter.getSignInLink(context, connection);

    return {
      composeExtension: {
        type: "silentAuth",

        suggestedActions: {
          actions: [
            {
              type: "openUrl",
              value: signInLink,
              title: "Bot Service OAuth",
            },
          ],
        },
      },
    };
  }

  async validateDates(filter, chatStart, chatEnd) {
    return await new Promise(function (resolve, reject) {
      if (filter.startDate > filter.endDate) {
        reject({
          status: false,
          reason: "Export start date cannot be greater than export end date.",
        });
        // } else if (filter.startDate < chatStart || filter.endDate > chatEnd) {
        //   reject({
        //     status: false,
        //     reason: "Dates are out of bound.",
        //   });
      } else if (
        filter.startDate == filter.endDate &&
        filter.startTime > filter.endTime
      ) {
        reject({
          status: false,
          reason: "Export start time cannot be greater than export end time.",
        });
      } else {
        resolve({
          status: true,
          reason: "Date is right.",
        });
      }
    });
  }

  getSelectiveExportStatus(data) {
    if (data.startDate === data.endDate) {
      return (
        "Selected messages of " +
        moment(data.startDate).format("MMMM Do, YYYY") +
        " [" +
        moment(data.startTime, "HH:mm").format("hh:mm A") +
        " - " +
        moment(data.endTime, "HH:mm").format("hh:mm A") +
        "] are successfully attached to the ticket."
      );
    } else {
      return (
        "Selected messages between " +
        moment(data.startDate).format("MMMM Do, YYYY") +
        " [" +
        moment(data.startTime, "HH:mm").format("hh:mm A") +
        "] and " +
        moment(data.endDate).format("MMMM Do, YYYY") +
        " [" +
        moment(data.endTime, "HH:mm").format("hh:mm A") +
        "] are successfully attached to the ticket."
      );
    }
  }
}

module.exports = new TeamsChatExportBotHelper();
