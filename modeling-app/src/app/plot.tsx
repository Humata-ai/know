'use client'
import Plot from 'react-plotly.js';

export interface Point {
  x: number;
  y: number;
  z: number;
  color: string;
  text: string;
}

export function PlotExample({ points }: { points: Point[] }) {
  const data = [
    {
      x: points.map((point) => point.x), // Extract x-coordinates
      y: points.map((point) => point.y), // Extract y-coordinates
      z: points.map((point) => point.z), // Extract z-coordinates
      text: points.map((point) => point.text), // Extract labels
      mode: "markers+text",
      type: "scatter3d",
      marker: {
        size: 10,
        color: points.map((point) => point.color), // Use colors from points
      },
      textposition: "top center",
      textfont: {
        size: 12,
        color: "black",
      },
    },
  ];

  const layout = {
    title: "3D Plot of Points",
    scene: {
      xaxis: { title: "X-axis" },
      yaxis: { title: "Y-axis" },
      zaxis: { title: "Z-axis" },
    },
    margin: { l: 0, r: 0, b: 0, t: 0 },
  };

  return (
    <div>
      <Plot data={data} layout={layout} />
    </div>
  );

}
