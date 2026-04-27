import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function BarChartCard({ title, labels, datasets, period, onPeriodChange }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  // Remap datasets to orange palette
  const orangeDatasets = datasets.map((ds, i) => ({
    ...ds,
    backgroundColor: ds.backgroundColor ?? (i === 0 ? "#F88F22" : "#FFE3B3"),
    hoverBackgroundColor: i === 0 ? "#EA6113" : "#FBB931",
    borderRadius: ds.borderRadius ?? 8,
    borderSkipped: false,
  }));

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: { labels, datasets: orangeDatasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: "#aaa" },
          },
          y: {
            grid: { color: "#f3f3f3" },
            ticks: { font: { size: 11 }, color: "#aaa" },
          },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, [labels, datasets]);

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <span className="dash-card-title">{title}</span>
        <div className="tab-group">
          {["Jour", "Semaine", "Mois"].map((t) => (
            <button
              key={t}
              className={`dash-tab ${period === t ? "active" : ""}`}
              onClick={() => onPeriodChange?.(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-legend">
        {datasets.map((ds, i) => (
          <span key={i} className="legend-item">
            <span
              className="legend-dot"
              style={{ background: ds.backgroundColor ?? (i === 0 ? "#F88F22" : "#FFE3B3") }}
            />
            {ds.label}
          </span>
        ))}
      </div>

      <div style={{ position: "relative", height: "200px" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}