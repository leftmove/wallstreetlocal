import React from "react";
import { useParentSize } from "@visx/responsive";
import { BarStackHorizontal } from "@visx/shape";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import cityTemperature from "@visx/mock-data/lib/mocks/cityTemperature";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { timeParse, timeFormat } from "@visx/vendor/d3-time-format";
import { withTooltip, Tooltip, defaultStyles } from "@visx/tooltip";
import { LegendOrdinal } from "@visx/legend";

const purple1 = "#6c5efb";
const purple2 = "#c998ff";
export const purple3 = "#a44afe";
export const background = "#eaedff";
const defaultMargin = { top: 40, left: 50, right: 40, bottom: 100 };
const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: "rgba(0,0,0,0.9)",
  color: "white",
};

const data = cityTemperature.slice(0, 12);
const keys = Object.keys(data[0]).filter((d) => d !== "date");

const temperatureTotals = data.reduce((allTotals, currentDate) => {
  const totalTemperature = keys.reduce((dailyTotal, k) => {
    dailyTotal += Number(currentDate[k]);
    return dailyTotal;
  }, 0);
  allTotals.push(totalTemperature);
  return allTotals;
}, []);

const parseDate = timeParse("%Y-%m-%d");
const format = timeFormat("%b %d");
const formatDate = (date) => format(parseDate(date));

// accessors
const getDate = (d) => d.date;

let tooltipTimeout;

export default withTooltip(
  ({
    customKeys = keys,
    customData = data,
    width,
    height,
    events = false,
    margin = defaultMargin,
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  }) => {
    // bounds
    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;

    // scales
    const temperatureScale = scaleLinear({
      domain: [0, Math.max(...temperatureTotals)],
    });
    const dateScale = scaleBand({
      domain: customData.map(getDate),
      padding: 0.2,
    });
    const colorScale = scaleOrdinal({
      domain: customKeys,
      range: [purple1, purple2, purple3],
    });

    temperatureScale.rangeRound([0, xMax]);
    dateScale.rangeRound([yMax, 0]);

    return (
      <div className="flex justify-center !font-switzer">
        <svg width={width} height={height}>
          {/* <rect width={width} height={height} fill={background} rx={14} /> */}
          <Group top={margin.top} left={margin.left}>
            <BarStackHorizontal
              data={customData}
              keys={customKeys}
              height={yMax}
              y={getDate}
              xScale={temperatureScale}
              yScale={dateScale}
              color={colorScale}
            >
              {(barStacks) =>
                barStacks.map((barStack) =>
                  barStack.bars.map((bar) => (
                    <rect
                      key={`barstack-horizontal-${barStack.index}-${bar.index}`}
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={bar.height}
                      fill={bar.color}
                      onClick={() => {
                        if (events) alert(`clicked: ${JSON.stringify(bar)}`);
                      }}
                      onMouseLeave={() => {
                        tooltipTimeout = window.setTimeout(() => {
                          hideTooltip();
                        }, 300);
                      }}
                      onMouseMove={() => {
                        if (tooltipTimeout) clearTimeout(tooltipTimeout);
                        const top = bar.y + margin.top;
                        const left = bar.x + bar.width + margin.left;
                        showTooltip({
                          tooltipData: bar,
                          tooltipTop: top,
                          tooltipLeft: left,
                        });
                      }}
                    />
                  ))
                )
              }
            </BarStackHorizontal>
            <AxisLeft
              hideAxisLine
              hideTicks
              scale={dateScale}
              tickFormat={formatDate}
              stroke={purple3}
              tickStroke={purple3}
              tickLabelProps={{
                fill: purple3,
                fontSize: 11,
                textAnchor: "end",
                dy: "0.33em",
              }}
            />
            <AxisBottom
              top={yMax}
              scale={temperatureScale}
              stroke={purple3}
              tickStroke={purple3}
              tickLabelProps={{
                fill: purple3,
                fontSize: 11,
                textAnchor: "middle",
              }}
            />
          </Group>
        </svg>
        {/* <div
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
        </div> */}
        {tooltipOpen && tooltipData && (
          <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
            <div style={{ color: colorScale(tooltipData.key) }}>
              <strong>{tooltipData.key}</strong>
            </div>
            <div>{tooltipData.bar.data[tooltipData.key]}℉</div>
            <div>
              <small>{formatDate(getDate(tooltipData.bar.data))}</small>
            </div>
          </Tooltip>
        )}
      </div>
    );
  }
);
