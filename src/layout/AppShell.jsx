import { useState, useCallback, useRef } from 'react'
import { DAYS } from '../data/course'
import { loadProgress, saveProgress } from '../lib/storage'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'
import DayView from '../views/DayView'
import MemoryMapView from '../views/MemoryMapView'
import InterviewQuestionsView from '../views/InterviewQuestionsView'
import OneDayCrashView from '../views/OneDayCrashView'

export default function AppShell() {
  const [progress, setProgress] = useState(loadProgress)
  const [mobileOpen, setMobileOpen] = useState(false)
  const currentView = progress.currentView || 'day-1'

  const mainRef = useRef(null)

  const setView = useCallback((view) => {
    setProgress(p => {
      const updated = { ...p, currentView: view }
      saveProgress(updated); return updated
    })
    if (mainRef.current) mainRef.current.scrollTop = 0
    window.scrollTo(0, 0)
  }, [])

  const renderView = () => {
    if (currentView.startsWith('day-')) {
      const day = DAYS.find(d => d.id === parseInt(currentView.replace('day-', '')))
      if (day) return <DayView day={day} progress={progress} setProgress={setProgress} />
    }
    if (currentView === 'memory-map') return <MemoryMapView />
    if (currentView === 'interview-qs') return <InterviewQuestionsView progress={progress} setProgress={setProgress} />
    if (currentView === 'crash') return <OneDayCrashView />
    return null
  }

  return (
    <div className="app-shell flex min-h-screen">
      <Sidebar currentView={currentView} setView={setView} progress={progress}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader setMobileOpen={setMobileOpen} />

        <main ref={mainRef} className="content-scroll flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  )
}
