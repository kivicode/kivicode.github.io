// Set the color of all polygons in this solid
CSG.prototype.color = function(r, g, b) {
  this.toPolygons().map(function(polygon) {
    polygon.shared = [r/255, g/255, b/255];
  });
};

// Convert from CSG solid to GL.Mesh object
CSG.prototype.toMesh = function() {
  var mesh = new GL.Mesh({ normals: true, colors: true });
  var indexer = new GL.Indexer();
  this.toPolygons().map(function(polygon) {
    var indices = polygon.vertices.map(function(vertex) {
      vertex.color = polygon.shared || [1, 1, 1];
      return indexer.add(vertex);
    });
    for (var i = 2; i < indices.length; i++) {
      mesh.triangles.push([indices[0], indices[i - 1], indices[i]]);
    }
  });
  mesh.vertices = indexer.unique.map(function(v) { return [v.pos.x, v.pos.y, v.pos.z]; });
  mesh.normals = indexer.unique.map(function(v) { return [v.normal.x, v.normal.y, v.normal.z]; });
  mesh.colors = indexer.unique.map(function(v) { return v.color; });
  mesh.computeWireframe();
  return mesh;
};

var angleX = 20;
var angleY = 20;
var viewers = [];

// Set to true so lines don't use the depth buffer
Viewer.lineOverlay = false;

// A viewer is a WebGL canvas that lets the user view a mesh. The user can
// tumble it around by dragging the mouse.
function Viewer(csg, width, height, depth) {
  viewers.push(this);

  // Get a new WebGL canvas
  var gl = GL.create();
  // gl.canvas
  this.gl = gl;
  this.mesh = csg.toMesh();
  // this.depth = depth;
  this.setDepth = function(newDist){
    depth = newDist;
  }

  // Set up the viewport
  gl.canvas.width = width;
  gl.canvas.height = height;
  gl.viewport(0, 0, width, height);
  gl.matrixMode(gl.PROJECTION);
  gl.loadIdentity();
  gl.perspective(45, width / height, 0.1, 11);
  gl.matrixMode(gl.MODELVIEW);

  // Set up WebGL state
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(40/255, 41/255, 54/255, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.polygonOffset(0, 0);

  // gl.canvas.addEventListener("wheel", alert(""));

  // Black shader for wireframe
  this.blackShader = new GL.Shader('\
    void main() {\
      gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;\
    }\
  ', '\
    void main() {\
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);\
    }\
  ');

  // Shader with diffuse and specular lighting
  this.lightingShader = new GL.Shader('\
    varying vec3 color;\
    varying vec3 normal;\
    varying vec3 light;\
    void main() {\
      const vec3 lightDir = vec3(1.0, 2.0, 3.0) / 3.741657386773941;\
      light = (gl_ModelViewMatrix * vec4(lightDir, 0.0)).xyz;\
      color = gl_Color.rgb;\
      normal = gl_NormalMatrix * gl_Normal;\
      gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;\
    }\
  ', '\
    varying vec3 color;\
    varying vec3 normal;\
    varying vec3 light;\
    void main() {\
      vec3 n = normalize(normal);\
      float diffuse = max(0.0, dot(light, n));\
      float specular = pow(max(0.0, -reflect(light, n).z), 32.0) * sqrt(diffuse);\
      gl_FragColor = vec4(mix(color * (0.3 + 0.7 * diffuse), vec3(1.0), specular), 1.0);\
    }\
  ');

  gl.onmousemove = function(e) {
    if (e.dragging) {
      angleY += e.deltaX * 2;
      angleX += e.deltaY * 2;
      angleX = Math.max(-90, Math.min(90, angleX));
      viewers.map(function(viewer) {
        viewer.gl.ondraw();
      });
    }
  };

  gl.onwheel = function(e) {
    e = e || window.event;

  // wheelDelta не дает возможность узнать количество пикселей
    var delta = e.deltaY || e.detail || e.wheelDelta;


    depth = +depth + (delta/100);
    // alert(depth)
    viewers.map(function(viewer) {
        viewer.gl.ondraw();
      });
    // if (e.dragging) {
    //   angleY += e.deltaX * 2;
    //   angleX += e.deltaY * 2;
    //   angleX = Math.max(-90, Math.min(90, angleX));
    //   depth = 0
    //   viewers.map(function(viewer) {
    //     viewer.gl.ondraw();
    //   });
    // }
  };



  // gl.translate = function(tr){
  //   gl.translate(0, 0, -5);
  // }


  var that = this;
  gl.ondraw = function(e) {
    gl.makeCurrent();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.loadIdentity();
    gl.translate(0, 0, -depth);
    gl.rotate(angleX, 1, 0, 0);
    gl.rotate(angleY, 0, 1, 0);
    gl.scissor(0, 10, 60, 60);
    // gl.scale(scale, depth, deth)
    // gl.uniform2fv([0,0], scale);

    if (!Viewer.lineOverlay) gl.enable(gl.POLYGON_OFFSET_FILL);
    that.lightingShader.draw(that.mesh, gl.TRIANGLES);
    if (!Viewer.lineOverlay) gl.disable(gl.POLYGON_OFFSET_FILL);

    if (Viewer.lineOverlay) gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    that.blackShader.draw(that.mesh, gl.LINES);
    gl.disable(gl.BLEND);
    if (Viewer.lineOverlay) gl.enable(gl.DEPTH_TEST);
  };

  gl.ondraw();
}

var nextID = 0;
function addViewer(viewer) {
  document.getElementById(nextID++).appendChild(viewer.gl.canvas);
}

function removeViewer(viewer) {
  document.getElementById(nextID).removeChild(viewer.gl.canvas);
  nextID--;
}
