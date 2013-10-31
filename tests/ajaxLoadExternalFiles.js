/***
|''Name''|ajaxLoadExternalFiles.js|
|''Description''|Loads external files as shadow tiddler on startup|
|''Author''|Mario Pietsch|
|''Version''|0.1.0|
|''Date''|2013.10.31|
|''Status''|beta|
|''Source''|https://github.com/pmario/tw2.plugin-dev-template-node/tree/master/tests|
|''License''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion''|2.7.1|
|''Type''|external file url|
! Documentation
<<<
If this extension is used as a plugin, you need to create / import 2 tiddlers named: 
* ''[[ExternalFiles]]''
** This tiddler needs to contain a list of external files, that should be loaded.
* ''[[ExternalFilesConfig]]''
** This tiddler must contain 2 sections: ''host'' and ''list''
** If the "list" tiddler doesn't exist at the server, ExternalFiles tiddler will be used.
*** otherwise ExternalFiles will be //ignored//
** see: ExternalFilesConfig for more info!

Pathnames have to be relative!
eg:
{{{
tests/content/SampleText.txt
tests/content/SampleFile.sh
}}}
<<<
!!! Known Issues
* Chrome can't handle the local "file://" setting very well
** Loading external files from a URL works well. 
!!! History
<<<
* v0.1.0 - 2013.10.31
** complete rewrite to handle "remote files"
** drop in replacement for loadExternalFiles.js
<<<
! Code
***/
//{{{
function ajaxLoadExternalFiles($, window, document) {
	var ef = "ExternalFiles",
		efc = "ExternalFilesConfig",
		logName = "externalFiles.log";

	var efConfig = {}, logArr = [];

	// none ... not supported atm
	// lower index shows less info.
	// tiddler .. has special handling atm! TODO:fix this
	var logLevels = ["none", "count", "error", "verbose", "tiddler"]

	if (!store.tiddlerExists(ef) && !store.isShadowTiddler(ef)) {
		displayMessage("Error: External File Handling - loadExternalFiles.js")
		displayMessage(ef + " is missing. External file handling stopped!")
		return;
	}
	if (!store.tiddlerExists(efc) && !store.isShadowTiddler(efc)) {
		displayMessage("Error: External File Handling - loadExternalFiles.js")
		displayMessage(efc + " is missing. External file handling stopped!")
		return;
	}

	function loadLocalFiles(conf) {
		var slash = true,
			loc = getLocalPath(document.location.toString()),
			dir = loc.lastIndexOf("\\"),
			code, name, path, j, fList;

		if (dir == -1) {
			dir = loc.lastIndexOf("/");
			slash = false;
		} // if dir
		path = loc.substr(0, dir) + (slash ? "\\" : "/");

		code = loadFile(path + conf.list); 
		if (code) {
			fList = code.readBracketedList();
			log("count", conf.list + " contains " + fList.length + " elements"); 
		} else {
			log("error", "Error: \"" + path + conf.list + "\" is empty or doesn't exist!");
			log("error", " - We use: \"" + ef + "\" instead!");
			log("error", " - Check: \"" + efc + "\"!");
			
			fList = store.getTiddlerText(ef);
			fList = fList ? fList.readBracketedList() : [];
			log("count", ef + " contains " + fList.length + " elements"); 
		} // if code

		// suspend refresh mechanism to speed up tiddler creation
		store.suspendNotifications();

		for (j = 0; j < fList.length; j++) {
			name = fList[j];
			code = loadFile(path + name);
			
			if (code) {
				createTiddler(name, {responseText: code});
			} else {
				log("error", "Error: \"" + path + name + "\" is empty or doesn't exist!");
			}

		} // for (j = 0 ..

		log("count", conf.tidCreated + " tiddler(s) and " + conf.shadowCreated + " shadow tiddler(s) created!" )
		log("tiddler", "--------------")

		// resume notifications
		store.resumeNotifications();
		// selectively refresh the sidebar, so displayed messages stay open.
		refreshElements(document.getElementById("sidebarTabs"));	
	}; // function loadLocalFiles

	// 4 .. Log verbose to tiddler (allways)
	// 3 .. verbose display .. (default)
	// 2 .. error only display
	// 1 .. display number of external tiddlers
	// 0 .. don't log .. not supported atm
	function log(aktlvl, msg) {
		logArr[logArr.length] = msg;
		
		if (logLevels.indexOf(aktlvl) <= efConfig.log) { 
			displayMessage(msg);
		}
		if (aktlvl == "tiddler"){ 
			createTiddler(logName, {responseText:logArr.join("\n")})
		}
	} // function log()

	// Create a temporary tiddler or a shadow tiddler
	// Subdirectories are converted to tiddler tags!
	// Subdir "shadow" will be a shadow tiddler. No tags possible
	function createTiddler(name, jqXHR) {
		var idx = name.lastIndexOf("\\");
		var url = (idx >= 0 ? name.substr(idx + 1) : name);
		idx = url.lastIndexOf("\/");
		var xname = (idx >= 0 ? name.substr(idx + 1) : name);

		var tags = url.split("/");
		
		//remove the last element -> file name
		tags = tags.slice(0, tags.length-1)

		// common behaviour for js files
		//if (xname.substr(xname.length - 3) == '.js')
		//	xname = xname.substr(0, xname.length - 3);

		if (tags.indexOf("shadow") >= 0) {
			config.shadowTiddlers[xname] = jqXHR.responseText;
			efConfig.shadowCreated++;
		} else {
			// title,newTitle,newBody,modifier,modified,tags,fields
			store.saveTiddler(xname, xname, jqXHR.responseText, 
					config.options.txtUserName, new Date(), tags, {doNotSave:"true"}, true )
			efConfig.tidCreated++;
			// since these tiddlers can't be saved store is not dirty
			store.setDirty(false);
		} // if tags.indexOf 
		log("verbose", 'Tiddler: ' + name + ' created -> ' + xname)
	} // function createShadowTiddler()

	// Get the list of files to be loaded, from the server
	// ExternalFileConfig tiddler contains the configuration
	// If no file is found on the server use: ExternalFiles tiddler 
	function getServerFileList(conf) {
		var ts = "?_=" + new Date().getTime();// + Math.random();
		var flist = conf.host + conf.list + ts;
		var logLvl = conf.log;
		
		jQuery.ajax({ type: "GET", url: flist, processData: false})
		.done(function(data, status, jqXHR) {
			// jqXHR.done(function( data, textStatus, jqXHR ) {});

				var files = jqXHR.responseText.readBracketedList();
				if (files) {
					getAll(conf, files);
					log("count", conf.list + " contains " + files.length + " elements"); 
				}
			} // .done
		).fail(function(jqXHR, textStatus, errorThrown) {
			// jqXHR.fail(function( jqXHR, textStatus, errorThrown ) {});
				
				// min loglvl error
				// log("error", "Error: External File Handling - loadExternalFiles.js")
				log("error", "ServerFileList not found. Check: " + efc + "!")
				log("error", "Using: ExternalFiles tiddler!")
				
				files = store.getTiddlerText("ExternalFiles")
				files = files ? files.readBracketedList() : [];
				
				if (files.length > 0) {
					getAll(conf, files)
				}
				else { 
					log("error", " - ExternalFiles tiddler is empty!")
					log("tiddler", "------")
				}
			} // .fail
		)
	} // function getServerFileList()

	// reads a single file from the server
	// this function is called in a loop at getAll()
	function getFile(conf, file) {
		var ts = "?_=" + new Date().getTime();// + Math.random();
		var f = conf.host + file + ts;
		var fx = file;
		jQuery.ajax({ type: "GET", url: f, processData: false, xconf: conf })
		.done(function(data, status, jqXHR){
				createTiddler(fx, jqXHR)
			}
		).fail(function(a,b,c){
				var files;
				log("error", "Error: \"" + this.xconf.host + file + "\" "+c+"!");
			}
		).always(function(a,b,c){
			if (this.xconf.i+1 >= this.xconf.lenList) {
				log("count", conf.tidCreated + " tiddler(s) and " + conf.shadowCreated + " shadow tiddler(s) created!" )
				log("tiddler", "--------------")

				// resume notifications ... suspend see getAll()
				store.resumeNotifications();
				// selectively refresh the sidebar, so displayed messages stay open.
				refreshElements(document.getElementById("sidebarTabs"));
			}
		}) // .always
	} // function getFile()

	function getAll(conf, files) {
		var i, f = files;
		conf.lenList = files.length;
		
		// getFile resumes the notifications again
		store.suspendNotifications();
		
		for (i = 0; i < f.length; i++) {
			conf.i = i;
			getFile(conf, f[i]);
		}
	} // function getAll()

	// ----------------------------------------------------------------------------
	// main 
	
	// get settings
	efConfig["host"] = store.getTiddlerSlice(efc, "host") || "";
	efConfig["list"] = store.getTiddlerSlice(efc, "list") || "";
	efConfig["log"] = store.getTiddlerSlice(efc, "log") || "count"; // count is the minimum feedback!
	efConfig.tidCreated = 0;		// global tiddler counter needed for minimal feedback
	efConfig.shadowCreated = 0;		// global shadow counter
	
	efConfig.log = logLevels.indexOf(efConfig.log)
	
	if (! (efConfig["host"] && efConfig["list"])) {
		displayMessage("External File Configuration Error -> Check: " + efc + "!")
		return false;
	}

	if (document.location.protocol == "file:") {
		loadLocalFiles(efConfig);
	} else {
		// Read the file list from the server.
		// If the server has no ServerFileList, ExternalFiles tiddler will be used as a fallback.
		getServerFileList(efConfig);
	} // if local
}

jQuery(document).on("startup", function(){ajaxLoadExternalFiles(window.jQuery, window, document)})

//}}}
