# passport-telegram-official

[![Build](https://img.shields.io/travis/Blitss/passport-telegram-official.svg)](https://travis-ci.org/Blitss/passport-telegram-official)
[![Coverage](https://img.shields.io/coveralls/Blitss/passport-telegram-official.svg)](https://coveralls.io/r/Blitss/passport-telegram-official)
[![Quality](https://img.shields.io/codeclimate/github/Blitss/passport-telegram-official.svg?label=quality)](https://codeclimate.com/github/Blitss/passport-telegram-official)
[![Dependencies](https://img.shields.io/david/Blitss/passport-telegram-official.svg)](https://david-dm.org/Blitss/passport-telegram-official)


[Passport](http://passportjs.org/) strategy for authenticating with [Telegram](https://core.telegram.org/widgets/login)
using their Widget.

This module lets you authenticate using Telegram in your Node.js applications.
By plugging into Passport, Telegram authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-telegram-official

    or

    $ yarn add passport-telegram-official

## Usage

#### Create an Application

Before using `passport-telegram-official`, you must register your bot and get a API token. Read more about it on [Telegram Documentation](https://core.telegram.org/bots#3-how-do-i-create-a-bot). Then you must set your domain using `/setdomain` command sent to [@BotFather](https://telegram.me/botfather)

#### Configure Strategy

The Telegram authentication strategy authenticates users using a Telegram
account and Telegram own OAuth. That is simply. Just specify `botToken` and `verify` callback to complete authentication.

```js
passport.use(new TelegramStrategy({
    botToken: BOT_TOKEN
  },
  function(profile, cb) {
    User.findOrCreate({ telegramId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
```

#### Authenticate Requests

Set'up a route to receive requests

```js
app.get('/auth/telegram',
  passport.authenticate('telegram'),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

#### Widget

Generate widget [here](https://core.telegram.org/widgets/login) and paste code on your site. Like this:

```html
<script async src="https://telegram.org/js/telegram-widget.js?2" data-telegram-login="YourBotName" data-size="medium" data-auth-url="/auth/telegram"></script>
```

## Examples

Start a server from `example` folder and go to home page. Note it won't work on `localhost`.

## FAQ

## Contributing

#### Tests

Isn't done yet.

```bash
$ make test
```

## License

[The MIT License](http://opensource.org/licenses/MIT)
