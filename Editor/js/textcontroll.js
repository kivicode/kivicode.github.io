var codemirror = CodeMirror.fromTextArea(document.getElementById("tryit"), {
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
    theme: 'dracula',
  })


var noHint = [" ", ",", "."]
codemirror.on('keypress', function(instance, event) {
    // console.log("Key =", !noHint.includes(event.key));
    if(!noHint.includes(event.key)){
    	snippet()
    }
});


  // スニペットの配列
function getSnippets(intext){
	var snippets = [
		{ text: 'var', displayText: 'var declarations' },
        { text: 'Cylinder([fromX, fromY, fromZ], [toX, toY, toZ], radius)', displayText: 'Cylinder: draw cylinder with params: (start_point, end_point, radius)' },
        { text: 'Sphere(radius)', displayText: 'Shere: draw sphere in coordinate zero with params: (radius)' },
        { text: 'Sphere([centerX, centerY, centerZ], radius)', displayText: 'Sphere: draw sphere with params: (cetner_point, radius)' },
        { text: 'Cube(size)', displayText: 'Cube: draw cube in coordinate zero with params: (size)' },
		{ text: 'Cube([centerX, centerY, centerZ], size)', displayText: 'Cube: draw cube with params: (cetner_point, radius)' },
        { text: 'diff(B)', displayText: 'Intersect: return figure: B limited inside figure A' },
        { text: 'cut(B)', displayText: 'Substract: return figure B cutted from figure A' },
        { text: 'add(B)', displayText: 'Union: return figure B added to figure A' }
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
			// println(value)
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
