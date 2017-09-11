/**
 * @description 
 * if in "name" <address@example.com> format, reformat to just address@example.com
 * 
 * @param  {String} a 		[description]
 * @return {String}   		[description]
 */
exports.trimReplyTo = function(a){
	if (a.indexOf('<') >= 0 && a.indexOf('>') > 0) {
		return a.substring(a.indexOf('<')+1, a.indexOf('>'));  
    } 
	return a;
};




/**
 * @description 
 * fetch values for text/html/attachments as strings or buffers
 * this is an asynchronous action, so we'll handle it with a simple recursion
 * function
 *
 * 
 * @param {NodemailerMail} mail 	[description]
 * @param {SendgridMail} email 		[description]
 * @param {Array} attachments
 * @param {Number} position   		Indice sobre attachments
 * @param {Function} signal  		Funcion ejecutada a la conclusion FINAL del 
 * iter recursivo; es decir, no con cada llamada de la misma en un ciclo 
 * recursivo.
 */
exports.resolveContent = function(mail, email, attachments, position, signal){
	//@TODO if no position is passed, assume it is the begining of the recursion


	// if all parts are processed, end recursion successfully
	if (position >= attachments.length) return signal(null, true);


	// get the next element from the processing list
	var file = attachments[position++];
	//We need to store a pointer to the original attachment object in case
	//resolveContent replaces it with the Stream value
	var prevObj = file.obj[file.key];
	// ensure the object is an actual attachment object, not a string, buffer or a stream
	if (prevObj instanceof Buffer ||  typeof prevObj === 'string' || (prevObj && typeof prevObj.pipe === 'function')) {
		prevObj = {content: prevObj};
	}

	// use the helper function to convert file paths, urls and streams to strings or buffers
	mail.resolveContent(file.obj, file.key, function(err, content){
			if (err) return signal(err);

			//
			if (!file.isAttachment) {
				// overwrites email.text and email.html content
				file.obj[file.key] = content;
			} else {
				// If the object is a String or a Buffer then it is most likely replaces by resolveContent
				if (file.obj[file.key] instanceof Buffer ||  typeof file.obj[file.key] === 'string') {
					file.obj[file.key] = prevObj;
				}

				file.obj[file.key].content = content;
				if (file.obj[file.key].path) {
					if (!file.obj[file.key].filename) {
						// try to detect the required filename from the path
						file.obj[file.key].filename = file.obj[file.key].path.split(/[\\\/]/).pop();
					}
					delete file.obj[file.key].path;
				}

				//set default filename if filename and content-type are not set (allowed for Nodemailer but not for SendGrid)
				if (!file.obj[file.key].filename && !file.obj[file.key].contentType) {
					file.obj[file.key].filename = 'attachment-' + position + '.bin';
				}
			}
			exports.resolveContent(mail, email, attachments, position, signal);
		}
	);
};