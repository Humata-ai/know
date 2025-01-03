'use client'
import Plot from 'react-plotly.js';

export function PlotExample() {
  const data = [
    {
      x: [-0.9352136, -0.9926135, 0.92076135], // x-coordinates
      y: [0.35395238, 0.06285654, 0.27803382], // y-coordinates
      z: [0.009655553, 0.10376623, -0.27367073], // z-coordinates
      text: ["cat", "dog", "baseball"], // labels
      mode: "markers+text",
      type: "scatter3d",
      marker: {
        size: 10,
        color: ["blue", "green", "red"],
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
