const builder = require('botbuilder');
const siteUrl = require('./site-url');
const spellService = require('./spell-service');
const builder_cognitiveservices = require("botbuilder-cognitiveservices");

const connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const inMemoryStorage = new builder.MemoryBotStorage();
const bot = new builder.UniversalBot(connector).set('storage', inMemoryStorage);

// Middleware for logging
// const logUserConversation = (event) => {
//   console.log(`message: ${event.text}, user: ${event.address.user.id}`);
// };

// bot.use({
//   receive(event, next) {
//     logUserConversation(event);
//     next();
//   },
//   send(event, next) {
//     logUserConversation(event);
//     next();
//   }
// });

const recognizer = new builder_cognitiveservices.QnAMakerRecognizer({
  knowledgeBaseId: process.env.QnAKnowledgebaseId,
  subscriptionKey: process.env.QnASubscriptionKey
});

const basicQnAMakerDialog = new builder_cognitiveservices.QnAMakerDialog({
  recognizers: [recognizer],
  defaultMessage: 'No match! Try changing the query terms!',
  qnaThreshold: 0.3
});

bot.dialog('basicQnAMakerDialog', basicQnAMakerDialog);

bot.dialog(
  '/', // basicQnAMakerDialog);
  [
    (session) => {
      const qnaKnowledgebaseId = process.env.QnAKnowledgebaseId;
      const qnaSubscriptionKey = process.env.QnASubscriptionKey;

      // QnA Subscription Key and KnowledgeBase Id null verification
      if ((qnaSubscriptionKey == null || qnaSubscriptionKey === '') || (qnaKnowledgebaseId == null || qnaKnowledgebaseId == '')) {
        session.send('Please set QnAKnowledgebaseId and QnASubscriptionKey in App Settings. Get them at https://qnamaker.ai.');
      } else {
        session.replaceDialog('basicQnAMakerDialog');
      }
    }
  ]
);


// Spell Check
if (process.env.IS_SPELL_CORRECTION_ENABLED === 'true') {
  bot.use({
    botbuilder(session, next) {
      spellService
        .getCorrectedText(session.message.text)
        .then((text) => {
          session.message.text = text;
          next();
        })
        .catch((error) => {
          console.error(error);
          next();
        });
    }
  });
}
/* DO NOT MODIFY */
// Send welcome when conversation with bot is started, by initiating the root dialog
// bot.on('conversationUpdate', (message) => {
//   if (message.membersAdded) {
//     message.membersAdded.forEach((identity) => {
//       if (identity.id === message.address.bot.id) {
//         const msg = new builder.Message().address(message.address);
//         msg.data.textLocale = 'en-us';
//         msg.data.name = message.address.user.id;
//         msg.data.text = 'Hi. How can I help you today?';
//         bot.send(msg);
//         // bot.beginDialog(message.address, 'greetings:/');
//       }
//     });
//   }
// });

// Enable Conversation Data persistence
bot.set('persistConversationData', true);
bot.set('persistUserData', true);

// Connector listener wrapper to capture site url
const connectorListener = connector.listen();

function listen() {
  return (req, res) => {
    // Capture the url for the hosted application
    // We'll later need this url to create the checkout link
    const url = `${req.protocol}://${req.get('host')}`;
    siteUrl.save(url);
    connectorListener(req, res);
  };
}

// Other wrapper functions
function beginDialog(address, dialogId, dialogArgs) {
  bot.beginDialog(address, dialogId, dialogArgs);
}

function sendMessage(message) {
  bot.send(message);
}

module.exports = {
  listen,
  beginDialog,
  sendMessage
};

/* END DO NOT MODIFY */
