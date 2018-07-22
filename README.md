# Basic Objects
* Draw a Cube with an optional parameter POSITION *default is [0, 0, 0]* and the required parameter RADIUS

  ```javascript
  Cube([position, radius)
  ```
  Example:
  
    ```javascript
    var cube = Cube([23, 12, 65], 100)
    ```
<br></br>
* Draw a Sphere with an optional parameter POSITION *default is [0, 0, 0]* and the required parameter RADIUS

  ```javascript
  Sphere([position, radius)
  ```
  Example:
  
  ```javascript
  var sphere = Sphere([24, 12, 34], 100)
  ```

<br></br>
* Draw a Cylinder with an required parameters START_POSITION, END_POSITION, RADIUS

  ```javascript
  Cylinder(from, to, radius)
  ```
  Example:
  
    ```javascript
    var cylinder = Cylinder([56, 23, 12], [100, 100, 100], 100)
    ```
    
 <br></br>
* Draw a Plane with an optional parametr POSITION and the required parameters WIDTH, HEIGT, DEPTH

  ```javascript
  Plane([pos, width, height, depth)
  ```
   Example:
  
    ```javascript
    var plane = Plane([10, 13, 15], 100, 200, 50)
    ```
<br></br>
# Basic opeartions
  So, you have a two figures: *cube* A and *sphere* B.
  
  You can do following operations with any two figures:
  <br></br>
  *All this operations have the same constructor:* ```a.<operation name>(b)```
  
* Concat
Example:
  ```javascript
  var result = a.add(b)
  ```
