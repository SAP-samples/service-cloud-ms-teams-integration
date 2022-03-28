const axios = require('axios');
const env = process.env;

class IntegrationSuite {
  getUrl(endpoint) {
    return env.iFlowUrl + endpoint;
  }

  getHttpConfig() {
    return {
      headers: {
        'Authorization': this.encodeAuthBasic(env.iFlowClientId,  env.iFlowClientSecret),
        'Content-Type': 'application/json'
      }
    };
  }

  encodeAuthBasic(id, password) {
    return 'Basic ' + Buffer.from(id + ':' + password, 'utf8').toString('base64');
  }

  getTicketById(ticketId, textData) {
    return new Promise((resolve, reject) => {
      const jsonBody = {
        authBasic: this.encodeAuthBasic(env.c4cApiId, env.c4cApiPassword),
        ticketId: ticketId
      };
      axios
        .post(
          this.getUrl('/http/Ticket'),
          jsonBody,
          this.getHttpConfig()
        )
        .then((response) => {
          const ticket = response.data.d.results;
          resolve({
            ID: ticket.ID,
            ObjectID: ticket.ObjectID,
            xCsrfToken: response.headers['x-csrf-token'],
            Cookie: response.headers['set-cookie'].join(';'),
            textData: textData
          });
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  postTextCollection(ticket) {
    return new Promise((resolve, reject) => {
      const jsonBody = {
        authBasic: this.encodeAuthBasic(env.c4cApiId, env.c4cApiPassword),
        xCsrfToken: ticket.xCsrfToken,
        Cookie: ticket.Cookie,
        ParentObjectID: ticket.ObjectID,
        TypeCode: '10007',
        Text: ticket.textData
      };
      axios
        .post(
          this.getUrl('/http/TicketTextCollection'),
          jsonBody,
          this.getHttpConfig()
        )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  getEmployeeIdentityUuidByEmail(email) {
    return new Promise((resolve, reject) => {
      const jsonBody = {
        authBasic: this.encodeAuthBasic(env.c4cApiId, env.c4cApiPassword),
        filter: encodeURI(`Email eq '` + email + `'`)
      };
      axios
        .post(
          this.getUrl('/http/EmployeeIdentityUuidByEmail'),
          jsonBody,
          this.getHttpConfig()
        )
        .then((response) => {
          if (response.data.d && response.data.d.results && response.data.d.results.length > 0 && response.data.d.results[0].IdentityUUID) {
            resolve(response.data.d.results[0].IdentityUUID);
          } else {
            reject('Cannot find your email "' + email + '" among C4C employees');
          }
        })
        .catch((error) => {
          console.log('getEmployeeIdentityUuidByEmail catch', error);
          reject(error);
        });
    });
  }

  getTicketsByCreationIdentityUuid(uuid) {
    return new Promise((resolve, reject) => {
      const jsonBody = {
        authBasic: this.encodeAuthBasic(env.c4cApiId, env.c4cApiPassword),
        filter: encodeURI(`CreationIdentityUUID eq (guid'` + uuid + `')`)
      };
      axios
        .post(
          this.getUrl('/http/TicketsByCreationIdentityUuid'),
          jsonBody,
          this.getHttpConfig()
        )
        .then((response) => {
          if (response.data.d.results && response.data.d.results.length > 0) {
            resolve(this.convertToSimpleTickets(response.data.d.results));
          } else {
            reject("You have no ticket.");
          }
        })
        .catch((error) => {
          console.log('getTicketsByCreationIdentityUuid catch', error);
          reject(error);
        });
    });
  }

  convertToSimpleTickets(tickets) {
    const simpleTickets = [];
    tickets.forEach((ticket) => {
      simpleTickets.push({
        ID: ticket.ID,
        Name: ticket.Name,
        BuyerMainContactPartyName: ticket.BuyerMainContactPartyName
      });
    });
    return simpleTickets;
  }
}
module.exports = new IntegrationSuite();
