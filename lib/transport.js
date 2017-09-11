var SendGrid 	= require('sendgrid')
,	pkg 		= require('../package.json')
,	selftils 	= require("./selftils")
;




function Transport(options){
	options = options || {};	//@TODO verify typeof

	this.options = options;
	this.name = 'SendgridWebApiV3';
	this.version = "v0.0.5";
	if (this.options.auth.api_user) {
		//username + password
		this.sendgrid = SendGrid(this.options.auth.api_user, this.options.auth.api_key);
	} else {
		//api_key only
		this.sendgrid = SendGrid(this.options.auth.api_key);
	}
}




/**
 * @description 
 * 
 * @param {MailMessage} mail 		Nodemailer-compliant email
 * @param {Object} mail.data
 * @param {Mail} mail.message 
 * @param {MimeNode} mail.message 	Meta informacion exigida por el protocolo 
 * de envio de email (boundary...)			
 * @param {Function} callback 		Funcion invocada a la finalizacion
 * 
 * @return {}
 */
Transport.prototype.send = function(mail, callback){
	var TRANSPORT = this;
	var email = mail.data;


	//fetch envelope data from the message object
	const ADDRESSES = mail.message.getAddresses();
	const FROM = [].concat(ADDRESSES.from || ADDRESSES.sender || ADDRESSES['reply-to'] || []).shift();
	const TO = [].concat(ADDRESSES.to || []);
	const CC = [].concat(ADDRESSES.cc || []);
	const BCC = [].concat(ADDRESSES.bcc || []);


	//populate from and fromname
	if (FROM && FROM.address) email.from = FROM.address;
	if (FROM && FROM.name) email.fromname = FROM.name;
	//populate to and toname arrays
	email.to = TO.map( function(rcpt){return rcpt.address || '';} );
	email.toname = TO.map( function(rcpt){return rcpt.name || '';} );
	//populate cc and bcc arrays
	email.cc = CC.map( function(rcpt){return rcpt.address || '';} );
	email.bcc = BCC.map( function(rcpt){return rcpt.address || '';} );
	//reformat replyTo to replyto
	if (email.replyTo) email.replyto = selftils.trimReplyTo(email.replyTo);


	//https://github.com/sendgrid/sendgrid-nodejs/tree/v2.0.0#available-params
	//https://github.com/sendgrid/smtpapi-nodejs
	email.smtpapi || (email.smtpapi = new TRANSPORT.sendgrid.smtpapi());
	if (email.categories) email.smtpapi.setCategories(email.categories);
	if (email.sections)  email.smtpapi.setSections(email.sections);
	if (email.substitutions) email.smtpapi.setSubstitutions(email.substitutions);
	if (email.filters) email.smtpapi.setFilters(email.filters);


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
	selftils.resolveContent(mail, email, contents, 0, function(e, r){
			if (e) return cb(e);
			//else: operation succesful; send out the e-mail
			return TRANSPORT.sendgrid.send(email, function(err, json){
					return callback(err, json);
				}
			);
		}
	);
};




module.exports = Transport;