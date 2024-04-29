"use strict";

var canvas;     // html element defines area we draw to (like a virtual screen)
var gl;         // provides access to WebGl
var program;    // active shader program

//// Cube Data (for tetsing purpose)
//As long as the cube is rotating we are fine
var numVertices  = 36;
var axis = 0;
var xAxis = 0;
var yAxis =1;
var zAxis = 2;
var theta = [ 0, 0, 0 ];
var thetaLoc;

    var vertices = [
        vec3( -0.25, -0.25,  0.25 ),
        vec3( -0.25,  0.25,  0.25 ),
        vec3(  0.25,  0.25,  0.25 ),
        vec3(  0.25, -0.25,  0.25 ),
        vec3( -0.25, -0.25, -0.25 ),
        vec3( -0.25,  0.25, -0.25 ),
        vec3(  0.25,  0.25, -0.25 ),
        vec3(  0.25, -0.25, -0.25 )
    ];

    var vertexColors = [
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
        vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
        vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
        vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
    ];

// indices of the 12 triangles that compise the cube

var indices = [
    1, 0, 3,
    3, 2, 1,
    2, 3, 7,
    7, 6, 2,
    3, 0, 4,
    4, 7, 3,
    6, 5, 1,
    1, 2, 6,
    4, 5, 6,
    6, 7, 4,
    5, 4, 0,
    0, 1, 5
];
//---------------------------------------------
// Lighting and Viewing from Homework 4
//---------------------------------------------
// Light Data
var lightPosition = vec4(0.0, 1.5, 1.8, 0.0); // x,y,z,w w doesn't matter
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);  //red green blue alpha soft light
var lightDiffuse = vec4(2.5, 2.5, 2.5, 1.0);  // color reflect back from the object
var lightSpecular = vec4(5.5, 5.5, 5.5, 1.0); // highlight

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(0.8, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0; //how matllic

//var ctm;
var ambientColor, diffuseColor, specularColor;
var modelViewMatrix;
var modelViewMatrixLoc;

// Camera Data
var zoomFactor = 3.0;           // speed of zoom
var translateFactorX = -0.75;   // speed of left-right shift
var translateFactorY = -0.25;
var phi = 30;                   // camera rotating angles
var theta = 20;
var Radius = 1.5;               // radius of the camera

var left = -1;                  //  projection variables
var right = 1;
var ytop = 1;
var bottom = -1;
var near = -10;
var far = 10;
var deg = 5;
var eye = [1, 1, 1];
var at = [0, 0, 0];
var up = [0, 1, 0];

var fov = 45; //field of veiw
var projectionMatrix;
var projectionMatrixLoc;

var thetaLoc;

//---------------------------------------------
//  Importing Model (sets up everything)
//---------------------------------------------
// skull data (object 2) 
var skullPosition = [];
var skullTexCoords = [];
var skullNormals = [];
var skullIndex =[];
var skullColor = vec4(0.269725, 0.269725, 0.269725, 1.0) // light grey
//face data (object 3)
var facePosition =[];
var faceTexCoords =[];
var faceNormals =[];
var faceIndex =[];
var faceColor = vec4(0,0,0,1); //black
//head data (object 4)
var headPosition =[];
var headTexCoords =[];
var headNormals =[];
var headIndex =[];
var headColor = vec4(0.058105, 0.058105, 0.058105, 1.0);// grey
//tail data (object 5)
var tailPosition =[];
var tailTexCoords =[];
var tailNormals =[];
var tailIndex =[];
var tailColor = vec4(0.058105, 0.058105, 0.058105, 1.0);// grey
//body data (object 6)
var bodyPosition =[];
var bodyTexCoords =[];
var bodyNormals =[];
var bodyIndex =[];
var bodyColor = vec4(1,1,1,1);// white
//collar data (object 7)
var collarPosition =[];
var collarTexCoords =[];
var collarNormals =[];
var collarIndex =[];
var collarColor = vec4(0.887923, 0.401978, 0.53948, 1.0); //pink

fetch('kuromi.json')
    .then(response => response.json())
    .then(content => {
        // Loading skull data (object 2)
        let posArr = content.geometries[0].data.attributes.position.array;
        let tcArr = content.geometries[0].data.attributes.uv.array;
        let normArr = content.geometries[0].data.attributes.normal.array;
        let indexArr = content.geometries[0].data.index.array;
        for (let i = 0; i < posArr.length; i += 3) {
            skullPosition.push(vec3(posArr[i], posArr[i + 1], posArr[i + 2]));
            skullNormals.push(vec3(normArr[i], normArr[i + 1], normArr[i + 2]));
            skullIndex.push(vec3(indexArr[i], indexArr[i+1], indexArr[i+2]));
        }
        for (let i = 0; i < tcArr.length; i += 2) {
            skullTexCoords.push(vec2(tcArr[i], tcArr[i + 1]));
        }

        // Loading face data (object 3)
        facePosition = new Float32Array (content.geometries[1].data.attributes.position.array);
        faceTexCoords = new Float32Array(content.geometries[1].data.attributes.uv.array);
        faceNormals = new Float32Array(content.geometries[1].data.attributes.normal.array);
        faceIndex = new Uint32Array(content.geometries[1].data.index.array);

        // Loading head data (object 4)
        headPosition = new Float32Array (content.geometries[2].data.attributes.position.array);
        headTexCoords = new Float32Array(content.geometries[2].data.attributes.uv.array);
        headNormals = new Float32Array(content.geometries[2].data.attributes.normal.array);
        headIndex = new Uint32Array(content.geometries[2].data.index.array);

        // Loading tail data (object 5)
        tailPosition = new Float32Array (content.geometries[3].data.attributes.position.array);
        tailTexCoords = new Float32Array(content.geometries[3].data.attributes.uv.array);
        tailNormals = new Float32Array(content.geometries[3].data.attributes.normal.array);
        tailIndex = new Uint32Array(content.geometries[3].data.index.array);
        
        // Loading body data (object 6)
        bodyPosition = new Float32Array (content.geometries[4].data.attributes.position.array);
        bodyTexCoords = new Float32Array(content.geometries[4].data.attributes.uv.array);
        bodyNormals = new Float32Array(content.geometries[4].data.attributes.normal.array);
        bodyIndex = new Uint32Array(content.geometries[4].data.index.array);
        // Loading collar data (object 7)
        collarPosition = new Float32Array (content.geometries[5].data.attributes.position.array);
        collarTexCoords = new Float32Array(content.geometries[5].data.attributes.uv.array);
        collarNormals = new Float32Array(content.geometries[5].data.attributes.normal.array);
        collarIndex = new Uint32Array(content.geometries[5].data.index.array);
        // initialize webgl and render
        initGL();
        render();
    })
    .catch(error => console.error('Error:', error));

// Create my Kuromi model.
// I should have buffers for position, color, index, normal, 
//and texcoords for each object.
// In total, there are 6 objects, 
//each of which should have 30 buffers.
// If it's not working, I will cry myself to sleep ;-)

function createKuromi(program)
{
var vPositionLoc;
var vColorLoc;
var vIndexLoc;
var vNormalsLoc;
var vTexCoordsLoc;

//Object 1 Skull
//Position
var skullPositionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, skullPositionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, flatten(skullPosition), gl.STATIC_DRAW);
vPositionLoc = gl.getAttribLocation(program, "vPosition");
gl.vertexAttribPointer(vPositionLoc,3,gl.FLOAT,false,0,0);
gl.enableVertexAttribArray(vPositionLoc);
//Color
var skullColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, skullColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, flatten(skullColor), gl.STATIC_DRAW);
vColorLoc = gl.getAttribLocation(program, "vColor");
gl.vertexAttribPointer(vPositionLoc,3,gl.FLOAT,false,0,0);
gl.enableVertexAttribArray(vColorLoc);
//Index
var skullIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, skullIndexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, flatten(skullIndex), gl.STATIC_DRAW);
vIndexLoc = gl.getAttribLocation(program, "vIndex");
gl.vertexAttribPointer(vIndexLoc,3,gl.FLOAT,false,0,0);
gl.enableVertexAttribArray(vIndexLoc);
//Normals
var skullNormalsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, skullNormalsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, flatten(skullNormals), gl.STATIC_DRAW);
vNormalsLoc = gl.getAttribLocation(program, "vNormals");
gl.vertexAttribPointer(vNormalsLoc,3,gl.FLOAT,false,0,0);
gl.enableVertexAttribArray(vNormalsLoc);
//TexCoords (uv)
var skullTexCoordsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, skullTexCoordsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, flatten(skullTexCoords), gl.STATIC_DRAW);
vTexCoordsLoc = gl.getAttribLocation(program, "vTexCoords");
gl.vertexAttribPointer(vTexCoordsLoc,2,gl.FLOAT,false,0,0);
gl.enableVertexAttribArray(vTexCoordsLoc);

//this one is 2 rather than 3 because just u and v

}



//---------------------------------------------
//  Init (sets up everything)
//---------------------------------------------

//window.onload = function init()
function initGL()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );// sets this shader as active


    // array element buffer

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    // color array atrribute buffer

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    // vertex array attribute buffer

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta");

    //event listeners for buttons

    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };

//---------------------------------------------
//  This part from Homework 4
//--------------------------------------------- 
// Link and send uniforms (global shader data)
var ambient = mult(lightAmbient, materialAmbient);
var diffuse = mult(lightDiffuse, materialDiffuse);
var specular = mult(lightSpecular, materialSpecular);
gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambient));
gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuse));
gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specular));
gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

// support user interface (button functionality)
document.getElementById("phiPlus").onclick = function () { phi += deg; };
document.getElementById("phiMinus").onclick = function () { phi -= deg; };
document.getElementById("thetaPlus").onclick = function () { theta += deg; };
document.getElementById("thetaMinus").onclick = function () { theta -= deg; };
//document.getElementById("zoomIn").onclick = function () { zoomFactor *= 0.95; };
//document.getElementById("zoomOut").onclick = function () { zoomFactor *= 1.05; };
// document.getElementById("left").onclick = function () { translateFactorX -= 0.1; };
// document.getElementById("right").onclick = function () { translateFactorX += 0.1; };
// document.getElementById("up").onclick = function () { translateFactorY += 0.1; };
// document.getElementById("down").onclick = function () { translateFactorY -= 0.1; };

    //render();
}
//---------------------------------------------
//  Render (lets draw everything)
//---------------------------------------------
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);
    gl.drawElements( gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0 );
    projectionMatrix = perspective(fov,(canvas.width/canvas.height),0.1,1000)
//---------------------------------------------
//  This part from Homework 4
//--------------------------------------------- 
    eye = vec3(
        Radius * Math.cos(theta * Math.PI / 180.0) * Math.cos(phi * Math.PI / 180.0),
        Radius * Math.sin(theta * Math.PI / 180.0),
        Radius * Math.cos(theta * Math.PI / 180.0) * Math.sin(phi * Math.PI / 180.0)
    );

    // Update our matrices...which updates the "camera view" every frame
    modelViewMatrix = lookAt(eye, at, up);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // adjust our object (scale, rotate, translate)
    var t = translate(0.25,0,0.25);
    var s = scale4(0.5, 0.25, 0.25); // x,y,z

    modelViewMatrix = mult(mult(modelViewMatrix, t),s);     // multiply together to form model view
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
//---------------------------------------------------------------
    requestAnimFrame( render );
}
