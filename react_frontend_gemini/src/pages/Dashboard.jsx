import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import KPICards from '../components/KPICards';
import ChartPanel from '../components/ChartPanel';
import InsightCards from '../components/InsightCards';
import TierMatrix from '../components/TierMatrix';
import PlatformPerformance from '../components/PlatformPerformance';
import AnomalyTable from '../components/AnomalyTable';
import Forecaster from '../components/Forecaster';

import { useKPIs } from '../hooks/useKPIs';
import { useCharts } from '../hooks/useCharts';
import { useInsights } from '../hooks/useInsights';
import { useTiers } from '../hooks/useTiers';
import { usePlatforms } from '../hooks/usePlatforms';
import { useContract } from '../hooks/useContract';

function ROIOverviewTab() {
  const { data: kpis } = useKPIs();
  const { charts } = useCharts();
  return <><KPICards data={kpis} /><ChartPanel charts={charts} /></>;
}

function PlatformAnalysisTab() {
  const { platforms } = usePlatforms();
  const { charts } = useCharts();
  const filtered = charts?.filter(c => c.title?.toLowerCase().includes('platform') || c.id?.toLowerCase().includes('platform')) || [];
  return <><PlatformPerformance platforms={platforms} /><ChartPanel charts={filtered} /></>;
}

function InfluencerTiersTab() {
  const { tiers } = useTiers();
  return <TierMatrix tiers={tiers} />;
}

function CampaignInsightsTab() {
  const { insights } = useInsights();
  return <InsightCards insights={insights} />;
}

function ROIForecasterTab() {
  const { contract } = useContract();
  return <Forecaster contract={contract} />;
}

function AnomaliesTab() {
  const { charts } = useCharts();
  // Fallback extracting anomalies from chart specs if standalone anomalies file is missing
  const anomalies = charts?.find(c => c.id === 'anomalies')?.data || [];
  return <AnomalyTable anomalies={anomalies} />;
}

const TABS = ['ROI Overview', 'Platform Analysis', 'Influencer Tiers', 'Campaign Insights', 'ROI Forecaster', 'Anomalies'];
const TAB_COMPONENTS = [<ROIOverviewTab />, <PlatformAnalysisTab />, <InfluencerTiersTab />, <CampaignInsightsTab />, <ROIForecasterTab />, <AnomaliesTab />];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className='app-layout'>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className='main-content'>
        <header className='topbar'>
          <h2>{TABS[activeTab]}</h2>
        </header>
        <main className='content-area tab-enter-active' key={activeTab}>
          {TAB_COMPONENTS[activeTab]}
        </main>
      </div>
    </div>
  );
}