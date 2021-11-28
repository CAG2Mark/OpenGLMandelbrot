#version 330 core
out vec4 FragColor;
in vec4 vertexColor;
in vec3 vertexPos;
in vec2 texCoords;

uniform vec2 offset;
uniform float scale;
uniform float windowRatio;


const int its = 100;
const int measure = 7; // where to measure rate of change

float divergeMag(vec2 c) {
    vec2 z = vec2(0,0);

    float prevMagnitude = 0;
    float diff = 1;
    for (int i = 0; i < its; ++i) {
        z = vec2(z.x*z.x - z.y*z.y, 2*z.x*z.y) + c;
        
        if (i >= measure - 2 && i < measure) {
            float magnitudeCur = z.x*z.x + z.y*z.y;
            if (i == measure - 2) {
                prevMagnitude = magnitudeCur;
            } else {
                diff = abs(magnitudeCur - prevMagnitude);
            }
            
        }
    }
    
    float magnitude = z.x*z.x + z.y*z.y;

    if (magnitude <16) return -1;
    float val = pow(diff, -0.01);
    if (val >= 1) return 1.0f;
    return val;
}

float ratio = 720.0f/1280.0f;
void main()
{
    float scaleX = scale;
    float scaleY = scale * windowRatio;

    float xPos = vertexPos.x * scaleX + offset.x;
    float yPos = vertexPos.y * scaleY + offset.y;

    float d = divergeMag(vec2(xPos, yPos));
    if (d < 0) FragColor = vec4(0.0f,0.0f,0.0f,1.0f);
    else FragColor = vec4(d,d,d,1.0f);
}

