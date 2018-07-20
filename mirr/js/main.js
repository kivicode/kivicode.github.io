(function () {

	var _glob_keywords = [ [ "key1", "keyword1" ],
                       [ "key2", "keyword2" ]
                     ] ;

var cm_custom_check_stream_fn = function( stream )
{
    for( var _i = 0 ; _i < _glob_keywords.length ; _i++ )
    {
        if ( stream.match( _glob_keywords[_i][0] ) ) return _glob_keywords[_i][1] ;
    }
    return "" ;
}

CodeMirror.defineMode("md", function()
{
    return {
    token: function(stream,state)
            {
                var _ret = cm_custom_check_stream_fn( stream ) ;
                if ( _ret.length > 0 ) return _ret ;
                else { stream.next(); return null; }
            }
           };
});

  var codemirror = CodeMirror.fromTextArea(document.getElementById("java-code"), {
    // value: '// CodeMirror Addon hint/show-hint.js sample.\n// Snippets are Ctrl-E or Cmd-E.',
    mode: 'javascript',
    lineNumbers: true,
    matchBrackets: true,
    indentUnit: 4,
    indentWithTabs: true,
    autoCloseTags: true,
    autoCloseBrackets: true,
    matchTags: true,
    // styleActiveLine: true,
    closeBrackets: "()[]{}''\"\"``",
    hintOptions: {
		tables: {
		"table1": ["col_A", "col_B", "col_C"],
		"table2": ["other_columns1", "other_columns2"]
		}
	},
    theme: 'dracula'
  })


var noHint = [" ", ",", "."]
codemirror.on('keypress', function(instance, event) {
    console.log("Key =", !noHint.includes(event.key));
    if(!noHint.includes(event.key)){
    	snippet()
    }
});

function println(i){
console.log(i)
}

  // スニペットの配列
function getSnippets(intext){
	var snippets = [
		{ text: 'var', displayText: 'var declarations' },
		{ text: 'Rect(cornerX, cornerY, width, height)', displayText: 'Rect: draw rectangle with params (x, y, width, height)' }
	]
	var splt = intext.split("function ")
	if(splt.length > 1){
		splt.forEach(value => {
			value = value.trim().split("(")[0]
			if(value != ""){
				snippets.push({text: value, displayText: value})
			}
		})
	}
	var nsplt = intext.split("var ")
	if(nsplt.length > 1){
		nsplt.forEach(value => {
			value = value.split(" =")[0]
			println(value)
			if(!value.startsWith("function")){
				snippets.push({text: value, displayText: value})
			}
			// if(value != ""){
			// 	snippets.push({text: value, displayText: value})
			// }
	})}
	
	// snippets.push({text: 'variable', displayText: 'test'})
	return snippets
}
  function snippet() {
    CodeMirror.showHint(codemirror, function (){

    var cursor = codemirror.getCursor()
    var token = codemirror.getTokenAt(cursor)
    var start = token.start
    var end = cursor.ch
    var line = cursor.line
    var currentWord = token.string
    var snips = getSnippets(codemirror.getValue())

    var list = []
    snips.forEach(value => {
		var full = value["text"]
		var descriptoin = value["displayText"]
		if(full.includes(currentWord)){
			list.push({text: full, displayText: descriptoin})
		}
 	})  


    return {
    	list: list.length ? list : [],
        from: CodeMirror.Pos(line, start),
        to: CodeMirror.Pos(line, end)}
    }, { completeSingle: false })
  }
})()