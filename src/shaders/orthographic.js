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
uniform mat4 uInverseModelMatrix;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uCubePosition;
uniform vec3 uCubeViewPosition;
uniform vec3 uCubeScale;

varying mat4 vInverseModelMatrix;
varying mat4 vModelMatrix;
varying vec4 vWorldPosition;
varying vec4 vRayOrigin;

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

void main() {

    
    // vec2 uv = (gl_FragCoord.xy - 0.5 * uuResolution.xy) / uuResolution.y;

        // Get screen space coordinates
    vec2 screenCoords = gl_FragCoord.xy;

    // Calculate aspect ratio
    float aspectRatio = uResolution.x / uResolution.y;

    // Convert screen space coordinates to UVs in the range [0, 1]
    vec2 screenUVs = screenCoords / (uResolution);
    
    // Convert to [-1, 1] range
    vec2 mappedNdc = screenUVs * 2.0 - 1.0;
    
    // Calculate local screen space coordinates by substracting the cube's position
    vec2 localScreenSpace = (mappedNdc - uCubePosition.xy);

    // applying the aspect ration
    localScreenSpace.x *= aspectRatio;

    // center the UVs
    localScreenSpace = localScreenSpace * 2.0 - 1.0;
   
    // scale UVs from center
    // localScreenSpace = ((localScreenSpace - vec2(0.5)) *  -cubeViewPosition.z / 5. / cubeScale.x) + vec2(0.5);
    localScreenSpace = ((localScreenSpace / 2. + 0.5) *  -uCubeViewPosition.z / 12. / uCubeScale.x) + vec2(0.5);
    
    localScreenSpace = localScreenSpace * 2.0 - 1.0;

    vec2 uv = localScreenSpace;

    vec3 forward = uCameraDirection;
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = cross(forward, right);

    // // Compute the ray origin based on the orthographic projection
    vec3 ro = uCameraPosition + uv.x * right + uv.y * up;
    // ro = (vInverseModelMatrix * vec4(ro, 1.0)).xyz;
    ro = (uInverseModelMatrix * vec4(ro, 1.0)).xyz;

    // // The ray direction is constant and in Object Space
    vec3 rd = forward;
    // rd = (vInverseModelMatrix * vec4(rd, 1.0)).xyz;
    rd = (uInverseModelMatrix * vec4(rd, 1.0)).xyz;
    rd = normalize(rd);

    // Raymarching
    float t = 0.0;
    for(int i = 0; i < 100; i++) {
        vec3 p = ro + t * rd;
        float d = sceneSDF(p);
        if(d < 0.001) break;
        t += d;
        if(t > 20.0) break;
    }

    // Shading (simple for demonstration)
    vec3 p = ro + t * rd;
    vec3 normal = normalize(vec3(
        sceneSDF(p + vec3(0.001, 0, 0)) - sceneSDF(p - vec3(0.001, 0, 0)),
        sceneSDF(p + vec3(0, 0.001, 0)) - sceneSDF(p - vec3(0, 0.001, 0)),
        sceneSDF(p + vec3(0, 0, 0.001)) - sceneSDF(p - vec3(0, 0, 0.001))
    ));
    vec3 color = normal * 0.5 + 0.5;

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(uv, 0.0, 1.0);
}
`
