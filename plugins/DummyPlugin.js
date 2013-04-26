/***
|''Name''|HelloWorldButtonPlugin|
|''Description''|<...>|
|''Icon''|<...>|
|''Author''|<...>|
|''Contributors''|<...>|
|''Version''|<...>|
|''Date''|<...>|
|''Status''|<//unknown//; @@experimental@@; @@beta@@; //obsolete//; stable>|
|''Source''|<...>|
|''CodeRepository''|<...>|
|''Copyright''|<...>|
|''License''|<...>|
|''CoreVersion''|<...>|
|''Requires''|<...>|
|''Overrides''|<...>|
|''Feedback''|<...>|
|''Documentation''|<...>|
|''Keywords''|<...>|
!!!Usage
<<<
{{{
<<helloWorldButton>>
}}}
<<helloWorldButton>>
{{{
<<helloWorldButton 'some button text'>>
}}}
<<helloWorldButton 'some button text'>>
<<<
!!!Note
<<<
*Not all elements are needed
*Requires and CoreVersion are checked by the core, at startup time
*See: http://tiddlywiki.org/wiki/Dev:Plugin_Specifications for more info
<<<
***/
//{{{

version.extensions.HelloWorldButtonPlugin = {major: 0, minor: 1, revision: 0, date: new Date(2010,8,14)};

(function ($) {

var me;		// used as a shortcut for config.macros.helloWorld 
		// most of the times this could be used instead.

config.macros.helloWorldButton = me = {

	// should be done for easy localisation
	locale: {
		lblButton: "Hello World",
		txtTooltip: "Click me!",
		txtHelloWorld: "Hello World",
		txtDataText: "jQuery data text is: %0",
		txtDataVal: "jQuery data value is: %0",
	},

	handler: function(place, macroName, params, wikifier, paramString, tiddler){
		var btn = null;
		var btnText = params[0] || me.locale.lblButton;

		// next line is only used as a reminder
		// createTiddlyButton(parent, text, tooltip, action, className, id, accessKey, attribs)			
		btn = createTiddlyButton(place, btnText, me.locale.txtTooltip, me.onClick, 'button', 'btnHelloWorld');

		// adding a jQuery data object to the button 
		var result = $(btn).data('data', {'text': 'some text', 'val': 10});
		// console.log(result);
	},

	onClick: function() {
		var data = $(this).data("data");
 
		alert(	me.locale.txtHelloWorld + '\n' +
			me.locale.txtDataText.format([data.text]) + '\n' +
			me.locale.txtDataVal.format([data.val]) + '\n'
			);
	}

}; // end of hello world

}) (jQuery);
//}}}

