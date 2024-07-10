import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"

import './index.css'

import RaymarchingScene from "./RaymarchingScene.jsx"

export default function App() {

 return (

  
    <Canvas shadows camera={{ position: [0, 0, 4], fov: 40 }}>
      <Environment
        files="./textures/envmap.hdr" />
        <color 
          attach="background" 
          args={["#eeeeee"]} />
      <RaymarchingScene />
    </Canvas>
  
  );
}

