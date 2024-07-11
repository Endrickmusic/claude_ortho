import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"

import "./index.css"

import RaymarchingScene from "./RaymarchingScene.jsx"

export default function App() {
  return (
    <Canvas orthographic shadows camera={{ position: [0, 0, 4], zoom: 300 }}>
      {/* <Canvas shadows camera={{ position: [0, 0, 4], fov: 40 }}> */}
      <OrbitControls />
      <Environment files="./textures/envmap.hdr" />
      <color attach="background" args={["#eeeeee"]} />
      <RaymarchingScene />
    </Canvas>
  )
}
