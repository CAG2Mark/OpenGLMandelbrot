#version 400 core
out vec4 FragColor;
in vec4 vertexColor;
in vec3 vertexPos;
in vec2 texCoords;

uniform vec2 offset;
uniform float scale;
uniform float windowRatio;


const int its = 1000;
const int measure = 10; // where to measure rate of change

float divergeMag(vec2 c) {
    vec2 z = vec2(0,0);

    float prevMagnitude = 0;
    float diff = 1;
    for (int i = 0; i < its; ++i) {
        z = vec2(z.x*z.x - z.y*z.y, 2*z.x*z.y) + c;
        float magnitudeCur = z.x*z.x + z.y*z.y;

        if (magnitudeCur > 6) {
            float val = 0.11+3*float(i)/its;
            if (val > 1) return 1;
            else return val;
        }
        
        if (i >= measure - 2 && i < measure) {
            
            if (i == measure - 2) {
                prevMagnitude = magnitudeCur;
            } else {
                diff = abs(magnitudeCur - prevMagnitude);
            }
        }
    }
    
    float magnitude = z.x*z.x + z.y*z.y;

    if (magnitude < 4) return -1;
    float val = exp(-0.8*diff);
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
    else FragColor = vec4(d*0.8,d*0.7,d,1.0f);
}

