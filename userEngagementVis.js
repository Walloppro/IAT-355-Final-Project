const RED   = "#E7000B";
const GREY  = "#4b4b4b";
const LGREY = "#969696";

const GENRES  = ["Music","Entertainment","Gaming","News","Sports","Education"];
const PALETTE = ["#E7000B","#1414e2","#2b962a","#ff9900","#800080","#008080"];

const vis1 = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  data: {
    url: "dataset/US_youtube_trending_data.csv"
  },
  width: "container",
  height: 340,
  description: "Average Likes and Comments per Trending Video by Quarter",
  transform: [
    { 
      calculate: "toDate(datum.publishedAt)",
      as: "date" 
    },
    { 
      timeUnit: "yearquarter", 
      field: "date", as: "quarter" 
    },
    { 
      filter: "datum.categoryId == '24' || datum.categoryId == '20' || datum.categoryId == '10' || datum.categoryId == '27' || datum.categoryId == '17' || datum.categoryId == '25'" 
    },
    { 
      fold: ["likes", "comment_count"],
      as: ["rawMetric", "value"] 
    },
    { 
      calculate: "datum.rawMetric === 'likes' ? 'Avg Likes' : 'Avg Comments'", 
      as: "metric" 
    },
  ],
  mark: { type: "line", point: true, strokeWidth: 2.5 },
  encoding: {
    x: {
      field: "quarter", type: "temporal", title: "Quarter",
      axis: { labelAngle: -40, labelFontSize: 10, format: "%Y Q%q" }
    },
    y: {
      aggregate: "mean", field: "value", type: "quantitative",
      title: "Average Count per Video",
      axis: { format: ",.0f" }
    },
    color: {
      field: "metric", type: "nominal", title: "Metric",
      scale: { domain: ["Avg Likes", "Avg Comments"], range: [RED, GREY] }
    },
    tooltip: [
      { field: "quarter", type: "temporal", title: "Quarter", format: "%Y Q%q" },
      { field: "metric", type: "nominal", title: "Metric" },
      { 
        aggregate: "mean",
        field: "value", 
        type: "quantitative", 
        title: "Avg Count", 
        format: ",.0f" 
      }
    ]
  }
}

const vis2 = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 400,
  description: "Average Likes vs Average Comments per Genre",
  data: {
    url: "dataset/US_youtube_trending_data.csv"
  },
  transform: [
    { filter: "datum.categoryId == '24' || datum.categoryId == '20' || datum.categoryId == '10' || datum.categoryId == '27' || datum.categoryId == '17' || datum.categoryId == '25'" },
    {
      calculate:
        "datum.categoryId == '24' ? 'Entertainment' :" +
        "datum.categoryId == '20' ? 'Gaming' :" +
        "datum.categoryId == '10' ? 'Music' :" +
        "datum.categoryId == '27' ? 'Education' :" +
        "datum.categoryId == '17' ? 'Sports' :" +
        "'News'",
      as: "genre"
    },
    {
      aggregate: [
        { op: "mean", field: "likes", as: "avgLikes" },
        { op: "mean", field: "comment_count", as: "avgComments" }
      ],
      groupby: ["genre"]
    }
  ],
  layer: [
    {
      mark: { type: "point", filled: true, size: 160, opacity: 0.9 },
      encoding: {
        x: { 
          field: "avgLikes",
          type: "quantitative",
          title: "Average Likes per Video",
          axis: { format: ",.0f" }
        },
        y: {
          field: "avgComments",
          type: "quantitative",
          title: "Average Comments per Video",
          axis: { format: ",.0f" }
        },
        color: {
          field: "genre",
          type: "nominal",
          scale: { domain: GENRES, range: PALETTE }
        },
        tooltip: [
          { field: "genre", title: "Genre" },
          { field: "avgLikes", title: "Avg Likes", format: ",.0f" },
          { field: "avgComments", title: "Avg Comments", format: ",.0f" }
        ]
      }
    },
    {
      mark: { type: "line", color: LGREY, strokeDash: [6, 4], strokeWidth: 1.8, opacity: 0.7 },
      transform: [{ regression: "avgComments", on: "avgLikes" }],
      encoding: {
        x: { 
          field: "avgLikes",
          type: "quantitative"
        },
        y: {
          field: "avgComments",
          type: "quantitative"
        }
      }
    },
    {
      mark: { type: "text", dy: -12, fontSize: 11 },
      encoding: {
        x: { 
          field: "avgLikes", 
          type: "quantitative" 
        },
        y: {
          field: "avgComments",
          type: "quantitative"
        },
        text: {
          field: "genre",
          type: "nominal"
        },
        color: { value: GREY }
      }
    }
  ]
}

const vis3 = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 300,
  description: "Total User Engagement by Genre (Avg Likes + Avg Comments)",
  data: {
    url: "dataset/US_youtube_trending_data.csv"
  },
  transform: [
    { filter: "datum.categoryId == '24' || datum.categoryId == '20' || datum.categoryId == '10' || datum.categoryId == '27' || datum.categoryId == '17' || datum.categoryId == '25'" },
    {
      calculate:
        "datum.categoryId == '24' ? 'Entertainment' :" +
        "datum.categoryId == '20' ? 'Gaming' :" +
        "datum.categoryId == '10' ? 'Music' :" +
        "datum.categoryId == '27' ? 'Education' :" +
        "datum.categoryId == '17' ? 'Sports' :" +
        "'News'",
      as: "genre"
    },
    {
      aggregate: [
        { op: "mean", field: "likes", as: "avgLikes" },
        { op: "mean", field: "comment_count", as: "avgComments" }
      ],
      groupby: ["genre"]
    },
    {
      fold: ["avgLikes", "avgComments"],
      as: ["engType", "value"]
    },
    {
      calculate: "datum.engType === 'avgLikes' ? 'Avg Likes' : 'Avg Comments'",
      as: "Engagement Type" }
  ],
  mark: { type: "bar", cornerRadiusTopRight: 3, cornerRadiusBottomRight: 3 },
  encoding: {
    y: {
      field: "genre", type: "nominal", title: null,
      sort: { field: "value", op: "sum", order: "descending" }
    },
    x: {
      field: "value", type: "quantitative",
      title: "Average Count per Video",
      axis: { format: ",.0f" },
      stack: "zero"
    },
    color: {
      field: "Engagement Type", type: "nominal", title: "Engagement Type",
      scale: { domain: ["Avg Likes", "Avg Comments"], range: [RED, GREY] }
    },
    order: { field: "Engagement Type", sort: "descending" },
    tooltip: [
      { field: "genre", title: "Genre" },
      { field: "Engagement Type", title: "Type"  },
      { field: "value", title: "Avg Count", format: ",.0f" }
    ]
  }
}

const vis4 = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 300,
  description: "Average Engagement Rate by Year",
  data: {
    url: "dataset/US_youtube_trending_data.csv"
  },
  transform: [
    { calculate: "datum.view_count > 0 ? (datum.likes + datum.comment_count) / datum.view_count : 0", as: "engagementRate" },
    {
      calculate: "toDate(datum.publishedAt)",
      as: "date"
    },
    {
      timeUnit: "year",
      field: "date",
      as: "year"
    },
    {
      aggregate: [{ op: "mean", field: "engagementRate", as: "avgRate" }],
      groupby: ["year"]
    }
  ],
  layer: [
    {
      mark: { type: "area", color: RED, opacity: 0.12 },
      encoding: {
        x: { field: "year", type: "temporal", title: "Year", axis: { format: "%Y" } },
        y: { field: "avgRate", type: "quantitative", title: "Engagement Rate (%)", scale: { zero: false } }
      }
    },
    {
      mark: { type: "line", color: RED, strokeWidth: 2.8, point: { filled: true, color: RED, size: 80 } },
      encoding: {
        x: {
          field: "year",
          type: "temporal",
          axis: { format: "%Y" }
        },
        y: {
          field: "avgRate",
          type: "quantitative",
          scale: { zero: false }
        },
        tooltip: [
          { field: "year", type: "temporal", title: "Year", format: "%Y" },
          { field: "avgRate", type: "quantitative", title: "Engagement Rate", format: ".2f" }
        ]
      }
    },
    {
      mark: { type: "text", dy: -14, fontSize: 12, fontWeight: "bold", color: RED },
      encoding: {
        x: {
          field: "year",
          type: "temporal"
        },
        y: {
          field: "avgRate",
          type: "quantitative"
        },
        text: {
          field: "avgRate",
          type: "quantitative",
          format: ".2f"
        }
      }
    }
  ]
}

vegaEmbed("#vis_q1", vis1);
vegaEmbed("#vis_q2", vis2);
vegaEmbed("#vis_q3", vis3);
vegaEmbed("#vis_q4", vis4);

