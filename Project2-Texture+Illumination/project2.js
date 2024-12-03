/**
 * @Instructions
 * 		@task1 : Complete the setTexture function to handle non power of 2 sized textures
 * 		@task2 : Implement the lighting by modifying the fragment shader, constructor,
 *      @task3: Implement specular lighting with adjustable intensity
 *      @task4: 
 * 		setMesh, draw, setAmbientLight, setSpecularLight and enableLighting functions 
 */

// Function to compute the Model-View-Projection matrix using your existing functions
function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
    var trans1 = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        translationX, translationY, translationZ, 1
    ];
    var rotatXCos = Math.cos(rotationX);
    var rotatXSin = Math.sin(rotationX);

    var rotatYCos = Math.cos(rotationY);
    var rotatYSin = Math.sin(rotationY);

    var rotatx = [
        1, 0, 0, 0,
        0, rotatXCos, -rotatXSin, 0,
        0, rotatXSin, rotatXCos, 0,
        0, 0, 0, 1
    ]

    var rotaty = [
        rotatYCos, 0, -rotatYSin, 0,
        0, 1, 0, 0,
        rotatYSin, 0, rotatYCos, 0,
        0, 0, 0, 1
    ]

    var test1 = MatrixMult(rotaty, rotatx);
    var test2 = MatrixMult(trans1, test1);
    var mvp = MatrixMult(projectionMatrix, test2);

    return mvp;
}

// Function to multiply two 4x4 matrices
function MatrixMult(a, b) {
    var result = new Array(16);
    for (var i = 0; i < 4; ++i) {
        var ai0 = a[i];
        var ai1 = a[i + 4];
        var ai2 = a[i + 8];
        var ai3 = a[i + 12];
        result[i]      = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
        result[i + 4]  = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
        result[i + 8]  = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
        result[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
    }
    return result;
}

class MeshDrawer {
    constructor() {
        this.prog = InitShaderProgram(meshVS, meshFS);

        // Attribute locations
        this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
        this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');
        this.normalLoc = gl.getAttribLocation(this.prog, 'normal');

        // Uniform locations
        this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
        this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');
        this.enableLightingLoc = gl.getUniformLocation(this.prog, 'enableLighting');
        this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos');
        this.ambientLoc = gl.getUniformLocation(this.prog, 'ambient');
        this.k_sLoc = gl.getUniformLocation(this.prog, 'k_s');   // Specular intensity
        this.shininessLoc = gl.getUniformLocation(this.prog, 'shininess');

        // Buffers
        this.vertbuffer = gl.createBuffer();
        this.texbuffer = gl.createBuffer();
        this.normalBuffer = gl.createBuffer();
        this.numTriangles = 0;

        // Lighting variables
        this.k_s = 0.5;
        this.shininess = 32.0;
    }

    setMesh(vertPos, texCoords, normalCoords) {
        // Vertex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

        // Texture coordinates
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        // Normals
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW);

        this.numTriangles = vertPos.length / 3;
    }

    // This method is called to draw the triangular mesh.
    draw(mvp) {
        gl.useProgram(this.prog);

        gl.uniformMatrix4fv(this.mvpLoc, false, new Float32Array(mvp));

        // Set the light position in world space
        var lightPosition = [lightX, lightY, lightZ];
        gl.uniform3fv(this.lightPosLoc, new Float32Array(lightPosition));

        this.setSpecularLight();

        // Set vertex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
        gl.enableVertexAttribArray(this.vertPosLoc);
        gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);

        // Set texture coordinates
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
        gl.enableVertexAttribArray(this.texCoordLoc);
        gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);

        // Set normals
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.enableVertexAttribArray(this.normalLoc);
        gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);

        // Draw the mesh
        gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
    }

    // This method is called to set the texture of the mesh.
    setTexture(img) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Load texture data into WebGL
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            img
        );

        if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }

        gl.useProgram(this.prog);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const sampler = gl.getUniformLocation(this.prog, 'tex');
        gl.uniform1i(sampler, 0);
    }

    showTexture(show) {
        gl.useProgram(this.prog);
        gl.uniform1i(this.showTexLoc, show ? 1 : 0);
    }

    // Enable lighting for the mesh
    enableLighting(show) {
        gl.useProgram(this.prog);
        gl.uniform1i(this.enableLightingLoc, show ? 1 : 0);
    }

    // Set the ambient light intensity
    setAmbientLight(ambient) {
        gl.useProgram(this.prog);
        gl.uniform1f(this.ambientLoc, ambient);
    }

    // Set the specular light parameters
    setSpecularLight() {
        gl.useProgram(this.prog);

        gl.uniform1f(this.k_sLoc, this.k_s);

        gl.uniform1f(this.shininessLoc, this.shininess);
    }
}

// Function to check if a value is a power of two
function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

const meshVS = `
attribute vec3 pos; 
attribute vec2 texCoord; 
attribute vec3 normal;

uniform mat4 mvp; 

varying vec2 v_texCoord; 
varying vec3 v_normal; 
varying vec3 v_position;  // Position in world space

void main() {
    v_texCoord = texCoord;
    v_normal = normal;
    v_position = pos;  // Position in world space

    gl_Position = mvp * vec4(pos, 1.0);
}
`;

const meshFS = `
precision mediump float;

uniform bool showTex;           // Whether to show the texture
uniform bool enableLighting;    // Whether lighting is enabled
uniform sampler2D tex;          // Texture sampler
uniform vec3 lightPos;          // Position of the light source in world space
uniform float ambient;          // Ambient light intensity
uniform float shininess;        // Shininess exponent for specular highlights
uniform float k_s;              // Specular reflection coefficient

varying vec2 v_texCoord;        // Texture coordinates
varying vec3 v_normal;          // Normal vector at the fragment in world space
varying vec3 v_position;        // Position of the fragment in world space

void main() {
    // Sample the texture color
    vec4 texColor = texture2D(tex, v_texCoord);

    // Ambient lighting
    vec3 ambientColor = ambient * texColor.rgb;

    if (enableLighting) {
        // Normalize normal vector
        vec3 normal = normalize(v_normal);

        // Light direction in world space
        vec3 lightDir = normalize(lightPos - v_position);

        // Diffuse lighting (Lambertian reflection)
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 diffuseColor = diff * texColor.rgb;

        // View direction (assuming camera at origin)
        vec3 viewDir = normalize(-v_position);

        // Specular lighting (Phong reflection model)
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
        vec3 specularColor = k_s * spec * vec3(1.0); // Assuming white specular highlights

        // Combine lighting components
        vec3 finalColor = ambientColor + diffuseColor + specularColor;

        gl_FragColor = vec4(finalColor, texColor.a);
    } else {
        // If lighting is disabled, show the texture only
        gl_FragColor = texColor;
    }
}
`;

// Light position variables
var lightX = 1.0;
var lightY = 1.0;
var lightZ = 1.0;

// Key handling for light movement
const keys = {};
window.addEventListener('keydown', function(e) {
    keys[e.key] = true;
    DrawScene();
});
window.addEventListener('keyup', function(e) {
    keys[e.key] = false;
    DrawScene();
});

function updateLightPos() {
    const translationSpeed = 0.1;
    if (keys['ArrowUp']) lightY += translationSpeed;
    if (keys['ArrowDown']) lightY -= translationSpeed;
    if (keys['ArrowRight']) lightX += translationSpeed;
    if (keys['ArrowLeft']) lightX -= translationSpeed;
    if (keys['w']) lightZ += translationSpeed;
    if (keys['s']) lightZ -= translationSpeed;
}

var meshDrawer;

// Function to handle the Specular Light Intensity slider
function SetSpecularLight(slider) {
    var value = parseFloat(slider.value);
    var specularIntensity = value / 100.0;

    meshDrawer.k_s = specularIntensity;
    meshDrawer.setSpecularLight();
    DrawScene();
}
window.SetSpecularLight = SetSpecularLight;