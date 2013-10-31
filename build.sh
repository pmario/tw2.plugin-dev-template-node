#!/bin/bash

# Check our environment variables
if [ -z "$TIDDLYWIKI5_DIR" ]; then
  export TIDDLYWIKI5_DIR="../../tiddlywiki/TiddlyWiki5"
fi

if [ -z "$TIDDLYWIKI_PULLED" ]; then
    export TIDDLYWIKI_PULLED=$PWD/pulled
fi

if [ -z "$TIDDLYWIKI_DEST" ]; then
    export TIDDLYWIKI_DEST=$PWD
fi

# Create directories

mkdir -p $TIDDLYWIKI_PULLED
mkdir -p $TIDDLYWIKI_DEST

# Pull content from TiddlySpace

#curl -o $TIDDLYWIKI_PULLED/tiddlywiki-com-ref.tiddlers.json "http://tiddlywiki-com-ref.tiddlyspace.com/bags/tiddlywiki-com-ref_public/tiddlers.json?fat=1;select=tag:!systemConfig;select=title:!PageTemplate;select=title:!tiddlywiki-com-refSetupFlag;select=title:!MarkupPreHead"
#curl -o $TIDDLYWIKI_PULLED/tiddlywiki-com.tiddlers.json "http://tiddlywiki-com.tiddlyspace.com/bags/tiddlywiki-com_public/tiddlers.json?fat=1;select=tag:!systemConfig;select=title:!PageTemplate;select=title:!tiddlywiki-comSetupFlag;select=title:!MarkupPreHead"
#curl -o $TIDDLYWIKI_PULLED/DownloadTiddlyWikiPlugin.json "http://tiddlywiki-com.tiddlyspace.com/bags/tiddlywiki-com_public/tiddlers.json?fat=1;select=title:DownloadTiddlyWikiPlugin"
curl -o $TIDDLYWIKI_PULLED/SimpleSearchPlugin.json "http://tiddlywiki-com.tiddlyspace.com/bags/tiddlywiki-com_public/tiddlers.json?fat=1;select=title:SimpleSearchPlugin"
#curl -o $TIDDLYWIKI_PULLED/ExamplePlugin.json "http://tiddlywiki-com.tiddlyspace.com/bags/tiddlywiki-com_public/tiddlers.json?fat=1;select=title:ExamplePlugin"

# Build TiddlyWiki

if [ $1 ]; then
  NAME=$1
else
  NAME=upstream 
fi

node $TIDDLYWIKI5_DIR/tiddlywiki.js $TIDDLYWIKI5_DIR/editions/tw2 \
	--verbose \
	--load ./$NAME.html.recipe \
	--new_rendertiddler $:/core/templates/tiddlywiki2.template.html $TIDDLYWIKI_DEST/$NAME.html text/plain

# open the file
#`cat OPEN_COMMAND` $NAME.html

# upload stuff
#./upload.sh file.tid ... $(FILE_LIST)
