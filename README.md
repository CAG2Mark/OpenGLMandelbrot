# OpenGLMandelbrot
Playing around with OpenGL

# Building
```bash
git clone https://github.com/CAG2Mark/OpenGLMandelbrot --recurse-submodules
cd OpenGLMandelbrot
make all && ./bin/viewer
```

# Custom Shaders
You can modify the existing shader by creating them in `./res/shaders/custom/` then setting this line in `main.cpp` to point to that shader:
```cpp
	Shader sh("res/shaders/shader.vert", "res/shaders/custom/shader.frag");
```

# Credits
Many thanks to LearnOpenGL https://learnopengl.com/ for teaching me most of the things needed to make this and to https://github.com/lekro for the inspiration.
