/* globals require, module */

module.exports = function (htmltext, opts) {
	// here you can modify htmltext to change the HTML code
	// after compiling it with Pandoc

	/*
	 * inject live-reload code
	 */
    if (opts.cfg.injectLiveReload) {
    	var liveReloadSnippet = "<script>" +
            "document.write('<script src=\"http://'" +
        	"+ (location.host || 'localhost').split(':')[0]" +
        	"+ ':" + opts.cfg.livereload_port + "/livereload.js?snipver=1\"></'" +
        	"+ 'script>');" +
            // inject livereload plugin for filtering changes by filename
            // to prevent multiple page reloads when multiple output files change
            "window.onload = function () {" +
            "  var filterPlugin = { reload: function (path) { " +
            "    var pathParts = path.split(/\\/|\\\\/g);" +
            "    var locationParts = window.location.pathname.split('/');" +
            "    console.log(pathParts[pathParts.length-1] + ' =? ' + locationParts[locationParts.length - 1]);" +
            "    return pathParts[pathParts.length-1] != locationParts[locationParts.length - 1];" +
            "  }};" +
            "  window.LiveReload.reloader.addPlugin(filterPlugin);" +
            "};" +
            "</script>";
        htmltext = htmltext.replace("</body>", liveReloadSnippet + "\n</body>");
    }

	return htmltext;
};
