'use client'

import Script from 'next/script'

export function ModelViewerWrapper() {
  return (
    <>
      <Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js" />
      <div className="w-full h-[400px] md:h-[600px] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden relative shadow-inner border border-gray-200 dark:border-gray-700">
         {/* @ts-ignore */}
         <model-viewer
            src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
            alt="A 3D model of an astronaut"
            auto-rotate
            camera-controls
            shadow-intensity="1"
            style={{ width: '100%', height: '100%' }}
         >
         {/* @ts-ignore */}
         </model-viewer>
         <div className="absolute bottom-6 right-6 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md font-medium border border-white/20">
            Interactive 3D Demo
         </div>
      </div>
    </>
  )
}
