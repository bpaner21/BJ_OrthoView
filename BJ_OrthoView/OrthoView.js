﻿// OrthoView.js

// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
	'uniform mat4 u_ProjMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_Position = u_ProjMatrix * a_Position;\n' +
    '   v_Color = a_Color;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_FragColor = v_Color;\n' +
    '}\n';

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');
	// Retrieve nearFar element
    var nf = document.getElementById('nearFar');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL.');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(0, 0, 0, 1);

    // Get the storage location of the u_ViewMatrix
    var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    if (!u_ProjMatrix) {
        console.log('Failed to get the storage locations of u_ProjMatrix');
        return;
    }

    // Set the matrix to be used for to set the camera view
    var projMatrix = new Matrix4();

    // Register the event handler to be called on key press
	document.onkeydown = function(ev){ keydown(ev, gl, n, u_ProjMatrix, projMatrix, nf); };

    // Draw the triangles
    draw(gl, n, u_ProjMatrix, projMatrix, nf);
}

function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([
        // Vertex coordinates and color
        0.0, 0.6, -0.4, 0.4, 1.0, 0.4,
        -0.5, -0.4, -0.4, 0.4, 1.0, 0.4,
        0.5, -0.4, -0.4, 1.0, 0.4, 0.4,

        0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
        -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
        0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

        0.0, 0.5, 0.0, 0.4, 0.4, 1.0,
        -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
        0.5, -0.5, 0.0, 1.0, 0.4, 0.4,
    ]);
    var n = 9;

    // Create a buffer object
    var vertexColorBuffer = gl.createBuffer();
    if (!vertexColorBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to the target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    // Get the storage location of a_Position, assign, and enable buffer
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    // Get the storage location of a_Color, assign, and enable buffer
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }

    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    //gl.bindBuffer(gl.ARRAY_BUFFER, null);   // What does this do?

    return n;
}

var g_near = 0.0, g_far = 0.5;
function keydown(ev, gl, n, u_ProjMatrix, projMatrix, nf) {
    switch (ev.keyCode) {
        case 39: {			// Right Arrow Key
            g_near += 0.01;
            break;
        }
        case 37: {			// Left Arrow Key
            g_near -= 0.01;
            break;
        }
        case 38: {			// Up Arrow Key
            g_far += 0.01;
            break;
        }
        case 40: {			// Down Arrow Key
            g_far -= 0.01;
            break;
        }
        default: {
            return;
        }
    }
	
	draw(gl, n, u_ProjMatrix, projMatrix, nf);
}

function draw(gl, n, u_ProjMatrix, projMatrix, nf) {
	// Specify the viewing volume
	projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, g_near, g_far);
	
	// Pass the projection matrix to u_ProjMatrix
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
	
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// Display the current near and far values
	nf.innerHTML = 'near: ' + Math.round(g_near * 100)/100 + ', far: ' + Math.round(g_far*100)/100;
	
	// Draw the triangles
	gl.drawArrays(gl.TRIANGLES, 0, n);
}