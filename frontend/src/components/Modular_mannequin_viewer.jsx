import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture, Stage, Center } from '@react-three/drei';
import * as THREE from 'three';

// This sub-component handles loading each individual .glb part
function ModelPart({ url, textureUrl, isLace = false, isMannequin = false }) {
    if (!url) return null;
    
    const { scene } = useGLTF(url);
    
    // We wrap texture loading in a try/catch logic or use a fallback
    let texture = null;
    try {
        if (textureUrl) {
            texture = useTexture(textureUrl);
        }
    } catch (e) {
        console.warn("Texture not found, using default material color");
    }

    useEffect(() => {
        if (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            // Increased to 4,4 to make the fabric pattern look more realistic/detailed
            texture.repeat.set(4, 4); 
        }

        scene.traverse((child) => {
            if (child.isMesh) {
                if (texture) {
                    child.material.map = texture;
                } else {
                    // Fallback colors if no texture image exists
                    child.material.color = new THREE.Color(isMannequin ? "#f5d0b9" : "#ffffff");
                }
                
                if (isLace) {
                    child.material.transparent = true;
                    child.material.opacity = 0.8;
                    child.material.alphaTest = 0.5;
                }

                child.material.roughness = isMannequin ? 0.8 : 0.5;
                child.material.needsUpdate = true;
            }
        });
    }, [scene, texture, isLace, isMannequin]);

    return <primitive object={scene} />;
}

const ModularMannequinViewer = ({ urls }) => {
    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#f8f9fa' }}>
            <Canvas shadows camera={{ position: [0, 1, 5], fov: 40 }}>
                {/* Lights for 3D visibility */}
                <ambientLight intensity={0.7} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <Suspense fallback={<mesh><boxGeometry /><meshStandardMaterial color="gray" /></mesh>}>
                    <Stage environment="city" intensity={0.5} contactShadow={true}>
                        <Center>
                            {/* 1. The Body */}
                            <ModelPart 
                                url={urls.mannequin} 
                                isMannequin={true} 
                            />

                            {/* 2. The Main Garment */}
                            <ModelPart 
                                url={urls.kurta} 
                                textureUrl={urls.fabricTexture} 
                            />

                            {/* 3. Sleeves */}
                            <ModelPart 
                                url={urls.sleeve} 
                                textureUrl={urls.fabricTexture} 
                            />

                            {/* 4. Neck */}
                            <ModelPart 
                                url={urls.neck} 
                                textureUrl={urls.fabricTexture} 
                            />

                            {/* 5. Lace */}
                            <ModelPart 
                                url={urls.lace} 
                                textureUrl={urls.fabricTexture} 
                                isLace={true} 
                            />
                        </Center>
                    </Stage>
                </Suspense>

                {/* --- UPDATED SMOOTH CONTROLS --- */}
                <OrbitControls 
                    enablePan={false}           // Keeps mannequin in the center
                    minDistance={2.5}           // Prevents zooming too close
                    maxDistance={6}             // Prevents zooming too far
                    zoomSpeed={0.4}             // Makes scrolling much smoother
                    rotateSpeed={0.7}           // Natural rotation speed
                    target={[0, 1.1, 0]}        // Focuses the camera on the TORSO instead of feet
                    makeDefault                 
                />
            </Canvas>
            
            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.7)', padding: '5px 10px', borderRadius: '5px', fontSize: '12px' }}>
                Mode: Interactive 3D
            </div>
        </div>
    );
};

export default ModularMannequinViewer;