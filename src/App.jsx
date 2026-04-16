import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionValueEvent } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { DASHBOARD_DATA } from './data';

const SCENARIOS = ['100', '200', '1000'];

function formatNumber(value, decimals = 0) {
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function AnimatedNumber({ value, decimals = 0, suffix = '', className = '' }) {
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, { stiffness: 95, damping: 22, mass: 0.7 });
  const [displayValue, setDisplayValue] = useState(formatNumber(value, decimals));

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useMotionValueEvent(spring, 'change', latest => {
    setDisplayValue(formatNumber(latest, decimals));
  });

  return (
    <span className={`numeric ${className}`}>
      <span>{displayValue}</span>
      {suffix ? <span className="suffix">{suffix}</span> : null}
    </span>
  );
}

function useKeyboardShortcuts(setScenario, toggleLogicView, logicViewOpen) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === '1') setScenario('100');
      if (event.key === '2') setScenario('200');
      if (event.key === '3') setScenario('1000');
      if (event.key.toLowerCase() === 'd') toggleLogicView();
      if (event.key === 'Escape' && logicViewOpen) toggleLogicView(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setScenario, toggleLogicView, logicViewOpen]);
}

function buildChartOption(scenario) {
  const routing = scenario.routing;
  return {
    animationDuration: 820,
    animationEasing: 'cubicOut',
    grid: { left: 176, right: 36, top: 18, bottom: 26, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#9aa9ca', fontSize: 12 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: ['Random baseline', 'Distance VRP', 'Predicted-time VRP'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#eef2ff', fontSize: 13, margin: 12 },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(11, 16, 31, 0.95)',
      borderColor: 'rgba(255,255,255,0.14)',
      textStyle: { color: '#eef2ff' },
      formatter: params => {
        const p = params[0];
        return `${p.name}<br/>Total cost: <b>${formatNumber(p.value, 0)} min</b>`;
      },
    },
    series: [
      {
        type: 'bar',
        barWidth: 16,
        data: [
          routing.random_baseline.totalCostMin,
          routing.distance_vrp.totalCostMin,
          routing.predicted_time_vrp.totalCostMin,
        ],
        itemStyle: {
          borderRadius: [0, 10, 10, 0],
          color: params => {
            if (params.dataIndex === 0) return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: 'rgba(255,107,107,0.96)' },
              { offset: 1, color: 'rgba(255,107,107,0.58)' },
            ]);
            if (params.dataIndex === 1) return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: 'rgba(78,120,177,0.96)' },
              { offset: 1, color: 'rgba(78,120,177,0.56)' },
            ]);
            return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: 'rgba(0,210,255,1)' },
              { offset: 0.52, color: 'rgba(0,210,255,0.88)' },
              { offset: 1, color: 'rgba(0,255,159,0.82)' },
            ]);
          },
          shadowBlur: 18,
          shadowColor: params => params?.dataIndex === 2 ? 'rgba(0,255,159,0.24)' : 'rgba(0,0,0,0)',
        },
        label: {
          show: true,
          position: 'right',
          color: '#eef2ff',
          formatter: ({ value }) => `${formatNumber(value, 0)} min`,
        },
      },
    ],
  };
}

function Sparkline({ values }) {
  const width = 360;
  const height = 110;
  const pad = 18;
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const x = index => pad + index * ((width - pad * 2) / (values.length - 1));
  const y = value => height - pad - ((value - min) / (max - min)) * (height - pad * 2);
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} aria-label="Prediction gain sparkline">
      <defs>
        <linearGradient id="spark-gradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#7ce7ff" />
          <stop offset="100%" stopColor="#67e8a5" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#spark-gradient)" strokeWidth="4" strokeLinecap="round" />
      {values.map((v, index) => (
        <g key={index}>
          <circle cx={x(index)} cy={y(v)} r="5" fill="#0f1631" stroke="#7ce7ff" strokeWidth="2" />
          <text x={x(index)} y={y(v) - 10} textAnchor="middle" className="spark-label">{v.toFixed(2)}%</text>
          <text x={x(index)} y={height - 4} textAnchor="middle" className="spark-axis">{SCENARIOS[index]}</text>
        </g>
      ))}
    </svg>
  );
}

function RouteCanvas({ scenarioKey, scenario }) {
  const counts = scenario.bestScenarioDetail.vehicleCustomerCounts;
  const widths = { '100': 620, '200': 720, '1000': 860 };
  const heights = { '100': 280, '200': 320, '1000': 360 };
  const viewWidth = widths[scenarioKey] || 720;
  const viewHeight = heights[scenarioKey] || 320;
  const centerX = viewWidth / 2;
  const centerY = viewHeight * 0.54;
  const ringRadius = scenarioKey === '1000' ? 126 : scenarioKey === '200' ? 114 : 102;
  const activeCount = scenario.bestScenario.activeVehicles;

  const routes = counts.map((count, index) => {
    const angle = (-Math.PI / 2) + index * (2 * Math.PI / counts.length);
    const active = count > 0;
    const magnitude = active ? ringRadius + Math.min(28, count * 0.14) : ringRadius * 0.42;
    const controlOffset = scenarioKey === '1000' ? 42 : 28;
    const endX = centerX + Math.cos(angle) * magnitude;
    const endY = centerY + Math.sin(angle) * (magnitude * 0.84);
    const ctrlX = centerX + Math.cos(angle) * (magnitude * 0.54 + controlOffset);
    const ctrlY = centerY + Math.sin(angle) * (magnitude * 0.36);
    const path = `M ${centerX} ${centerY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
    const points = Array.from({ length: Math.max(4, Math.min(16, Math.round(count / 18))) }, (_, pointIndex) => {
      const t = (pointIndex + 1) / (Math.max(4, Math.min(16, Math.round(count / 18))) + 1);
      const px = (1 - t) * (1 - t) * centerX + 2 * (1 - t) * t * ctrlX + t * t * endX;
      const py = (1 - t) * (1 - t) * centerY + 2 * (1 - t) * t * ctrlY + t * t * endY;
      return { x: px, y: py };
    });
    return {
      index,
      count,
      active,
      path,
      endX,
      endY,
      points,
      glowClass: index === 2 ? 'route-glow' : '',
      animationDelay: `${index * 0.12}s`,
      particleDelay: `${index * 0.22}s`,
    };
  });

  const densityPoints = Array.from({ length: scenarioKey === '1000' ? 56 : scenarioKey === '200' ? 34 : 20 }, (_, i) => {
    const angle = (i / (scenarioKey === '1000' ? 56 : scenarioKey === '200' ? 34 : 20)) * Math.PI * 2;
    const radial = ringRadius * (0.68 + (i % 5) * 0.05);
    return {
      x: centerX + Math.cos(angle) * radial,
      y: centerY + Math.sin(angle) * radial * 0.8,
      opacity: 0.22 + (i % 4) * 0.12,
      size: 1.6 + (i % 3),
    };
  });

  return (
    <div className="route-visual-shell">
      <div className="route-visual-header">
        <div>
          <h3>Route Dynamics</h3>
          <p>Illustrative route growth and controlled flow cues for communication.</p>
        </div>
        <div className="route-visual-badge">{activeCount} / 5 active vehicles</div>
      </div>
      <div className="route-visual-stage">
        <div className="route-grid" />
        <svg className="route-svg" viewBox={`0 0 ${viewWidth} ${viewHeight}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="routeGradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(124,231,255,0.96)" />
              <stop offset="100%" stopColor="rgba(103,232,165,0.92)" />
            </linearGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {densityPoints.map((point, index) => (
            <circle
              key={`bg-${index}`}
              cx={point.x}
              cy={point.y}
              r={point.size}
              fill="rgba(124,231,255,0.85)"
              opacity={point.opacity}
            />
          ))}
          {routes.map(route => (
            <g key={route.index}>
              <path
                d={route.path}
                className={`route-path ${route.active ? 'active' : 'inactive'} ${route.glowClass}`}
                style={{ animationDelay: route.animationDelay }}
                pathLength="1"
                filter={route.active ? 'url(#softGlow)' : undefined}
              />
              {route.active ? (
                <circle className="route-particle" r="4" fill="rgba(124,231,255,0.95)" style={{ animationDelay: route.particleDelay }}>
                  <animateMotion dur={scenarioKey === '1000' ? '2.6s' : '2.2s'} repeatCount="indefinite" path={route.path} rotate="auto" />
                </circle>
              ) : null}
              {route.points.map((point, pointIndex) => (
                <circle key={`pt-${route.index}-${pointIndex}`} cx={point.x} cy={point.y} r={2.4} className={route.active ? 'customer-dot active' : 'customer-dot inactive'} />
              ))}
              <circle cx={route.endX} cy={route.endY} r={route.active ? 6 : 4} className={route.active ? 'route-end active' : 'route-end inactive'} />
            </g>
          ))}
          <g>
            <circle cx={centerX} cy={centerY} r="14" className="depot-core" />
            <circle cx={centerX} cy={centerY} r="26" className="depot-ring" />
            <text x={centerX} y={centerY + 4} textAnchor="middle" className="depot-label">Depot</text>
          </g>
        </svg>
      </div>
      <div className="route-visual-caption">
        The animation is illustrative rather than street-level navigation. It is designed to communicate routing structure and scale-dependent complexity.
      </div>
    </div>
  );
}

function LogicView({ open, onClose, scenario }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="logic-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="logic-panel"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 180, damping: 24 }}
            onClick={event => event.stopPropagation()}
          >
            <div className="logic-topbar">
              <div>
                <h3>Logic View</h3>
                <p>Underlying analytical structure for the currently selected scenario.</p>
              </div>
              <button className="logic-close" onClick={onClose}>Close</button>
            </div>
            <div className="logic-grid">
              <section className="logic-card">
                <div className="logic-card-head">Pipeline Constants</div>
                <ul>
                  <li>Orders: <strong>{scenario.orders}</strong></li>
                  <li>Fleet size: <strong>5 vehicles</strong></li>
                  <li>K-Means clusters: <strong>6</strong></li>
                  <li>Primary metric: <strong>Predicted travel time</strong></li>
                  <li>Shared evaluation layer: <strong>Enabled</strong></li>
                </ul>
              </section>
              <section className="logic-card">
                <div className="logic-card-head">Best Scenario Diagnostics</div>
                <ul>
                  <li>Best method: <strong>{scenario.bestScenario.label}</strong></li>
                  <li>Total cost: <strong>{formatNumber(scenario.bestScenario.totalCostMin, 0)} min</strong></li>
                  <li>Active vehicles: <strong>{scenario.bestScenario.activeVehicles} / 5</strong></li>
                  <li>Customer balance CV: <strong>{formatNumber(scenario.bestScenario.customerBalanceCv, 3)}</strong></li>
                  <li>Cost balance CV: <strong>{formatNumber(scenario.bestScenario.costBalanceCv, 3)}</strong></li>
                </ul>
              </section>
              <section className="logic-card logic-wide">
                <div className="logic-card-head">Vehicle-level Detail</div>
                <div className="logic-table-wrap">
                  <table className="logic-table">
                    <thead>
                      <tr>
                        <th>Vehicle</th>
                        <th>Customer count</th>
                        <th>Route cost (min)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenario.bestScenarioDetail.vehicleCustomerCounts.map((count, index) => (
                        <tr key={index}>
                          <td>V{index + 1}</td>
                          <td>{formatNumber(count, 0)}</td>
                          <td>{formatNumber(scenario.bestScenarioDetail.vehicleCosts[index], 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function App() {
  const [activeScenario, setActiveScenario] = useState('100');
  const [logicViewOpen, setLogicViewOpen] = useState(false);

  const project = DASHBOARD_DATA.project;
  const scenario = DASHBOARD_DATA.scenarios[activeScenario];
  const improvements = DASHBOARD_DATA.scenarios;

  useKeyboardShortcuts(setActiveScenario, next => {
    if (typeof next === 'boolean') {
      setLogicViewOpen(next);
      return;
    }
    setLogicViewOpen(value => !value);
  }, logicViewOpen);

  const chartOption = useMemo(() => buildChartOption(scenario), [scenario]);
  const sparkValues = useMemo(() => SCENARIOS.map(key => improvements[key].improvementPct.predictedVsDistance), [improvements]);

  const best = scenario.bestScenario;

  return (
    <div className="app-shell">
      <div className="ambient-grid" />
      <div className="ambient-glow ambient-glow-a" />
      <div className="ambient-glow ambient-glow-b" />

      <header className="topbar">
        <div className="title-block">
          <div className="eyebrow">Smart Logistics · Decision Support Dashboard</div>
          <h1>{project.title}</h1>
          <p>{project.subtitle} · Analytical interface for route quality, scale effects, and fleet diagnostics.</p>
          <div className="badge-row">
            <span className="badge"><span className="pulse-dot" />System Online</span>
            <span className="badge">Fleet: {project.fleetSize}</span>
            <span className="badge">Clusters: {project.clusters}</span>
            <span className="badge">Valid trips: {formatNumber(project.validTrips, 0)}</span>
          </div>
        </div>

        <div className="topbar-controls">
          <div className="scenario-switcher">
            {SCENARIOS.map(key => (
              <button
                key={key}
                className={`scenario-btn ${activeScenario === key ? 'active' : ''}`}
                onClick={() => setActiveScenario(key)}
              >
                {key} Orders
              </button>
            ))}
          </div>
          <button className="logic-btn" onClick={() => setLogicViewOpen(value => !value)}>
            Logic View <span className="logic-shortcut">D</span>
          </button>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="panel metrics-panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Core Model Metrics</div>
              <div className="panel-subtitle">Hold-out prediction performance</div>
            </div>
            <div className="panel-meta">Train {formatNumber(project.trainRows, 0)} · Test {formatNumber(project.testRows, 0)}</div>
          </div>
          <div className="metrics-grid">
            <div className="metric-card emphasis">
              <div className="metric-label">MAE</div>
              <AnimatedNumber value={scenario.modelMetrics.maeMin} decimals={2} suffix=" min" className="metric-value" />
            </div>
            <div className="metric-card">
              <div className="metric-label">RMSE</div>
              <AnimatedNumber value={scenario.modelMetrics.rmseMin} decimals={3} suffix=" min" className="metric-value" />
            </div>
            <div className="metric-card">
              <div className="metric-label">R²</div>
              <AnimatedNumber value={scenario.modelMetrics.r2} decimals={3} className="metric-value" />
            </div>
            <div className="metric-card">
              <div className="metric-label">Orders</div>
              <AnimatedNumber value={scenario.orders} decimals={0} className="metric-value" />
            </div>
          </div>
        </section>

        <section className="panel routing-panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Routing Comparison</div>
              <div className="panel-subtitle">Shared predicted-travel-time evaluation</div>
            </div>
            <div className="panel-meta best-badge">Best: {best.label}</div>
          </div>
          <ReactECharts option={chartOption} style={{ height: 290, width: '100%' }} notMerge lazyUpdate />
        </section>

        <section className="panel insight-panel neon-panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Scenario Insight</div>
              <div className="panel-subtitle">Prediction stays best, but extra gain shrinks with scale</div>
            </div>
            <div className="panel-meta">Current scenario: {scenario.orders} orders</div>
          </div>
          <div className="insight-layout">
            <div className="insight-hero">
              <div className="insight-kicker">Predicted vs Distance</div>
              <div className="insight-number-wrap">
                <AnimatedNumber value={scenario.improvementPct.predictedVsDistance} decimals={2} suffix="%" className="insight-number" />
              </div>
              <p className="insight-copy">Extra gain of the prediction-aware VRP over the distance-only VRP at the selected scale.</p>
            </div>
            <div className="insight-side">
              <div className="mini-row">
                <div className="mini-head"><span>Distance vs Random</span><AnimatedNumber value={scenario.improvementPct.distanceVsRandom} decimals={2} suffix="%" className="mini-value" /></div>
                <div className="mini-track"><motion.div className="mini-fill cyan" key={`dist-${activeScenario}`} initial={{ width: 0 }} animate={{ width: `${scenario.improvementPct.distanceVsRandom}%` }} transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }} /></div>
              </div>
              <div className="mini-row">
                <div className="mini-head"><span>Predicted vs Random</span><AnimatedNumber value={scenario.improvementPct.predictedVsRandom} decimals={2} suffix="%" className="mini-value" /></div>
                <div className="mini-track"><motion.div className="mini-fill green neon-fill" key={`pred-${activeScenario}`} initial={{ width: 0 }} animate={{ width: `${scenario.improvementPct.predictedVsRandom}%` }} transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }} /></div>
              </div>
            </div>
          </div>
          <Sparkline values={sparkValues} />
        </section>

        <section className="panel diagnostics-panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Operational Diagnostics</div>
              <div className="panel-subtitle">Beyond total cost: fleet usage and balance</div>
            </div>
            <div className="panel-meta">Keyboard: 1 / 2 / 3 to switch</div>
          </div>
          <div className="diagnostics-grid">
            <div className="diag-card">
              <div className="diag-label">Active Vehicles</div>
              <AnimatedNumber value={best.activeVehicles} decimals={0} suffix=" / 5" className="diag-value" />
            </div>
            <div className="diag-card">
              <div className="diag-label">Customer Balance CV</div>
              <AnimatedNumber value={best.customerBalanceCv} decimals={3} className="diag-value" />
            </div>
            <div className="diag-card">
              <div className="diag-label">Cost Balance CV</div>
              <AnimatedNumber value={best.costBalanceCv} decimals={3} className="diag-value" />
            </div>
          </div>
          <p className="diag-note">
            {best.activeVehicles === 5
              ? 'All five vehicles are active in the best solution at this scale.'
              : `${best.activeVehicles} of 5 vehicles are active in the best solution, which suggests the current objective emphasizes total cost over full fleet utilization.`}
          </p>
        </section>

        <section className="panel route-panel full-span">
          <RouteCanvas scenarioKey={activeScenario} scenario={scenario} />
        </section>

        <section className="panel artifact-panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Route Visualization</div>
              <div className="panel-subtitle">Exported routing output for communication and review</div>
            </div>
          </div>
          <div className="artifact-body">
            <img src="/assets/route-illustration.png" alt="Illustrative route visualization from the optimization pipeline" />
            <p>This figure is shown as an exported routing output rather than a street-level navigation map. It demonstrates that the pipeline produced interpretable route artifacts in addition to summary tables.</p>
          </div>
        </section>
      </main>

      <footer className="footer-bar">
        <div><span className="keycap">1 / 2 / 3</span> Scenario switch</div>
        <div><span className="keycap">D</span> Logic view</div>
        <div className="footer-note">Compact dashboard for routing comparison, scale effects, and operational diagnostics.</div>
      </footer>

      <LogicView open={logicViewOpen} onClose={() => setLogicViewOpen(false)} scenario={scenario} />
    </div>
  );
}
