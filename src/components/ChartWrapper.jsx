import { useEffect, useRef } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';

export function ChartWrapper({ data, onChartClick, transactions }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const dashedLinesRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#9ca3af', // slate-400
      },
      grid: {
        vertLines: { color: '#1e293b' }, // slate-800
        horzLines: { color: '#1e293b' },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: 'rgba(59, 130, 246, 0.5)',
          width: 1,
          style: 2, // Dashed
          labelBackgroundColor: '#3b82f6',
        },
        horzLine: {
          color: 'rgba(59, 130, 246, 0.5)',
          width: 1,
          style: 2, // Dashed
          labelBackgroundColor: '#3b82f6',
        },
      },
      timeScale: {
        borderColor: '#334155', // slate-700
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
      autoSize: true,
    });

    chartRef.current = chart;

    // Add Area Series
    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: 'rgba(59, 130, 246, 0.4)',
      bottomColor: 'rgba(59, 130, 246, 0.0)',
      lineColor: '#3b82f6',
      lineWidth: 2,
    });

    seriesRef.current = areaSeries;

    // Add separate series for dashed vertical lines
    const dashedLines = chart.addSeries(AreaSeries, {
      lineColor: 'rgba(59, 130, 246, 0.5)',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      visible: true,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    dashedLinesRef.current = dashedLines;

    areaSeries.setData(data);
    chart.timeScale().fitContent();

    // Setup Click Subscription
    const handleClick = (param) => {
      if (!param.point || !param.time) return;
      const price = param.seriesData.get(areaSeries)?.value || param.seriesData.get(areaSeries)?.close;
      if (price) {
        onChartClick(param.time, price);
      }
    };

    chart.subscribeClick(handleClick);

    // Cleanup
    return () => {
      chart.unsubscribeClick(handleClick);
      chart.remove();
    };
  }, [data, onChartClick]);

  // Handle Markers
  useEffect(() => {
    if (!seriesRef.current || !transactions) return;

    try {
      const chartMarkers = transactions.map(tx => {
        // Skip if date is missing
        if (!tx.date) return null;

        // Format the date label for the marker text (e.g., "Oct 12")
        const [y, m, d] = tx.date.split('-');
        const date = new Date(y, parseInt(m) - 1, d);
        const shortDate = date.toLocaleDateString('default', { month: 'short', day: 'numeric' });

        return {
          time: tx.date,
          position: 'inBar',
          color: '#3b82f6', // blue-500
          shape: 'circle',
          size: 1.5,
          text: `₹${Math.round(tx.amount)} (${shortDate})`,
        };
      }).filter(Boolean);

      seriesRef.current.setMarkers(chartMarkers);
    } catch (err) {
      console.error("Error setting markers:", err);
    }
  }, [transactions]);

  return (
    <div className="w-full h-full min-h-[400px] flex items-stretch">
      <div
        ref={chartContainerRef}
        className="w-full h-full flex-grow relative"
      />
    </div>
  );
}
