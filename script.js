const url =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const w = 1200;
const h = 400;
const legendHeight = 150;
const legendWidth = 300;
const padding = 30;

const svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

const xScale = d3.scaleLinear();
xScale.range([0, w]);

const yScale = d3.scaleLinear();
yScale.range([0, h]);

const colors = d3.scaleThreshold();

colors.range(d3.schemeRdYlBu[11].reverse());
colors.domain([2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8]);

Legend(
    d3.scaleThreshold(
        [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8],
        d3.schemeRdYlBu[11]
    ),
    {
        title: "Unemployment rate (%)",
        tickSize: 0,
        tickFormat: d3.format(".1f"),
    }
);

// Add tooltip
const tooltip = d3.select(".chart").append("div").attr("id", "tooltip");

d3.json(url)
    .then((data) => {
        const dataset = data.monthlyVariance;
        const baseTemp = data.baseTemperature;

        const minYear = d3.min(dataset, (d) => d.year);
        const maxYear = d3.max(dataset, (d) => d.year + 1);

        const minMonth = d3.min(dataset, (d) => d.month - 0.5);
        const maxMonth = d3.max(dataset, (d) => d.month + 0.5);

        xScale.domain([minYear, maxYear]);
        yScale.domain([minMonth, maxMonth]);

        const xAxis = d3.axisBottom(xScale);
        xAxis.tickFormat(d3.format("d"));

        const yAxis = d3.axisLeft(yScale);

        // Parse each tick into a date so It can be format to the month name
        yAxis.tickFormat((d) => formatToMonthName(d));
        // Append axis to the SVG
        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", `translate(0,${h})`)
            .call(xAxis);

        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", `translate(0,0)`)
            .call(yAxis);

        // Add data elements to the SVG
        svg.append("g")
            .selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class", "cell")
            .attr("height", h / maxMonth)
            .attr("width", w / (maxYear - minYear))
            .attr("fill", (d) => {
                const totalTemp = baseTemp + d.variance;
                return colors(totalTemp);
            })
            .attr("x", (d) => xScale(d.year))
            .attr("y", (d) => yScale(d.month - 0.5))
            .attr("data-year", (d) => d.year)
            .attr("data-month", (d) => d.month - 1)
            .attr("data-temp", (d) => baseTemp + d.variance)
            .on("mouseover", (event, d) => {
                tooltip.classed("show", true);
                const month = formatToMonthName(d.month);

                const totalTemp = d3.format(".1f")(baseTemp + d.variance);
                const differenceTemp = d3.format("+.1f")(totalTemp - baseTemp);
                tooltip.html(`
            <div>
                ${month} - ${d.year}<br>
                ${totalTemp}°C<br>
                ${differenceTemp}°C
            </div>
            `);

                tooltip.attr("data-year", d.year);

                tooltip.style("top", event.pageY - legendHeight * 1.6 + "px");
                tooltip.style("left", event.pageX - 80 + "px");
            })
            .on("mouseout", () => tooltip.classed("show", false));
    })
    .catch((error) => console.error(error));

function formatToMonthName(data) {
    const date = d3.timeParse("%m")(data);
    return d3.timeFormat("%B")(date);
}

// Copyright 2021, Observable Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/color-legend
function Legend(
    color,
    {
        title,
        tickSize = 6,
        width = 320,
        height = 44 + tickSize,
        marginTop = 18,
        marginRight = 0,
        marginBottom = 16 + tickSize,
        marginLeft = 0,
        ticks = width / 64,
        tickFormat,
        tickValues,
    } = {}
) {
    function ramp(color, n = 256) {
        const canvas = document.createElement("canvas");
        canvas.width = n;
        canvas.height = 1;
        const context = canvas.getContext("2d");
        for (let i = 0; i < n; ++i) {
            context.fillStyle = color(i / (n - 1));
            context.fillRect(i, 0, 1, 1);
        }
        return canvas;
    }

    const svg = d3
        .select(".chart")
        .append("svg")
        .attr("id", "legend")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("overflow", "visible")
        .style("display", "block");

    let tickAdjust = (g) =>
        g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
    let x;

    // Continuous
    // if (color.interpolate) {
    //     const n = Math.min(color.domain().length, color.range().length);

    //     x = color
    //         .copy()
    //         .rangeRound(
    //             d3.quantize(d3.interpolate(marginLeft, width - marginRight), n)
    //         );

    //     svg.append("image")
    //         .attr("x", marginLeft)
    //         .attr("y", marginTop)
    //         .attr("width", width - marginLeft - marginRight)
    //         .attr("height", height - marginTop - marginBottom)
    //         .attr("preserveAspectRatio", "none")
    //         .attr(
    //             "xlink:href",
    //             ramp(
    //                 color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))
    //             ).toDataURL()
    //         );
    // }

    // // Sequential
    // else if (color.interpolator) {
    //     x = Object.assign(
    //         color
    //             .copy()
    //             .interpolator(
    //                 d3.interpolateRound(marginLeft, width - marginRight)
    //             ),
    //         {
    //             range() {
    //                 return [marginLeft, width - marginRight];
    //             },
    //         }
    //     );

    //     svg.append("image")
    //         .attr("x", marginLeft)
    //         .attr("y", marginTop)
    //         .attr("width", width - marginLeft - marginRight)
    //         .attr("height", height - marginTop - marginBottom)
    //         .attr("preserveAspectRatio", "none")
    //         .attr("xlink:href", ramp(color.interpolator()).toDataURL());

    //     // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
    //     if (!x.ticks) {
    //         if (tickValues === undefined) {
    //             const n = Math.round(ticks + 1);
    //             tickValues = d3
    //                 .range(n)
    //                 .map((i) => d3.quantile(color.domain(), i / (n - 1)));
    //         }
    //         if (typeof tickFormat !== "function") {
    //             tickFormat = d3.format(
    //                 tickFormat === undefined ? ",f" : tickFormat
    //             );
    //         }
    //     }
    // }

    // // Threshold
    // else if (color.invertExtent) {
    const thresholds = color.thresholds
        ? color.thresholds() // scaleQuantize
        : color.quantiles
        ? color.quantiles() // scaleQuantile
        : color.domain(); // scaleThreshold

    const thresholdFormat =
        tickFormat === undefined
            ? (d) => d
            : typeof tickFormat === "string"
            ? d3.format(tickFormat)
            : tickFormat;

    x = d3
        .scaleLinear()
        .domain([-1, color.range().length - 1])
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
        .selectAll("rect")
        .data(color.range())
        .join("rect")
        .attr("x", (d, i) => x(i - 1))
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", (d) => d);

    tickValues = d3.range(thresholds.length);
    tickFormat = (i) => thresholdFormat(thresholds[i], i);
    // }

    // // Ordinal
    // else {
    //     x = d3
    //         .scaleBand()
    //         .domain(color.domain())
    //         .rangeRound([marginLeft, width - marginRight]);

    //     svg.append("g")
    //         .selectAll("rect")
    //         .data(color.domain())
    //         .join("rect")
    //         .attr("x", x)
    //         .attr("y", marginTop)
    //         .attr("width", Math.max(0, x.bandwidth() - 1))
    //         .attr("height", height - marginTop - marginBottom)
    //         .attr("fill", color);

    //     tickAdjust = () => {};
    // }

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(
            d3
                .axisBottom(x)
                .ticks(
                    ticks,
                    typeof tickFormat === "string" ? tickFormat : undefined
                )
                .tickFormat(
                    typeof tickFormat === "function" ? tickFormat : undefined
                )
                .tickSize(tickSize)
                .tickValues(tickValues)
        )
        .call(tickAdjust)
        .call((g) => g.select(".domain").remove())
        .call((g) =>
            g
                .append("text")
                .attr("x", marginLeft)
                .attr("y", marginTop + marginBottom - height - 6)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .attr("class", "title")
                .text(title)
        );

    return svg.node();
}
