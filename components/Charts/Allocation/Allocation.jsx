import React from "react";
import { BarStack } from "@visx/shape";
import { Group } from "@visx/group";
import { Grid } from "@visx/grid";
import { AxisBottom } from "@visx/axis";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { LegendOrdinal } from "@visx/legend";
import { localPoint } from "@visx/event";

import { font } from "@fonts";

const defaultMargin = { top: 40, right: 0, bottom: 0, left: 0 };
let tooltipTimeout;

const Allocation = ({
  data,
  width,
  height,
  events = false,
  margin = defaultMargin,
  background = "#eaedff",
  backgroundTooltip = "rgba(0,0,0,0.9)",
  colors = ["#6c5efb", "#c998ff", "#a44afe"],
  className,
}) => {
  const tooltipStyles = {
    ...defaultStyles,
    ...font.style,
    minWidth: 60,
    backgroundColor: backgroundTooltip,
    color: "white",
  };

  const keys = Object.keys(data[0]).filter((d) => d !== "date");
  const temperatureTotals = data.reduce((allTotals, currentDate) => {
    const totalTemperature = keys.reduce((dailyTotal, k) => {
      dailyTotal += Number(currentDate[k]);
      return dailyTotal;
    }, 0);
    allTotals.push(totalTemperature);
    return allTotals;
  }, []);

  const formatDate = (date) => date;

  // accessors
  const getDate = (d) => d.date;

  // scales
  const dateScale = scaleBand({
    domain: data.map(getDate),
    padding: 0.2,
  });
  const temperatureScale = scaleLinear({
    domain: [0, Math.max(...temperatureTotals)],
    nice: true,
  });
  const colorScale = scaleOrdinal({
    domain: keys,
    range: colors,
  });

  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // TooltipInPortal is rendered in a separate child of <body /> and positioned
    // with page coordinates which should be updated on scroll. consider using
    // Tooltip or TooltipWithBounds if you don't need to render inside a Portal
    scroll: true,
  });

  if (width < 10) return null;
  // bounds
  const xMax = width;
  const yMax = height - margin.top - 100;

  dateScale.rangeRound([0, xMax]);
  temperatureScale.range([yMax, 0]);

  return width < 10 ? null : (
    <div style={{ position: "relative" }} className={className}>
      <svg ref={containerRef} width="100%" height="100%">
        <rect
          x={0}
          y={0}
          width="100%"
          height="100%"
          fill={background}
          rx={14}
        />
        <Grid
          top={margin.top}
          left={margin.left}
          xScale={dateScale}
          yScale={temperatureScale}
          width={xMax}
          height={yMax}
          stroke="black"
          strokeOpacity={0.1}
          xOffset={dateScale.bandwidth() / 2}
        />
        <Group top={margin.top}>
          <BarStack
            data={data}
            keys={keys}
            x={getDate}
            xScale={dateScale}
            yScale={temperatureScale}
            color={colorScale}
          >
            {(barStacks) =>
              barStacks.map((barStack) =>
                barStack.bars.map((bar) => (
                  <rect
                    key={`bar-stack-${barStack.index}-${bar.index}`}
                    x={bar.x}
                    y={bar.y}
                    height={bar.height}
                    width={bar.width}
                    fill={bar.color}
                    onClick={() => {
                      if (events) alert(`clicked: ${JSON.stringify(bar)}`);
                    }}
                    onMouseLeave={() => {
                      tooltipTimeout = window.setTimeout(() => {
                        hideTooltip();
                      }, 300);
                    }}
                    onMouseMove={(event) => {
                      if (tooltipTimeout) clearTimeout(tooltipTimeout);
                      // TooltipInPortal expects coordinates to be relative to containerRef
                      // localPoint returns coordinates relative to the nearest SVG, which
                      // is what containerRef is set to in this example.
                      const eventSvgCoords = localPoint(event);
                      const left = bar.x + bar.width / 2;
                      showTooltip({
                        tooltipData: bar,
                        tooltipTop: eventSvgCoords?.y,
                        tooltipLeft: left,
                      });
                    }}
                  />
                ))
              )
            }
          </BarStack>
        </Group>
        <AxisBottom
          top={yMax + margin.top}
          scale={dateScale}
          tickFormat={formatDate}
          stroke={colors[2]}
          tickStroke={colors[2]}
          tickLabelProps={{
            fill: colors[2],
            fontSize: 11,
            textAnchor: "middle",
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: margin.top / 2 - 10,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          fontSize: "14px",
        }}
      >
        <LegendOrdinal
          scale={colorScale}
          direction="row"
          labelMargin="0 15px 0 0"
        />
      </div>

      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
        >
          <div style={{ color: colorScale(tooltipData.key) }}>
            <strong>{tooltipData.key}</strong>
          </div>
          <div>{tooltipData.bar.data[tooltipData.key]}℉</div>
          <div>
            <small>{formatDate(getDate(tooltipData.bar.data))}</small>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
};

export default Allocation;
