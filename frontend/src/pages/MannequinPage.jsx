import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import './MannequinPage.css'

const API = 'http://localhost:1206'

export default function MannequinPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Read measurements from URL (Kaspia passes these)
  const shoulder  = searchParams.get('shoulder')  || '100'
  const chest     = searchParams.get('chest')     || '90'
  const waist     = searchParams.get('waist')     || '70'
  const hip       = searchParams.get('hip')       || '95'
  const armLength = searchParams.get('armLength') || '60'

  const mountRef     = useRef(null)
  const rendererRef  = useRef(null)
  const sceneRef     = useRef(null)
  const cameraRef    = useRef(null)
  const controlsRef  = useRef(null)
  const animFrameRef = useRef(null)
  const mannequinRef = useRef(null)

  const [status, setStatus]           = useState('idle')
  const [errorMsg, setErrorMsg]       = useState('')
  const [mannequinId, setMannequinId] = useState(null)

  // ── Three.js setup ──────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf3f0ff)
    sceneRef.current = scene

    const w = container.clientWidth
    const h = container.clientHeight
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100)
    camera.position.set(0, 1.2, 3.8)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.minDistance   = 1.2
    controls.maxDistance   = 7
    controls.target.set(0, 1, 0)
    controlsRef.current = controls

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const dir = new THREE.DirectionalLight(0xffffff, 1.1)
    dir.position.set(3, 6, 4)
    dir.castShadow = true
    scene.add(dir)
    const fill = new THREE.DirectionalLight(0xe9d5ff, 0.35)
    fill.position.set(-3, 2, -2)
    scene.add(fill)
    const back = new THREE.DirectionalLight(0xffffff, 0.25)
    back.position.set(0, 4, -4)
    scene.add(back)

    // Ground
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(1.6, 64),
      new THREE.MeshStandardMaterial({ color: 0xede9fe, roughness: 0.9 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const grid = new THREE.GridHelper(3.2, 12, 0xc4b5fd, 0xe9d5ff)
    grid.position.y = 0.002
    scene.add(grid)

    function animate() {
      animFrameRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    function onResize() {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(animFrameRef.current)
      renderer.dispose()
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement)
    }
  }, [])

  // ── Load GLTF ───────────────────────────────────────────────
  function loadMannequin(id) {
    const loader = new GLTFLoader()
    loader.load(
      `${API}/mannequin/file/${id}`,
      (gltf) => {
        if (mannequinRef.current)
          sceneRef.current.remove(mannequinRef.current)

        const model = gltf.scene
        model.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color:     0xb49fcc,
              roughness: 0.30,
              metalness: 0.04,
            })
            child.castShadow    = true
            child.receiveShadow = true
          }
        })

        const box    = new THREE.Box3().setFromObject(model)
        const size   = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(new THREE.Vector3(center.x, box.min.y, center.z))

        sceneRef.current.add(model)
        mannequinRef.current = model

        const dist = size.y * 1.6
        cameraRef.current.position.set(0, size.y * 0.48, dist)
        controlsRef.current.target.set(0, size.y * 0.42, 0)
        controlsRef.current.update()

        setStatus('success')
      },
      undefined,
      () => {
        setErrorMsg('Could not load mannequin model.')
        setStatus('error')
      }
    )
  }

  // ── Generate ────────────────────────────────────────────────
  async function handleGenerate() {
    setStatus('generating')
    setErrorMsg('')
    try {
      const res  = await fetch(`${API}/mannequin/generate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shoulder:  parseFloat(shoulder),
          chest:     parseFloat(chest),
          waist:     parseFloat(waist),
          hip:       parseFloat(hip),
          armLength: parseFloat(armLength),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMannequinId(data.mannequinId)
        loadMannequin(data.mannequinId)
      } else {
        setErrorMsg(data.message || 'Could not generate.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Could not connect to server. Make sure all 3 servers are running.')
      setStatus('error')
    }
  }

  function handleExport() {
    if (!mannequinId) return
    const link    = document.createElement('a')
    link.href     = `${API}/mannequin/file/${mannequinId}`
    link.download = `mannequin_${mannequinId}.glb`
    link.click()
  }

  function handleDrapeFabric() {
    navigate(`/drape-fabric?mannequinId=${mannequinId}`)
  }

  return (
    <div className="page mannequin-page">
      <div className="mannequin-header">
        <h1 className="mannequin-title">Your Mannequin</h1>
        <p className="mannequin-subtitle">
          Based on your measurements — rotate with mouse drag
        </p>
      </div>

      <div className="mannequin-layout">
        {/* 3D Viewer */}
        <div className="mannequin-viewer-col">
          <div className="mannequin-canvas-wrap" ref={mountRef}>
            {status === 'idle' && (
              <div className="mannequin-placeholder">
                <span className="mannequin-placeholder-icon">🪡</span>
                <p>Click "Generate Mannequin" to begin</p>
              </div>
            )}
            {status === 'generating' && (
              <div className="mannequin-placeholder">
                <div className="spinner" />
                <p>Generating your mannequin...</p>
              </div>
            )}
            {status === 'error' && (
              <div className="mannequin-placeholder error">
                <span style={{ fontSize: 32 }}>⚠️</span>
                <p>{errorMsg}</p>
              </div>
            )}
          </div>
          {status === 'success' && (
            <p className="mannequin-hint">🖱 Drag to rotate · Scroll to zoom</p>
          )}
        </div>

        {/* Controls */}
        <div className="mannequin-info-col">
          <div className="mannequin-measurements-card">
            <h3 className="mannequin-card-title">Measurements</h3>
            <div className="mannequin-measurements">
              {[
                ['Shoulder', shoulder],
                ['Chest',    chest],
                ['Waist',    waist],
                ['Hip',      hip],
                ['Arm Length', armLength],
              ].map(([label, val]) => (
                <div key={label} className="measurement-row">
                  <span>{label}</span>
                  <span>{val} cm</span>
                </div>
              ))}
            </div>
          </div>

          {(status === 'idle' || status === 'error') && (
            <button className="btn btn-plum btn-lg mannequin-btn"
                    onClick={handleGenerate}>
              Generate Mannequin
            </button>
          )}

          {status === 'generating' && (
            <button className="btn btn-plum btn-lg mannequin-btn" disabled>
              Generating...
            </button>
          )}

          {status === 'success' && (
            <div className="mannequin-actions">
              <button className="btn btn-plum btn-lg mannequin-btn"
                      onClick={handleDrapeFabric}>
                Drape Fabric →
              </button>
              <button className="btn btn-outline btn-lg mannequin-btn"
                      onClick={handleExport}>
                Export (.glb)
              </button>
              <button className="btn btn-outline btn-lg mannequin-btn"
                      onClick={handleGenerate}>
                Regenerate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
