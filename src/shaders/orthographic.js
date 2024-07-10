// src/shaders/screenSpaceUV.js

export const vertexShader = `

varying vec4 vWorldPosition;
varying mat4 vInverseModelMatrix;

void main() {
    vWorldPosition = modelMatrix * vec4(position, 1.0);
    vInverseModelMatrix = inverse(modelMatrix);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const fragmentShader = `

uniform vec3 uCameraPosition;
uniform mat4 uViewProjectionMatrix;
uniform vec2 uResolution;
uniform float uTime;

varying vec4 vWorldPosition;
varying mat4 vInverseModelMatrix;

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float sceneSDF(vec3 p) {
    float sphere1 = sdSphere(p - vec3(sin(uTime) * 1.5, 0.0, 0.0), 0.5);
    float sphere2 = sdSphere(p - vec3(-sin(uTime) * 1.5, 0.0, 0.0), 0.5);
    return smin(sphere1, sphere2, 0.5);
}

void main() {
    // Calculate NDC coordinates
    vec2 ndc = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
    
    // Calculate world space position on the near plane
    vec4 nearPlaneWorld = inverse(uViewProjectionMatrix) * vec4(ndc, -1.0, 1.0);
    nearPlaneWorld /= nearPlaneWorld.w;
    
    // Transform camera position and near plane position to object space
    vec3 rayOrigin = (vInverseModelMatrix * vec4(uCameraPosition, 1.0)).xyz;
    vec3 rayTarget = (vInverseModelMatrix * nearPlaneWorld).xyz;
    
    // Calculate ray direction in object space
    vec3 rayDirection = normalize(rayTarget - rayOrigin);

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
    // color = vec3(ndc, 0.0);

    gl_FragColor = vec4(color, 1.0);
}
`