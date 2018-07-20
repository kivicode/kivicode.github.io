
var prevmesh = null
var tryit = codemirror.getInputField();
var timeout = null;
var viewer = new Viewer(new CSG(), window.innerWidth-20, window.innerHeight*.55, 10);
var dep = 5;
addViewer(viewer);
function rebuild(save=false) {
  var error = document.getElementById('error');
  try {
    var solid = new Function(codemirror.getValue())();
    error.innerHTML = '';
    var m = eval(solid).toMesh()
    if(save){
      saveOBJ(m)
    }
    viewer.mesh = m;
    viewer.gl.ondraw();
  } catch (e) {
    error.innerHTML = 'Error: <code>' + e.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code>';
  }
}

function stringifyVertex(vec){
  try{
    return "vertex X"+vec[0]+" Y"+vec[1]+" Z"+vec[2]+" \n";
  } catch (e) {
    return ""
  }
}

function saveOBJ(geometry){
  var trias = geometry.triangles
  var verts = geometry.vertices
  var objOut = ""
  verts.forEach(function(v){
    objOut += "v " + toTextS(v, 3, 100)
  })

  trias.forEach(function(f){
    objOut += "f " + toTextS(f, 0, 1, 1)
  })
  Save(objOut);
  // downloadString(objOut, "text/plain", name + ".obj")
}


function Export(text){
  var name = "untitled"
  swal({
    type: "question",
    title: 'Enter file name',
    input: 'text',
    showCancelButton: true,
    closeOnConfirm: false,
    inputValue: "",
    showCancelButton: true,
  }).then(function(val){
      if(val.value){
         name = val.value;
         downloadString(text, "text/plain", name + ".obj")
       }
  }).catch(function(reason){
        // alert("The alert was dismissed by the user: "+reason);
  });
  
}


function Save(){
  var name = "untitled"
  swal({
    type: "question",
    title: 'Enter file name',
    input: 'text',
    showCancelButton: true,
    closeOnConfirm: false,
    inputValue: "",
    showCancelButton: true,
  }).then(function(val){
      name = val.value;
      downloadString(codemirror.getValue(), "text/plain", name+".kivi")
  }).catch(function(reason){
        // alert("The alert was dismissed by the user: "+reason);
  });
}
function downloadString(text, fileType, fileName) {
  var blob = new Blob([text], { type: fileType });
  var a = document.createElement('a');
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
}

function toTextS(v, fix=3, mult=1, add=0){
  return (v[0].toFixed(fix)*mult+add) + " " + (v[1].toFixed(fix)*mult+add) + " " + (v[2].toFixed(fix)*mult+add) + "\n";
}



Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function keyDownTextField(e) {
var keyCode = e.keyCode;
  if([17, 91, 93].includes(keyCode)) {
    if (timeout) clearTimeout(timeout);
      timeout = setTimeout(rebuild, 0);
    }
}

function Examples(){
  swal({
  title: 'Select Ukraine',
  input: 'select',
  inputOptions: {
    'GRM': 'Motor Grabber With Motor Model',
    'GR': 'Motor Grabber Maximum Short',
    'CSG': 'Simple CSG object'
  },
  inputPlaceholder: 'Select example to load',
  showCancelButton: true
}).then(function(val){
   switch(val.value){
    case "GRM":
      codemirror.setValue(grabberWithMotorExample);
      break;
    case "GR":
      codemirror.setValue(grabberShort);
      break;
    case "CSG":
      codemirror.setValue(simpleCSGobject);
      break;
   }
   rebuild();
  }).catch(function(reason){

  });
}
function Load(){
  swal({
    title: 'Are you sure?\nAll not saved data will be destroyed',
    text: "You won't be able to revert this!",
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then(function(result){
    alert(result.value)
    if (result.value) {
      swal({
        title: 'Select image',
        input: 'file',
        inputAttributes: {
          'accept': '*',
          'aria-label': 'Upload your profile picture'
        }
      }).then(function(val){
        console.log(val)
        var fr = new FileReader();
        fr.readAsText(val.value);
        fr.onload=function(){codemirror.setValue(fr.result)}
      }).catch(function(reason){
    });}
  });
  
}
function setScale(sc){
viewer.gl.translate(0,0,10)
}
rebuild();
rebuild();

document.addEventListener("keydown", keyDownTextField);
var del = 100;


function Cylinder(start=[-1, 0, 0], end=[1, 0, 0], radius){
  return CSG.cylinder({
    radius: radius/100,
    start: [start[0]/100, start[1]/100, start[2]/100],
    end: [end[0]/100, end[1]/100, end[2]/100]
  });
}

function Sphere(center=[10,10,10], radius){
  return CSG.sphere({
    slices: 16,
    stacks: 8,
    center: [center[0]/100, center[1]/100, center[2]/100],
    radius: (radius/100)
  });
}

function Cube(center, radius){
  return CSG.cube({
    center: center,
    radius: (radius/del)
  });
}

function Disk(inner, outer, h, pos){
  var i = Sphere(pos, inner);
  var o = Sphere(pos, outer);
  var plane = Plane(100,100,h, pos);
  return plane.diff(o.cut(i))
}

function Cube(radius){
  return CSG.cube({
    center: [0, 0, 0],
    radius: (radius/del)
  });
}

function Plane(w, h, z, pos=[0, 0, 0]){
  return CSG.plane({
    center: [pos[0]/100, pos[1]/100, pos[2]/100],
    w: w/100,
    h: h/100,
    z: z/100
    // radius: (radius/del)
  });
}



var grabberWithMotorExample = "//Motor Grabber + Motor\n"+"var thickness = 20; //Global variable of thickness detail\nvar appendinx = Plane(25, 20, thickness, [75, 0, 0]) //Appendix to fix the a motor in the the detail\nvar base = Disk(50, 80, thickness, [0,0,0]).add(appendinx) //Rounded part of the detail\nvar quoter = Plane(100, 100, thickness, [100, 0, -100]) //Plane to trim the previous part\nvar long = Plane(200, thickness, thickness, [-70, 0, -65]) //Botton base of the detail\n\nvar drill_size = 4 //Global variable of diameter of a screw\nvar c1 = Cylinder([85, -thickness/2, 90], [85, -thickness/2, -90], drill_size) //First drill cylinder\nvar c2 = Cylinder([85, thickness/2, 90], [85, thickness/2, -90], drill_size) //Second drill cylinder\n\nvar motor = Cylinder([0, -40, 0], [0, 40, 0], 50-6).add(Cylinder([0, 40, -20], [0, 80, -20], 8)).add(Plane(200,200,10,[0, 60, 0]).diff(Sphere([0, 60, -20], 100))) //Simple Motor Model\n\nreturn base.add(quoter).cut(quoter).add(long).cut(c1).cut(c2).add(motor) //Final operations"
var grabberShort = "//Motor Grabber (Maximum Short & Universal)\nvar thickness = 20; //Global variable of thickness detail\nvar appendinx = Plane(25, 20, thickness, [75, 0, 0]) //Appendix to fix the a motor in the the detail\nvar base = Disk(50, 80, thickness, [0,0,0]).add(appendinx) //Rounded part of the detail\nvar quoter = Plane(100, 100, thickness, [100, 0, -100]) //Plane to trim the previous part\nvar long = Plane(200, thickness, thickness, [-70, 0, -65]) //Botton base of the detail\n\nvar drill_size = 4 //Global variable of diameter of a screw\nvar c1 = Cylinder([85, -thickness/2, 30], [85, -thickness/2, -30], drill_size) //First drill cylinder\nvar c2 = Cylinder([85, thickness/2, 30], [85, thickness/2, -30], drill_size) //Second drill cylinder\nreturn base.add(quoter).cut(quoter).add(long).cut(c1).cut(c2) //Final operations"
var simpleCSGobject = "//Simple CSG object\n//You can see more about this figure on this wikipedia page https://goo.gl/5wEGTR\n\nvar base_cube = Cube(100)\n\nvar limit_sphere = Sphere([0,0,0], 135)\n\nvar X = Cylinder([-100, 0, 0], [100, 0, 0], 70)\nvar Y = Cylinder([0, -100, 0], [0, 100, 0], 70)\nvar Z = Cylinder([0, 0, -100], [0, 0, 100], 70)\n\nvar insphere = Sphere([0,0,0], 80);\n\n//Just for a beautiful view ;)\n//Color scheme: RedGreenBlue\nX.color(0, 255, 0) \nY.color(0, 255, 0)\nZ.color(0, 255, 0)\nlimit_sphere.color(0, 0, 255)\nbase_cube.color(255, 0, 0)\ninsphere.color(255, 0, 255)\n\nreturn base_cube.cut(X).cut(Y).cut(Z).diff(limit_sphere).add(insphere)"
window.onbeforeunload = function ()
 {
     return "";
 };