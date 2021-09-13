const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const TelegramStrategy = require('..').TelegramStrategy;

const throwError = () => { throw new TypeError('Please provide your credentials through BOT_TOKEN and BOT_NAME envivroment variable. Also set PORT to 80, because widget won\'t work otherwise.') };

const botToken = process.env.BOT_TOKEN || throwError();
const botName = process.env.BOT_NAME || throwError();

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.use(new TelegramStrategy({ botToken: botToken, passReqToCallback: true }, (req, user, done) => {
  console.log(user);

  req.user = user;
  done(null, user)
}));

const app = express();
// Here we create page with auth widget
app.get('/', (req, res) => {
  res.send(`<html>
<head></head>
<body>
  <div id="widget">
      <script 
         async 
         src="https://telegram.org/js/telegram-widget.js?2"
         data-telegram-login="${botName}"
         data-size="medium"
         data-auth-url="/login"
         data-request-access="write"
       ></script>
  </div>
</body>
</html>`);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/login', passport.authenticate('telegram'), (req, res) => {
  res.send(`You logged in! Hello ${req.user.first_name}!`);
});

const port = process.env.PORT || 4600;
app.listen(port, () => {
  console.log(`Go to localhost:${port} and try to login`)
});
