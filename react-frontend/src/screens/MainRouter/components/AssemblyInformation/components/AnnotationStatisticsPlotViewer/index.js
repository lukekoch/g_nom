import { newPlot } from "plotly.js";
import { useEffect, useState } from "react";

const AnnotationStatisticsPlotViewer = ({ annotations }) => {
  const [data, setData] = useState({});
  const [layout, setLayout] = useState({});

  const plotlyDiv = document.getElementById("plotlyAnnotationFeatureTypes");
  useEffect(() => {
    if (plotlyDiv) {
      newPlot("plotlyAnnotationFeatureTypes", data, layout);
    }
  }, [plotlyDiv, data, layout]);

  useEffect(() => {
    if (annotations?.length) {
      getData();
      getLayout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations.length]);

  const getData = () => {
    const colors = [
      "rgb(56, 75, 126)",
      "rgb(18, 36, 37)",
      "rgb(34, 53, 101)",
      "rgb(36, 55, 57)",
      "rgb(6, 4, 4)",
    ];

    let traces = [];
    if (annotations && annotations.length > 0) {
      annotations.forEach((annotation, index) => {
        let x = [];
        let y = [];
        let types = [];
        let features = JSON.parse(annotation.featureCount);

        types.push("TOTAL");
        y.push(annotation.label || "id: " + annotation.id + " - ");
        x.push(features.total);

        Object.keys(features).forEach((type) => {
          if (type !== "total") {
            types.push(type.toUpperCase());
            y.push(annotation.label || "id: " + annotation.id + " - ");
            x.push(features[type]);
          }
        });

        traces.push({
          name: annotation.label || annotation.name,
          x: x,
          y: [types, y],
          orientation: "h",
          type: "bar",
          marker: {
            color: colors[index],
          },
        });
      });
    }

    setData(traces);
  };

  const getLayout = () => {
    let layout = {
      title: "Feature types",
      showlegend: true,
      legend: {
        x: -0.37,
        y: -0.25,
      },
      barmode: "bar",
      xaxis: {
        title: { text: "Number", standoff: 20 },
        tickfont: {
          family: "Old Standard TT, serif",
          size: 14,
          color: "black",
        },
        ticklen: 12,
        tickson: 2,
        automargin: true,
      },
      yaxis: {
        title: {
          type: "category",
          text: "Features",
          standoff: 20,
        },
        showgrid: true,
        side: "left",
        overlaying: "y",
        color: "grey",
        tickfont: {
          family: "Old Standard TT, serif",
          size: 14,
          color: "black",
        },
        ticklen: 12,
        automargin: true,
      },
    };
    setLayout(layout);
  };

  return (
    <div className="animate-grow-y w-full h-full">
      <div id="plotlyAnnotationFeatureTypes" className="w-full h-full" />
    </div>
  );
};

export default AnnotationStatisticsPlotViewer;
