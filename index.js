var SendGridTransport 	= require("./src/sendgrid-transport")
;




module.exports = function(options){
	return new SendGridTransport(options);
};