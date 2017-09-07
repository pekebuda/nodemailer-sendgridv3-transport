# nodemailer-sendgridv3-transport

Sendgrid Web API v3 transport for nodemailer

This module is a transport plugin for [Nodemailer](https://github.com/andris9/Nodemailer) that makes it possible to send through [SendGrid's Web API](https://sendgrid.com/docs/API_Reference/Web_API/mail.html)!




## Important notice 

Contrary to what is stated in de description, currently this library is based on 
[sendgrid's npm library v2](https://github.com/sendgrid/sendgrid-nodejs/tree/v2.0.0)



## Usage
Install via npm.

	npm install nodemailer-sendgridv3-transport

Require the module and initialize it with your SendGrid credentials.

```javascript
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgridv3-transport');

// api key https://sendgrid.com/docs/Classroom/Send/api_keys.html
var options = {
	auth: {
		api_key: 'SENDGRID_APIKEY'
	}
}

// or

// username + password
var options = {
	auth: {
		api_user: 'SENDGRID_USERNAME',
		api_key: 'SENDGRID_PASSWORD'
	}
}
	
var mailer = nodemailer.createTransport(sgTransport(options));
```

Note: We suggest storing your SendGrid username and password as enviroment variables.

Create an email and send it off!

```javascript
var email = {
	to: ['joe@foo.com', 'mike@bar.com'],
	from: 'roger@tacos.com',
	subject: 'Hi there',
	text: 'Awesome sauce',
	html: '<b>Awesome sauce</b>'
};

mailer.sendMail(email, function(err, res) {
		if (err) console.log(err) 
		console.log(res);
	}
);
```




## Deploying

* Confirm tests pass
* Bump the version in `README.md`, `package.json`, `test/main.js`
* Update `CHANGELOG.md`
* Confirm tests pass
* Commit `Version bump vX.X.X`
* `npm publish`
* Push changes to GitHub
* Release tag on GitHub `vX.X.X`




## Credits 

Based on the library [nodemailer-sendgrid-transport](https://github.com/sendgrid/nodemailer-sendgrid-transport) 
by [SendGrid](https://sendgrid.com/).




## License
Licensed under the MIT License.