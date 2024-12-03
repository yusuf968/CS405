The MeshDrawer class makes sure that the functionality required to render 3D meshes using WebGL. It handles vertex positions, texture coordinates, normals, textures, and advanced lighting effects. The project includes implementations for handling non-power-of-two textures and introduces adjustable specular lighting.

Features

Task 1: Handle Non-Power-of-Two Textures

Implementation:

In the setTexture method, the code now checks if the texture dimensions are not powers of two.
For non-power-of-two textures, texture wrapping modes are set to gl.CLAMP_TO_EDGE for both the S and T directions.
Texture filtering modes are set to gl.LINEAR for both minification and magnification filters.
This ensures that non-power-of-two textures are correctly displayed without the need for generating mipmaps.

Task 2: Implement Lighting

Implementation:

Vertex Shader (meshVS):
Added a varying variable v_position to pass the vertex position to the fragment shader.
Fragment Shader (meshFS):
Introduced uniforms for lighting parameters: enableLighting, ambient, and lightPos.
Calculations for ambient and diffuse lighting are performed using the Lambertian reflection model.
Normal vectors are normalized, and light direction is computed for accurate lighting effects.
MeshDrawer Class:
Constructor initializes uniform and attribute locations for lighting parameters.
setMesh method now buffers normal vectors.
draw method passes lighting uniforms to the shader and updates the light position.
Implemented enableLighting and setAmbientLight methods to control lighting features.

Task 3: Specular Lighting with Adjustable Intensity
Objective: Implement specular lighting using the Phong reflection model and allow the specular intensity to be adjusted dynamically.

Implementation:

Fragment Shader (meshFS):
Added uniforms shininess and k_s for controlling specular highlights.
Calculations for specular lighting are performed using the Phong reflection model.
Combined ambient, diffuse, and specular components to produce the final color.
MeshDrawer Class:
Added properties k_s (specular reflection coefficient) and shininess.
Implemented setSpecularLight method to pass specular parameters to the shader.
User Interface:
Added a function SetSpecularLight that adjusts the specular intensity based on user input (e.g., a slider control).
Users can dynamically adjust the specular intensity during runtime.

Changes have only been made to the project2.js file, the remaining files have not been edited.
