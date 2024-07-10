// src/shaders/screenSpaceUV.js

export const vertexShader = `

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const fragmentShader = `

uniform vec3 uCameraPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec2 uResolution;
uniform float uTime;

varying vec2 vUv;

mat3 rotateY(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(
        c, 0, -s,
        0, 1, 0,
        s, 0, c
    );
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdf(vec3 p) {
    p = rotateY(uTime) * p; // Rotate the space around Y-axis
    return sdBox(p, vec3(0.1)); // Cube with side length 2
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
		vec3 forward = - vec3(0.0, 0.0, 1.0);
		vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
		vec3 up = cross(forward, right);

		// // Compute the ray origin based on the orthographic projection
		vec3 ro = vec3(0.0, 0.0, 5.0) + uv.x * right + uv.y * up;
		// // The ray direction is constant and points towards the target
		vec3 rd = forward;
    
    float t = 0.0;
    for(int i = 0; i < 100; i++) {
        vec3 p = ro + rd * t;
        float d = sdf(p);
        if(d < 0.001) break; // Hit
        t += d;
        if(t > 100.0) break; // Miss
    }
    
    vec3 color = (t < 100.0) ? vec3(1.0) : vec3(0.0);
    gl_FragColor = vec4(color, 1.0);
}
`