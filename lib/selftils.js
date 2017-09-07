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