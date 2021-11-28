#ifndef SHADER_H
#define SHADER_H

#include <glad/glad.h> // include glad to get all the required OpenGL headers
#include <string>
#include <fstream>
#include <sstream>

#include <spdlog/spdlog.h>

class Shader {
public:
    // the program ID
    unsigned int ID;

    ~Shader() {
        glDeleteProgram(ID);
    }

    Shader(const char* vertexPath, const char* fragmentPath);
    
    void use();

    void setBool(const char* name, bool value) const;

    void setInt(const char* name, int value) const;
    
    void setFloat(const char* name, float value) const;

    void setVec2Float(const char* name, float val1, float val2) const;
};

#endif