import { useRef, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

import { vertexShader, fragmentShader } from "./shaders/orthographic.js"

export default function RaymarchingScene() {
  const meshRef = useRef()
  const materialRef = useRef()
  const { camera } = useThree()
  const cameraDirection = useRef(new THREE.Vector3())
  const inverseModelMatrix = useMemo(() => new THREE.Matrix4(), [])

  useFrame((state) => {
    if (materialRef.current && meshRef.current) {
      meshRef.current.updateMatrixWorld()

      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uResolution.value.set(
        state.size.width,
        state.size.height
      )
      materialRef.current.uniforms.uCameraPosition.value.copy(camera.position)

      // Calculate camera direction
      camera.getWorldDirection(cameraDirection.current)
      materialRef.current.uniforms.uCameraDirection.value.copy(
        cameraDirection.current
      )

      // Combine view and projection matrices
      const viewProjectionMatrix = new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      )
      materialRef.current.uniforms.uViewProjectionMatrix.value.copy(
        viewProjectionMatrix
      )
      // Calculate the inverse
      inverseModelMatrix.copy(meshRef.current.matrixWorld).invert()

      // Update the uniform
      materialRef.current.uniforms.uInverseModelMatrix.value.copy(
        inverseModelMatrix
      )
      const worldPosition = meshRef.current.getWorldPosition(
        new THREE.Vector3()
      )
      const viewPosition = worldPosition
        .clone()
        .applyMatrix4(camera.matrixWorldInverse)

      // Project to screen space
      const screenPosition = worldPosition.project(camera)

      // Update uniforms
      materialRef.current.uniforms.uCubePosition.value.copy(screenPosition)
      materialRef.current.uniforms.uCubeViewPosition.value.copy(viewPosition)
      materialRef.current.uniforms.uCubeScale.value.copy(meshRef.current.scale)
    }
  })

  return (
    <mesh
      ref={meshRef}
      rotation={[Math.PI / 4, Math.PI / 8, Math.PI / 2]}
      position={[0, 0, 0]}
    >
      <boxGeometry args={[3, 3, 3]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2() },
          uCameraPosition: { value: new THREE.Vector3() },
          uCameraDirection: { value: new THREE.Vector3() },
          uViewProjectionMatrix: { value: new THREE.Matrix4() },
          uInverseModelMatrix: { value: new THREE.Matrix4() },
          uCubePosition: { value: new THREE.Vector3() },
          uCubeViewPosition: { value: new THREE.Vector3() },
          uCubeScale: { value: new THREE.Vector3() },
        }}
      />
    </mesh>
  )
}
