#version 400 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aColor;
layout (location = 2) in vec2 aTex;

out vec4 vertexColor;
out vec3 vertexPos;
out vec2 texCoords;

uniform vec3 offset; // translation matrix
uniform mat4 transform; // linear transform matrix

void main()
{
    // first transform then         
    // no way to fit this into a single linear transformation
    gl_Position = vec4(aPos, 1.0f);
    vertexPos = vec3(aPos.x, aPos.y, aPos.z);
    vertexColor = vec4(aColor, 1.0f);
     
    // vertexColor = vec4(0.5*vertexPos.x + 0.5, 0.5*vertexPos.y + 0.5, 0.5*vertexPos.z + 0.5, 1.0f);
    // texCoords = aTex;
}