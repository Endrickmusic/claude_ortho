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

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float sceneSDF(vec3 p) {
    float sphere1 = sdSphere(p - vec3(sin(uTime) * 0.5, 0.0, 0.0), 0.5);
    float sphere2 = sdSphere(p - vec3(-sin(uTime) * 0.5, 0.0, 0.0), 0.5);
    return smin(sphere1, sphere2, 0.5);
}

void main() {
    // Calculate NDC coordinates
    vec2 ndc = vUv * 2.0 - 1.0;
    
    // Calculate ray origin in view space
    vec3 rayOrigin = (inverse(uProjectionMatrix) * vec4(ndc, -1.0, 1.0)).xyz;
    
    // Transform ray origin to world space
    rayOrigin = (inverse(uModelViewMatrix) * vec4(rayOrigin, 1.0)).xyz;
    
    // Ray direction in world space (for orthographic, this is constant)
    vec3 rayDirection = normalize((inverse(uModelViewMatrix) * vec4(0.0, 0.0, -1.0, 0.0)).xyz);

    // Transform ray origin and direction to object space
    mat4 inverseModelMatrix = inverse(uModelViewMatrix) * inverse(uProjectionMatrix);
    rayOrigin = (inverseModelMatrix * vec4(ndc, -1.0, 1.0)).xyz;
    rayDirection = normalize((inverseModelMatrix * vec4(0.0, 0.0, -1.0, 0.0)).xyz);

    // Raymarching
    float t = 0.0;
    for(int i = 0; i < 100; i++) {
        vec3 p = rayOrigin + t * rayDirection;
        float d = sceneSDF(p);
        if(d < 0.001) break;
        t += d;
        if(t > 20.0) break;
    }

    // Shading (simple for demonstration)
    vec3 p = rayOrigin + t * rayDirection;
    vec3 normal = normalize(vec3(
        sceneSDF(p + vec3(0.001, 0, 0)) - sceneSDF(p - vec3(0.001, 0, 0)),
        sceneSDF(p + vec3(0, 0.001, 0)) - sceneSDF(p - vec3(0, 0.001, 0)),
        sceneSDF(p + vec3(0, 0, 0.001)) - sceneSDF(p - vec3(0, 0, 0.001))
    ));
    vec3 color = normal * 0.5 + 0.5;

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(ndc, 0.0, 1.0);
}
`