#include <cstdio>
#include <glad/glad.h>
#include <GLFW/glfw3.h>
#include <glm/trigonometric.hpp>
#include <spdlog/spdlog.h>
#include <string>
#include <math.h>

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

#include "stb_image.h"	
#include "shader_s.h"

#pragma region window management

int windowW, windowH;

void set_size(int width, int height) {
	windowW = width;
	windowH = height;
	glViewport(0, 0, windowW, windowH);
}
// listen for resize
void framebuffer_size_callback(GLFWwindow* window, int width, int height)
{
	set_size(width, height);
}

#pragma endregion

#pragma region scale and offset

float scale = 2.0f;
float offsetX = 0;
float offsetY = 0;

#pragma endregion

#pragma region inputs

const float scaleConst = 0.02f;

void process_input(GLFWwindow* window) {
	if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
		glfwSetWindowShouldClose(window, true);

	if (glfwGetKey(window, GLFW_KEY_RIGHT) == GLFW_PRESS)
		offsetX += scaleConst * scale;
	else if (glfwGetKey(window, GLFW_KEY_LEFT) == GLFW_PRESS)
		offsetX -= scaleConst * scale;
	else if (glfwGetKey(window, GLFW_KEY_UP) == GLFW_PRESS)
		offsetY += scaleConst * scale;
	else if (glfwGetKey(window, GLFW_KEY_DOWN) == GLFW_PRESS)
		offsetY -= scaleConst * scale;
	else if (glfwGetKey(window, GLFW_KEY_EQUAL) == GLFW_PRESS)
		scale /= 1.2;
	else if (glfwGetKey(window, GLFW_KEY_MINUS) == GLFW_PRESS)
		scale *= 1.2;
}

#pragma endregion


/**
* Creates a VAO containing vertices and indicies, put into a VBO and EBO respectively.
* 
* @param vertices The vertices to be put into the VBO.
* @param vx_size The size of the vertices array.
* @param indices The indices to be put into the EBO.
* @param in_size The size of the indices array if it is not NULL.
* @param usage The "usage" parameter that will be passed on to glBufferData().
* @return The ID of the created VAO.
*/
unsigned int create_vec3_vao(const float* vertices, 
	unsigned int vx_size, const unsigned int* indices, unsigned int in_size, 
	const char* texture_path = NULL, GLenum usage = GL_STATIC_DRAW) {
	// init VAO
	unsigned int VAO;
	glGenVertexArrays(1, &VAO);
	glBindVertexArray(VAO);
	
	// init VBO
	unsigned int VBO;
	glGenBuffers(1, &VBO);

	// buffer vertex data
	glBindBuffer(GL_ARRAY_BUFFER, VBO);
	glBufferData(GL_ARRAY_BUFFER, vx_size, vertices, usage);

	// buffer indices data (if exists)
	if (indices != NULL) {
		unsigned int EBO;
		glGenBuffers(1, &EBO);
		glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
		glBufferData(GL_ELEMENT_ARRAY_BUFFER, in_size, indices, usage);
	}

	if (texture_path && texture_path != NULL) {
		// textures
		stbi_set_flip_vertically_on_load(true);

		unsigned int texture;
		glGenTextures(1, &texture);
		glBindTexture(GL_TEXTURE_2D, texture);
		// set the texture wrapping/filtering options (on the currently bound texture object)
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		// load and generate the texture
		int width, height, nrChannels;
		unsigned char* data = stbi_load(texture_path, &width, &height, &nrChannels, 0);
		if (data)
		{
			glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, data);
			glGenerateMipmap(GL_TEXTURE_2D);
		}
		else
		{
			spdlog::error("Failed to load texture " + std::string(texture_path));
		}
		stbi_image_free(data);
		// delete data;
	}

	// tell shader how to interpret input data

	// position
	glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)0);
	glEnableVertexAttribArray(0);
	// colour
	glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(3*sizeof(float)));
	glEnableVertexAttribArray(1);
	// texture coords
	glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(6* sizeof(float)));
	glEnableVertexAttribArray(2);

	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glBindVertexArray(0);

	return VAO;
}


int main() {

	printf("Starting.\n");
	
	const int WIN_WIDTH = 1280, WIN_HEIGHT = 720;
	spdlog::info("Creating window with size {}x{}", WIN_WIDTH, WIN_HEIGHT);

	// Init GLFW
	if(!glfwInit()) {
		int code = glfwGetError(NULL);
		spdlog::critical("Could not initialize GLFW! Error: " + std::to_string(code));
		return 0;
	}
	
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

#ifdef __APPLE__
	glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif
	
	// Create window
	// todo: learn how to make cross monitor
	GLFWwindow* window = glfwCreateWindow(WIN_WIDTH, WIN_HEIGHT, "Demo", NULL, NULL);
	if (window == NULL) {
		spdlog::critical("Could not create GFLW window!");
		glfwTerminate();
		return -1;
	}
	glfwMakeContextCurrent(window);

	// Check if GLAD was initialised
	if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
	{
		spdlog::critical("Failed to initialize GLAD!");
		return -1;
	}

	// Set viewport
	set_size(WIN_WIDTH, WIN_HEIGHT);
	spdlog::info("Initial viewport set.");

	// Register resize event
	glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);
	spdlog::info("Frame buffer size callback set.");


	// learning: render traingle

	float vertices[] = {
		// positions          // colors           // texture coords
		1.0f,  1.0f, 0.0f,   1.0f, 0.0f, 0.0f,   1.0f, 1.0f,   // top right
		1.0f, -1.0f, 0.0f,   0.0f, 1.0f, 0.0f,   1.0f, 0.0f,   // bottom right
		-1.0f, -1.0f, 0.0f,   0.0f, 0.0f, 1.0f,   0.0f, 0.0f,   // bottom left
		-1.0f,  1.0f, 0.0f,   1.0f, 1.0f, 0.0f,   0.0f, 1.0f    // top left 
	};
	unsigned int indices[] = {  // note that we start from 0
		0, 1, 3,   // first triangle
		1, 2, 3    // second triangle
	};


	unsigned int VAO = create_vec3_vao(vertices, sizeof(vertices), indices, sizeof(indices));
	spdlog::info("VAO id: " + std::to_string(VAO));

	Shader sh("res/shaders/shader.vert", "res/shaders/shader.frag");

	// Loop
	// render loop, part 4.3 in book
	while (!glfwWindowShouldClose(window))
	{
		// inputs
		process_input(window);

		// rendering commands

		// learning: fill window
		glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
		glClear(GL_COLOR_BUFFER_BIT);


		sh.use();

		// Set window size
		int wHeight, wWidth;
		glfwGetWindowSize(window, &wWidth, &wHeight);
		
		sh.setFloat("windowRatio", (float)wHeight/float(wWidth));
		sh.setFloat("scale", scale);

		sh.setVec2Float("offset", offsetX, offsetY);


		glBindVertexArray(VAO);
		glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
		glBindVertexArray(0);

		// check and call events and swap the buffers
		glfwSwapBuffers(window);
		glfwPollEvents();
	}

	glDeleteVertexArrays(1, &VAO);
	sh.~Shader();

	spdlog::info("Terminating.");
	glfwTerminate();
	return 0;
}
