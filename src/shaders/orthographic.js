// src/shaders/screenSpaceUV.js

export const vertexShader = `

uniform vec3 uCameraPosition;
uniform vec3 uCameraDirection;

varying vec4 vWorldPosition;
varying mat4 vInverseModelMatrix;
varying mat4 vModelMatrix;
varying vec4 vRayOrigin;
varying vec2 vUv;

void main() {
    vWorldPosition = modelMatrix * vec4(position, 1.0);
    vInverseModelMatrix = inverse(modelMatrix);
    vModelMatrix = modelMatrix ;
    vUv = uv;
    vRayOrigin = vec4(uCameraPosition, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const fragmentShader = `

uniform vec3 uCameraPosition;
uniform vec3 uCameraDirection;
uniform mat4 uViewProjectionMatrix;
uniform vec2 uResolution;
uniform float uTime;

varying mat4 vInverseModelMatrix;
varying mat4 vModelMatrix;
varying vec4 vWorldPosition;
varying vec4 vRayOrigin;

#define MAX_STEPS 40
#define MAX_DIST 40.
#define SURF_DIST 1e-3

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float sceneSDF(vec3 p) {
    float sphere1 = sdSphere(p - vec3(sin(uTime) * 0.35, 0.0, 0.0), 0.1);
    float sphere2 = sdSphere(p - vec3(-sin(uTime) * 0.35, 0.0, 0.0), 0.1 );
    return smin(sphere1, sphere2, 0.5);
}

float GetDist(vec3 p) {

	float d = length(p) - .3; 
	d = length(vec2(length(p.xz) - .15, p.y)) - .02;
	return d;
}

float Raymarch(vec3 ro, vec3 rd) {
	float dO = 0.;
	float dS;
	for (int i = 0; i < MAX_STEPS; i++) {
		vec3 p = ro + rd * dO;
		dS = GetDist(p);
		dO += dS;
		if (dS < SURF_DIST || dO > MAX_DIST) break;
	}
	return dO;
}

vec3 GetNormal(in vec3 p) {
	vec2 e = vec2(1., -1.) * 1e-3;
    return normalize(
    	e.xyy * GetDist(p+e.xyy)+
    	e.yxy * GetDist(p+e.yxy)+
    	e.yyx * GetDist(p+e.yyx)+
    	e.xxx * GetDist(p+e.xxx)
    );
}

void main() {

    
    // vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
    vec2 uv = vec2(gl_FragCoord.xy / uResolution.xy);
    uv = uv * 2.0 - 1.0;

    // apply aspect ratio
    uv = uv * vec2(uResolution.x / uResolution.y, 1.0);

    vec3 forward = normalize(uCameraDirection);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = cross(forward, right);

    // // Compute the ray origin based on the orthographic projection
    vec3 ro = uCameraPosition + uv.x * right + uv.y * up;
    ro = (vInverseModelMatrix * vec4(ro, 1.0)).xyz;

    // // The ray direction is constant and in Object Space
    vec3 rd = forward;
    rd = normalize(rd);
    rd = (vInverseModelMatrix * vec4(rd, 1.0)).xyz;

    // // Raymarching
    // float t = 0.0;
    // for(int i = 0; i < 100; i++) {
    //     vec3 p = ro + t * rd;
    //     float d = sceneSDF(p);
    //     if(d < 0.001) break;
    //     t += d;
    //     if(t > 20.0) break;
    // }

    float d = Raymarch(ro, rd);

    // Shading (simple for demonstration)
    // vec3 p = ro + t * rd;
    // vec3 normal = normalize(vec3(
    //     sceneSDF(p + vec3(0.001, 0, 0)) - sceneSDF(p - vec3(0.001, 0, 0)),
    //     sceneSDF(p + vec3(0, 0.001, 0)) - sceneSDF(p - vec3(0, 0.001, 0)),
    //     sceneSDF(p + vec3(0, 0, 0.001)) - sceneSDF(p - vec3(0, 0, 0.001))
    // ));
    // vec3 color = normal * 0.5 + 0.5;

    vec3 color = vec3(0.0); 

    if ( d >= MAX_DIST )
        // discard;
        color = vec3(0.5);
    else {
        vec3 p = ro + rd * d;
        vec3 n = GetNormal(p);
        color.rgb = n;
    }

    gl_FragColor = vec4(color, 1.0);
}
`
