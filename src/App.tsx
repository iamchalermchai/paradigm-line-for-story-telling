import { ReactFlowProvider } from '@xyflow/react'
import { Board } from './canvas/Board'
import { AppHeader } from './components/AppHeader'
import { ExportPngDialog } from './components/ExportPngDialog'
import { HelpDialog } from './components/HelpDialog'
import { ImportSceneBankDialog } from './components/ImportSceneBankDialog'
import { LeftPanel } from './components/LeftPanel'
import { SceneEditorDrawer } from './components/SceneEditorDrawer'
import { StructureChooser } from './components/StructureChooser'

function App() {
  return (
    <ReactFlowProvider>
      <div className="flex h-full flex-col bg-cream">
        <AppHeader />
        <div className="flex min-h-0 flex-1">
          <LeftPanel />
          <main className="min-h-0 min-w-0 flex-1">
            <Board />
          </main>
          <SceneEditorDrawer />
        </div>
        <ExportPngDialog />
        <ImportSceneBankDialog />
        <HelpDialog />
        <StructureChooser />
      </div>
    </ReactFlowProvider>
  )
}

export default App
