import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import KPICards from '../components/KPICards'
import Explorer, { PlatformBars } from '../components/Explorer'
import InsightCards from '../components/InsightCards'
import TierMatrix from '../components/TierMatrix'
import PlatformPerformance from '../components/PlatformPerformance'
import AnomalyTable from '../components/AnomalyTable'
import Forecaster from '../components/Forecaster'
import VisualReports from '../components/VisualReports'
import { EmptyState } from '../components/EmptyState'
import { useKPIs } from '../hooks/useKPIs'
import { useCharts } from '../hooks/useCharts'
import { useInsights } from '../hooks/useInsights'
import { useTiers } from '../hooks/useTiers'
import { usePlatforms } from '../hooks/usePlatforms'
import { useContract } from '../hooks/useContract'
import { useAnomalies } from '../hooks/useAnomalies'
import { useReports } from '../hooks/useReports'

const TABS = ['ROI Overview','Platform Analysis','Influencer Tiers','Campaign Insights','ROI Forecaster','Anomalies','Visual Reports']

function Spinner() {
  return <div style={{ display:"flex", justifyContent:"center", padding:"var(--space-16)" }}><div style={{ width:36, height:36, border:"3px solid var(--color-border)", borderTop:"3px solid var(--color-primary)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /></div>
}

function ROIOverviewTab() {
  return <Explorer />
}

function PlatformAnalysisTab() {
  const { platforms, loading, error } = usePlatforms()
  if (loading) return <Spinner />
  if (error) return <EmptyState message={error} icon="⚠️" />
  return (<><PlatformPerformance platforms={platforms} /><PlatformBars platforms={platforms} /></>)
}

function InfluencerTiersTab() {
  const { tiers, loading, error } = useTiers()
  if (loading) return <Spinner />
  if (error) return <EmptyState message={error} icon="⚠️" />
  return <TierMatrix tiers={tiers} />
}

function CampaignInsightsTab() {
  const { insights, loading, error } = useInsights()
  if (loading) return <Spinner />
  if (error) return <EmptyState message={error} icon="⚠️" />
  return <InsightCards insights={insights} />
}

function ROIForecasterTab() {
  const { contract, loading, error } = useContract()
  if (loading) return <Spinner />
  if (error) return <EmptyState message={error} icon="⚠️" />
  return <Forecaster contract={contract} />
}

function AnomaliesTab() {
  const { anomalies, loading, error } = useAnomalies()
  if (loading) return <Spinner />
  if (error) return (
    <div>
      <EmptyState message={error} icon="⚠️" />
      <p style={{ textAlign:"center", fontSize:"var(--text-sm)", color:"var(--color-text-muted)", marginTop:"var(--space-4)" }}>
        Run: <code>python export_for_frontend_patch.py</code> to generate anomalies.json
      </p>
    </div>
  )
  return <AnomalyTable anomalies={anomalies ?? []} />
}

function VisualReportsTab() {
  const { reports, loading, error } = useReports()
  if (loading) return <Spinner />
  if (error) return (
    <div>
      <EmptyState message={error} icon="🖼️" />
      <p style={{ textAlign:"center", fontSize:"var(--text-sm)", color:"var(--color-text-muted)", marginTop:"var(--space-4)" }}>
        Run: <code>python export_for_frontend_patch.py</code> to import your pipeline PNG reports.
      </p>
    </div>
  )
  return <VisualReports reports={reports ?? []} />
}

const TAB_COMPONENTS = [
  <ROIOverviewTab />,
  <PlatformAnalysisTab />,
  <InfluencerTiersTab />,
  <CampaignInsightsTab />,
  <ROIForecasterTab />,
  <AnomaliesTab />,
  <VisualReportsTab />,
]

export default function Dashboard() {
  const [activeTab, setActiveTab]   = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)

  function changeTab(i) { setActiveTab(i); setDrawerOpen(false) }

  return (
    <div className="app-layout">
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <span style={{ fontFamily:"var(--font-heading)", fontWeight:800, fontSize:"var(--text-lg)", color:"var(--color-text-primary)" }}>🎯 ROI Intelligence</span>
        <button onClick={() => setDrawerOpen(true)} style={{ background:"none", border:"none", fontSize:"1.5rem", cursor:"pointer" }}>☰</button>
      </div>

      {/* Mobile drawer overlay */}
      <div className={`drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)} />
      <div className={`drawer ${drawerOpen ? "open" : ""}`}>
        <Sidebar activeTab={activeTab} onTabChange={changeTab} />
      </div>

      {/* Desktop sidebar */}
      <div style={{ display:"contents" }} className="desktop-sidebar">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <main className="main-content">
        <div style={{ maxWidth:1200 }}>
          <h1 className="section-title">{TABS[activeTab]}</h1>
          <div className="tab-enter tab-enter-active">
            {TAB_COMPONENTS[activeTab]}
          </div>
        </div>
      </main>
    </div>
  )
}