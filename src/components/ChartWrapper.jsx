import { useEffect, useRef } from 'react';
import { createChart, AreaSeries } from 'lightweight-charts';
import { createSeriesMarkers } from 'lightweight-charts';

export function ChartWrapper({ data, onChartClick, transactions, averagePrice }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const avgLineRef = useRef(null);
  const markersRef = useRef(null);

  const clickHandlerRef = useRef(onChartClick);

  useEffect(() => {
    clickHandlerRef.current = onChartClick;
  }, [onChartClick]);



  // INIT CHART
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      crosshair: {
        mode: 0,
      },
      timeScale: {
        borderColor: '#334155',
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
      autoSize: true,
    });

    const series = chart.addSeries(AreaSeries, {
      topColor: 'rgba(59, 130, 246, 0.4)',
      bottomColor: 'rgba(59, 130, 246, 0.0)',
      lineColor: '#3b82f6',
      lineWidth: 2,
    });

    // CLICK HANDLER
    chart.subscribeClick((param) => {
      if (!param.point || !param.time || !clickHandlerRef.current) return;

      const price = param.seriesData.get(series)?.value;
      if (price) {
        clickHandlerRef.current(param.time, price);
      }
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // SET DATA (IMPORTANT FIX: use YYYY-MM-DD)
  useEffect(() => {
    if (!seriesRef.current || !data) return;

    const formattedData = data.map(d => ({
      time: d.time, // MUST be "YYYY-MM-DD"
      value: d.value || d.close
    }));

    seriesRef.current.setData(formattedData);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  useEffect(() => {
    if (!seriesRef.current || !data?.length || !transactions) return;

    // Wait one tick to ensure chart is fully ready
    const timeout = setTimeout(() => {

      if (!transactions.length) {
        if (markersRef.current) {
          markersRef.current.setMarkers([]);
        }
        return;
      }

      const markers = transactions.map((tx, idx) => {
        const normalizedDate = new Date(tx.date).toISOString().split('T')[0];

        return {
          id: tx.id || `tx-${idx}`,
          time: normalizedDate,
          position: 'inBar',
          color: 'red',
          shape: 'circle',
          size: 1,
          text: `₹${Math.round(tx.amount)}`
        };
      });

      if (!markersRef.current) {
        markersRef.current = createSeriesMarkers(seriesRef.current, markers);
      } else {
        markersRef.current.setMarkers(markers);
      }

    }, 0); // micro-delay fixes race condition

    return () => clearTimeout(timeout);

  }, [transactions, data]);





  // AVG LINE
  useEffect(() => {
    if (!seriesRef.current) return;

    if (avgLineRef.current) {
      seriesRef.current.removePriceLine(avgLineRef.current);
      avgLineRef.current = null;
    }

    if (averagePrice && averagePrice > 0) {
      avgLineRef.current = seriesRef.current.createPriceLine({
        price: averagePrice,
        color: '#fbbf24',
        lineWidth: 2,
        lineStyle: 2,
        title: 'AVG COST',
      });
    }
  }, [averagePrice]);

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}

