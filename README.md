# OpenGLMandelbrot
Playing around with OpenGL

# Building
## Linux/Mac/Unix-like:
```bash
git clone https://github.com/CAG2Mark/OpenGLMandelbrot --recurse-submodules
cd OpenGLMandelbrot
make all && ./bin/viewer
```
## Windows
If you are *on* Windows, then unfortunately you cannot build this using the provided Makefiles. You can try modifying them to build on Windows - good luck. 
Binaries for Windows have been included in `bin-windows` as I realise many people who want to build for Windows will be on Windows, not a Unix-like system.

If you are building for Windows on a Unix-like system: (you need `mingw-w64` installed):
```bash
git clone https://github.com/CAG2Mark/OpenGLMandelbrot --recurse-submodules
cd OpenGLMandelbrot
make -f Makefile-Win libs
make -f Makefile-Win dirs main
```
You can also run the program using WINE using `cd bin-windows && wine viewer.exe`.

**Note that `make libs` will throw an error because some example files in `spdlog` do not link correctly on `mingw-w64` for some reason. This means it has to be run in a separate command.**


# Custom Shaders
You can modify the existing shader by creating them in `./res/shaders/custom/` then setting this line in `main.cpp` to point to that shader:
```cpp
	Shader sh("res/shaders/shader.vert", "res/shaders/custom/shader.frag");
```

# Credits
Many thanks to LearnOpenGL https://learnopengl.com/ for teaching me most of the things needed to make this and to https://github.com/lekro for the inspiration.
