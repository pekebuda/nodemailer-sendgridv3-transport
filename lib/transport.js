var SendGrid 	= require('sendgrid')
,	pkg 		= require('../package.json')
,	selftils 	= require("./selftils")
;




function Transport(options){
	options = options || {};	//@TODO verify typeof

	this.options = options;
	this.name = 'SendgridWebApiV3';
	this.version = "v0.0.2";
	if (this.options.auth.api_user) {
		//username + password
		this.sendgrid = SendGrid(this.options.auth.api_user, this.options.auth.api_key);
	} else {
		//api_key only
		this.sendgrid = SendGrid(this.options.auth.api_key);
	}
}




Transport.prototype.send = function(mail, callback){
	var email = mail.data;


	//fetch envelope data from the message object
	const ADDRESSES = mail.message.getAddresses();
	const FROM = [].concat(ADDRESSES.from || ADDRESSES.sender || ADDRESSES['reply-to'] || []).shift();
	const TO = [].concat(ADDRESSES.to || []);
	const CC = [].concat(ADDRESSES.cc || []);
	const BCC = [].concat(ADDRESSES.bcc || []);


	//populate from and fromname
	if (FROM & FROM.address) email.from = FROM.address;
	if (FROM & FROM.name) email.fromname = FROM.name;
	//populate to and toname arrays
	email.to = TO.map( function(rcpt){return rcpt.address || '';} );
	email.toname = TO.map( function(rcpt){return rcpt.name || '';} );
	//populate cc and bcc arrays
	email.cc = CC.map( function(rcpt){return rcpt.address || '';} );
	email.bcc = BCC.map( function(rcpt){return rcpt.address || '';} );
	//reformat replyTo to replyto
	if (email.replyTo) email.replyto = selftils.trimReplyTo(email.replyTo);


	//
	email.setCategories = mail.categories;
	email.setFilter = mail.filters;
	email.setSections = mail.sections;
	email.setSubstitutions = mail.substitutions;


	//a list for processing attachments
	var contents = [];
	//email.text could be a stream or a file, so store it for processing
	if (email.text) contents.push({obj: email, key: 'text'});
	//email.html could be a stream or a file, so store it for processing
	if (email.html) contents.push({obj: email, key: 'html'});
	//store attachments for processing, to fetch files, urls and streams
	email.files = email.attachments;
	[].concat(email.files || []).forEach( function(attachment, i){
			contents.push({obj: email.files, key: i, isAttachment: true});
		}
	);
	//fetch values for text/html/attachments as strings or buffers
	//and send mail (thats why callback is included)
	selftils.resolveContent(this, mail, email, contents, 0, callback);
};




module.exports = Transport;