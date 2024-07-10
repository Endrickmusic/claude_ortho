import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { vertexShader, fragmentShader } from './shaders/orthographic.js'

export default function RaymarchingScene() {

      const meshRef = useRef()
      const materialRef = useRef()
      const { camera } = useThree()
    
      useFrame((state) => {
        if (materialRef.current && meshRef.current) {
          materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
          materialRef.current.uniforms.uResolution.value.set(state.size.width, state.size.height)
          materialRef.current.uniforms.uCameraPosition.value.copy(camera.position)
          materialRef.current.uniforms.uModelViewMatrix.value.copy(camera.matrixWorldInverse)
          materialRef.current.uniforms.uProjectionMatrix.value.copy(camera.projectionMatrix)
        }
      })
    
      return (
        <mesh ref={meshRef}>
          <boxGeometry args={[2, 2, 2]} />
          <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={{
              uTime: { value: 0 },
              uResolution: { value: new THREE.Vector2() },
              uCameraPosition: { value: new THREE.Vector3() },
              uModelViewMatrix: { value: new THREE.Matrix4() },
              uProjectionMatrix: { value: new THREE.Matrix4() }
            }}
          />
        </mesh>
      )
    }