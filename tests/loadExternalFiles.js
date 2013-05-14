/***
|''Name''|LoadExternalFiles.js|
|''Description''|Loads external files as shadow tiddler on startup|
|''Author''|Mario Pietsch|
|''Version''|0..0.1|
|''Status''|alpha|
|''Source''||
|''Documentation''||
|''License''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''Contributions''|based on: http://tobibeer.tiddlyspace.com/#LoadExternal|
|''~CoreVersion''|2.5.3|
|''Type''|external file|
!Code
***/
//{{{
TiddlyWiki.prototype.isTiddler = function (title) {
    return store.tiddlerExists(title) || store.isShadowTiddler(title);
}

function loadExternalFile() {
    var fail = '',
        slash = true,
        t = "ExternalFiles",
        loc = getLocalPath(document.location.toString()),
        dir = loc.lastIndexOf("\\"),
        code, name, path, j, js;

    if (!store.isTiddler(t)) return;

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
        //~ try {
            //~ eval(code);
        //~ } catch (e) {
            //~ fail = name + ': ' + e;
            //~ break;
        //~ }
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

loadFilesEXT = window.loadPlugins;

window.loadPlugins = function () {
    loadFilesEXT.apply(this, arguments);
    loadExternalFile.apply(this, arguments);
}

//FIX: to handle shadows
TiddlyWiki.prototype.getTiddlerText = function (title, defaultText) {
    if (!title)
        return defaultText;
    var pos = title.indexOf(config.textPrimitives.sectionSeparator);
    var section = null;
    if (pos != -1) {
        section = title.substr(pos + config.textPrimitives.sectionSeparator.length);
        title = title.substr(0, pos);
    }
    pos = title.indexOf(config.textPrimitives.sliceSeparator);
    if (pos != -1) {
        var slice = this.getTiddlerSlice(title.substr(0, pos), title.substr(pos + config.textPrimitives.sliceSeparator.length));
        if (slice)
            return slice;
    }

    var tiddler = this.fetchTiddler(title);

    //FIX: new variable 'text' for tiddler.text
    var text = tiddler ? tiddler.text : (this.isShadowTiddler(title) ? this.getShadowTiddlerText(title) : null);

    //check for text to get sections of shadows as well
    if (text) {
        if (!section) return text;
        var re = new RegExp("(^!{1,6}[ \t]*" + section.escapeRegExp() + "[ \t]*\n)", "mg");
        re.lastIndex = 0;
        var match = re.exec(text);
        if (match) {
            var t = text.substr(match.index + match[1].length);
            var re2 = /^!/mg;
            re2.lastIndex = 0;
            match = re2.exec(t); //# search for the next heading
            if (match)
                t = t.substr(0, match.index - 1); //# don't include final \n
            return t;
        }
        return defaultText;
    }
    if (defaultText != undefined)
        return defaultText;
    return null;
};

//}}}
