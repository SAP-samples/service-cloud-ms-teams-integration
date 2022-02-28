// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { Client } = require("@microsoft/microsoft-graph-client");

/**
 * This class is a wrapper for the Microsoft Graph API.
 * See: https://developer.microsoft.com/en-us/graph for more information.
 */
class GraphClient {
  constructor(token) {
    if (!token || !token.trim()) {
      throw new Error("GraphClient: Invalid token received.");
    }

    this._token = token;

    // Get an Authenticated Microsoft Graph client using the token issued to the user.
    this.graphClient = Client.init({
      authProvider: (done) => {
        done(null, this._token); // First parameter takes an error if you can't get an access token.
      },
    });
  }

  async GetMyProfile() {
    return await this.graphClient.api("/me").get();
  }

  async getMessages(chatId) {
    return await this.graphClient
      .api("/chats/" + chatId + "/messages?$top=0")
      .get()
      .then((res) => {
        return res;
      });
  }

  async getChatDetails(chatId) {
    return await this.graphClient
      .api("/chats/" + chatId)
      .get()
      .then((res) => {
        return res;
      });
  }

  async getChatMembers(chatId) {
    return await this.graphClient
      .api("/chats/" + chatId + "/members")
      .get()
      .then((res) => {
        return res;
      });
  }
}

exports.GraphClient = GraphClient;
