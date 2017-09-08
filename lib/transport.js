var SendGrid 	= require('sendgrid')
,	pkg 		= require('../package.json')
,	selftils 	= require("./selftils")
;




function Transport(options){
	options = options || {};	//@TODO verify typeof

	this.options = options;
	this.name = 'SendgridWebApiV3';
	this.version = "v0.0.1";
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

	//reformat replyTo to replyto
	if (email.replyTo) email.replyto = selftils.trimReplyTo(email.replyTo);

	//fetch envelope data from the message object
	var addresses = mail.message.getAddresses();
	var from = [].concat(addresses.from || addresses.sender || addresses['reply-to'] || []).shift();
	var to = [].concat(addresses.to || []);
	var cc = [].concat(addresses.cc || []);
	var bcc = [].concat(addresses.bcc || []);

	//populate from and fromname
	if (from & from.address) email.from = from.address;
	if (from & from.name) email.fromname = from.name;


	//populate to and toname arrays
	email.to = to.map( function(rcpt){return rcpt.address || '';} );
	email.toname = to.map( function(rcpt){return rcpt.name || '';} );


	//populate cc and bcc arrays
	email.cc = cc.map( function(rcpt){return rcpt.address || '';} );
	email.bcc = bcc.map( function(rcpt){return rcpt.address || '';} );


	/**
	//
	email.addCategory("account");

	//    
    email.addFilter('templates', 'enable', 1);
    email.addFilter('templates', 'template_id', process.env.SENDGRID_ACTIVATE_ACCOUNT_TEMPLATE_ID || "");

	//
    email.addSection();
    
    //
    email.addSubstitution("*|HOST|*", "datary.io");
	**/


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