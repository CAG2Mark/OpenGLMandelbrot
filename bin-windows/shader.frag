#version 400 core
out vec4 FragColor;
in vec4 vertexColor;
in vec3 vertexPos;
in vec2 texCoords;

uniform vec2 offset;
uniform float scale;
uniform float windowRatio;
uniform float colorOffset;
uniform int its;

vec2 c_one() { return vec2(1., 0.); }
vec2 c_i() { return vec2(0., 1.); }

float arg(vec2 c) {
  return atan(c.y, c.x);
}

vec2 c_conj(vec2 c) {
  return vec2(c.x, -c.y);
}

vec2 c_from_polar(float r, float theta) {
  return vec2(r * cos(theta), r * sin(theta));
}

vec2 c_to_polar(vec2 c) {
  return vec2(length(c), atan(c.y, c.x));
}

/// Computes `e^(c)`, where `e` is the base of the natural logarithm.
vec2 c_exp(vec2 c) {
  return c_from_polar(exp(c.x), c.y);
}


/// Raises a floating point number to the complex power `c`.
vec2 c_exp(float base, vec2 c) {
  return c_from_polar(pow(base, c.x), c.y * log(base));
}

/// Computes the principal value of natural logarithm of `c`.
vec2 c_ln(vec2 c) {
  vec2 polar = c_to_polar(c);
  return vec2(log(polar.x), polar.y);
}

/// Returns the logarithm of `c` with respect to an arbitrary base.
vec2 c_log(vec2 c, float base) {
  vec2 polar = c_to_polar(c);
  return vec2(log(polar.r), polar.y) / log(base);
}

vec2 c_sqrt(vec2 c) {
  vec2 p = c_to_polar(c);
  return c_from_polar(sqrt(p.x), p.y/2.);
}

/// Raises `c` to a floating point power `e`.
vec2 c_pow(vec2 c, float e) {
  vec2 p = c_to_polar(c);
  return c_from_polar(pow(p.x, e), p.y*e);
}

/// Raises `c` to a complex power `e`.
vec2 c_pow(vec2 c, vec2 e) {
  vec2 polar = c_to_polar(c);
  return c_from_polar(
     pow(polar.x, e.x) * exp(-e.y * polar.y),
     e.x * polar.y + e.y * log(polar.x)
  );
}

vec2 c_mul(vec2 self, vec2 other) {
    return vec2(self.x * other.x - self.y * other.y, 
                self.x * other.y + self.y * other.x);
}

vec2 c_div(vec2 self, vec2 other) {
    float norm = length(other);
    return vec2(self.x * other.x + self.y * other.y,
                self.y * other.x - self.x * other.y)/(norm * norm);
}

vec2 c_sin(vec2 c) {
  return vec2(sin(c.x) * cosh(c.y), cos(c.x) * sinh(c.y));
}

vec2 c_cos(vec2 c) {
  // formula: cos(a + bi) = cos(a)cosh(b) - i*sin(a)sinh(b)
  return vec2(cos(c.x) * cosh(c.y), -sin(c.x) * sinh(c.y));
}

vec2 c_tan(vec2 c) {
  vec2 c2 = 2. * c;
  return vec2(sin(c2.x), sinh(c2.y))/(cos(c2.x) + cosh(c2.y));
}

vec2 c_atan(vec2 c) {
  // formula: arctan(z) = (ln(1+iz) - ln(1-iz))/(2i)
  vec2 i = c_i();
  vec2 one = c_one();
  vec2 two = one + one;
  if (c == i) {
    return vec2(0., 1./1e-10);
  } else if (c == -i) {
    return vec2(0., -1./1e-10);
  }

  return c_div(
    c_ln(one + c_mul(i, c)) - c_ln(one - c_mul(i, c)),
    c_mul(two, i)
  );
}

vec2 c_asin(vec2 c) {
 // formula: arcsin(z) = -i ln(sqrt(1-z^2) + iz)
  vec2 i = c_i(); vec2 one = c_one();
  return c_mul(-i, c_ln(
    c_sqrt(c_one() - c_mul(c, c)) + c_mul(i, c)
  ));
}

vec2 c_acos(vec2 c) {
  // formula: arccos(z) = -i ln(i sqrt(1-z^2) + z)
  vec2 i = c_i();

  return c_mul(-i, c_ln(
    c_mul(i, c_sqrt(c_one() - c_mul(c, c))) + c
  ));
}

vec2 c_sinh(vec2 c) {
  return vec2(sinh(c.x) * cos(c.y), cosh(c.x) * sin(c.y));
}

vec2 c_cosh(vec2 c) {
  return vec2(cosh(c.x) * cos(c.y), sinh(c.x) * sin(c.y));
}

vec2 c_tanh(vec2 c) {
  vec2 c2 = 2. * c;
  return vec2(sinh(c2.x), sin(c2.y))/(cosh(c2.x) + cos(c2.y));
}

vec2 c_asinh(vec2 c) {
  // formula: arcsinh(z) = ln(z + sqrt(1+z^2))
  vec2 one = c_one();
  return c_ln(c + c_sqrt(one + c_mul(c, c)));
}

vec2 c_acosh(vec2 c) {
  // formula: arccosh(z) = 2 ln(sqrt((z+1)/2) + sqrt((z-1)/2))
  vec2 one = c_one();
  vec2 two = one + one;
  return c_mul(two,
      c_ln(
        c_sqrt(c_div((c + one), two)) + c_sqrt(c_div((c - one), two))
      ));
}

vec2 c_atanh(vec2 c) {
  // formula: arctanh(z) = (ln(1+z) - ln(1-z))/2
  vec2 one = c_one();
  vec2 two = one + one;
  if (c == one) {
      return vec2(1./1e-10, vec2(0.));
  } else if (c == -one) {
      return vec2(-1./1e-10, vec2(0.));
  }
  return c_div(c_ln(one + c) - c_ln(one - c), two);
}

// Attempts to identify the gaussian integer whose product with `modulus`
// is closest to `c`
vec2 c_rem(vec2 c, vec2 modulus) {
  vec2 c0 = c_div(c, modulus);
  // This is the gaussian integer corresponding to the true ratio
  // rounded towards zero.
  vec2 c1 = vec2(c0.x - mod(c0.x, 1.), c0.y - mod(c0.y, 1.));
  return c - c_mul(modulus, c1);
}

vec2 c_inv(vec2 c) {
  float norm = length(c);
	return vec2(c.x, -c.y) / (norm * norm);
}



const int measure = 10; // where to measure rate of change

// complex 
#define product(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)

float divergeMag(vec2 c) {
    vec2 z = vec2(0,0);

    float prevMagnitude = 0;
    float diff = 1;
    for (int i = 0; i < its; ++i) {
        // z^2 + c:
        // z = vec2(z.x*z.x - z.y*z.y, 2*z.x*z.y) + c;

        // z^(a lot) + c:
        // z = product(product(product(product(z,z),product(z,z)),product(product(z,z),product(z,z))),product(product(product(z,z),product(z,z)),product(product(z,z),product(z,z))))+c;

        // e^z + c:
        //z = vec2(exp(z.x) * cos(z.y), exp(z.x) * sin(z.y)) + c;

        // sin(z) + c:
        // z = c_sin(z)*c_sin(z) + c;
        
        // :D
        z = c_pow(c_pow(z,2)+c, 1 - colorOffset/10) + c;

        float magnitudeCur = z.x*z.x + z.y*z.y;

        if (magnitudeCur > 100) {
            float val = 0.11+3*float(i)/its;
            if (val > 1) return -1.0f;
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

    if (magnitude < 4) return -1.0f;
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
    else {
        //FragColor = vec4(1.0f,1.0f,1.0f,1.0f);
        FragColor = vec4(d*0.8,d*0.7,d,1.0f);
    }
}

