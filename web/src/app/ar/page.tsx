import { Navbar } from '@/components/Navbar'
import { ModelViewerWrapper } from '@/components/ar/ModelViewerWrapper'
import { QRCodeSVG } from 'qrcode.react'
import { Smartphone, Download } from 'lucide-react'

export default function ARPage() {
  return (
    <div className="min-h-screen bg-junr-light-bg dark:bg-junr-dark-bg">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-12">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-junr-blue rounded-full text-sm font-bold mb-4 inline-block">
                Beta Feature
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">AR Business Cards</h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Experience the future of networking. Scan a card to see interactive 3D content floating in the real world.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* 3D Demo */}
            <div>
                <ModelViewerWrapper />
            </div>

            {/* Content & CTA */}
            <div className="space-y-8">
                <div className="bg-white dark:bg-white/5 p-8 rounded-2xl border border-gray-100 dark:border-white/10 shadow-lg">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600">
                            <Smartphone className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Web AR Limitations</h3>
                            <p className="text-gray-500 text-sm">
                                While this 3D viewer works in your browser, the full Augmented Reality experience (placing cards in the real world, tracking) requires access to native camera hardware features.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 dark:bg-black/20 rounded-xl">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <QRCodeSVG value="https://junr.app/download" size={100} />
                        </div>
                        <div className="text-center md:text-left">
                            <h4 className="font-bold mb-1">Download the App</h4>
                            <p className="text-sm text-gray-500 mb-4">Scan to install on iOS & Android</p>
                            <button className="flex items-center gap-2 px-6 py-2 bg-junr-blue text-white rounded-lg hover:bg-blue-600 transition font-medium">
                                <Download className="w-4 h-4" /> Get App
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  )
}
