/***
|''Name''|LoadExternalFiles.js|
|''Description''|Loads external files as shadow tiddler on startup|
|''Author''|Mario Pietsch|
|''Version''|0.0.2|
|''Status''|beta|
|''Source''|https://github.com/pmario/tw2.plugin-dev-template-node/tree/master/tests|
|''License''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''Contributions''|based on: http://tobibeer.tiddlyspace.com/#LoadExternal|
|''~CoreVersion''|2.5.3|
|''Type''|external file|
! Documentation
<<<
If this extension is used as a plugin, you need to create a tiddler named: ExternalFiles
This tiddler needs to contain a list of external files, that should be loaded as shadow tiddlers.
eg:
{{{
./tests/content/SampleText.txt
./tests/content/SampleFile.sh
}}}
<<<
!!! Info 
<<<
* modified by pmario
** removed the window.loadPlugins hijack functions and use "onStartup" instead.
** "startup" signal is created by the core! see: main()
** removed TiddlyWiki.prototype stuff, because not needed. 
<<<
! Code
***/
//{{{
function loadExternalFiles() {
    var fail = '',
        slash = true,
        t = "ExternalFiles",
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
        displayMessage('External File: ' + name + ' loaded!')
        dir = name.lastIndexOf("\\");
        name = (dir >= 0 ? name.substr(dir + 1) : name);
        dir = name.lastIndexOf("\/");
        name = (dir >= 0 ? name.substr(dir + 1) : name);
        if (name.substr(name.length - 3) == '.js')
            name = name.substr(0, name.length - 3);
        config.shadowTiddlers[name] = code;
    } // for (j = 0 ..
    if (fail) { 
        confirm('Failed to load the following external files as defined in your ' + 
            t + '...\n' + fail);
    } // if fail
}

jQuery(document).on("startup", function(){loadExternalFiles()})

//}}}
