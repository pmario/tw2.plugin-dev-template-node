/***
|''Name''|LoadExternalScripts.js|
|''Description''|Loads external plugins on startup|
|''Author''|Tobias Beer|
|''Version''|0.1.3 (2010-10-05)|
|''Status''|beta|
|''Source''|http://tobibeer.tiddlyspace.com/#LoadExternalScripts.js|
|''Documentation''|http://tobibeer.tiddlyspace.com/#LoadExternal|
|''License''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''Contributions''|Codebase and original idea [[Saq Imtiaz|http://groups.google.com/group/TiddlyWikiDev/browse_thread/thread/7417b8332ad23a10/4ff4fa43141a20e6]]  as documented [[here|http://tiddlywiki.org/wiki/Dev:Developing_and_Testing_a_Plugin#The_Comprehensive_Method]] |
|''~CoreVersion''|2.5.3|
|''Type''|external script|
! Info 
* modified by pmario
** removed the window.loadPlugins hijack functions and use "onStartup" instead.
** "startup" signal is created by the core! see: main()
** removed TiddlyWiki.prototype stuff, because not needed. 
! Code
***/
//{{{
function loadExternal() {
    var fail = '',
        slash = true,
        t = "ExternalScripts",
        loc = getLocalPath(document.location.toString()),
        dir = loc.lastIndexOf("\\"),
        code, name, path, j, js;

    if (!store.tiddlerExists(t) && !store.isShadowTiddler(t)) return;

    if (dir == -1) {
        dir = loc.lastIndexOf("/");
        slash = false;
    } // if dir
    path = loc.substr(0, dir) + (slash ? "\\" : "/");
    js = store.getTiddlerText(t).readBracketedList();
    for (j = 0; j < js.length; j++) {
        name = js[j];
        code = loadFile(path + name);
        if (!code) {
            fail += path + name + '\n';
            continue;
        }
        try {
            eval(code);
        } catch (e) {
            fail = name + ': ' + e;
            break;
        }
        displayMessage('External Plugins: ' + name + ' loaded!')
        dir = name.lastIndexOf("\\");
        name = (dir >= 0 ? name.substr(dir + 1) : name);
        dir = name.lastIndexOf("\/");
        name = (dir >= 0 ? name.substr(dir + 1) : name);
        if (name.substr(name.length - 3) == '.js')
            name = name.substr(0, name.length - 3);
        config.shadowTiddlers[name] = code;
    } // for (j = 0 ..
    if (fail) { 
        confirm('Failed to load the following external plugins as defined in your ' + 
            t + '...\n' + fail);
    } // if fail
}

jQuery(document).on("startup", function(){loadExternal()})

//}}}
