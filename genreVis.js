d3.csv("dataset/US_youtube_trending_data.csv").then(data => {
    console.log("Total rows:", data.length);
    console.log("First row:", data[0]);
    console.log("Sample categoryIds:", data.slice(0, 5).map(d => d.categoryId));
});

const vis1 = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  data: {
    url: "dataset/US_youtube_trending_data.csv"
  },
  width:'container', 
  height: 300,
  description: "Average Views by Genre Over Time",
  transform: [
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
            filter: "datum.categoryId == '24' || datum.categoryId == '20' || datum.categoryId == '10' || datum.categoryId == '27' || datum.categoryId == '17' || datum.categoryId == '25'"
        },
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
    ],
    mark: {
        type: "line",
        point: true
    },
    encoding: {
        x: {
            field: "year",
            type: "temporal",
            title: "Year"
        },
        y: {
            aggregate: "mean",
            field: "view_count",
            type: "quantitative",
            title: "Average Views"
        },
        color: {
            field: "genre",
            type: "nominal",
            title: "Genre"
        },
        tooltip: [
            { field: "genre", type: "nominal" },
            { field: "year", type: "temporal" },
            { aggregate: "mean", field: "view_count", type: "quantitative" }
        ]
    }
};

vegaEmbed("#vis1", vis1);

const validCategories = ['24','20','10','27','17','25'];

async function loadRanking() {
    const data = await d3.csv("dataset/US_youtube_trending_data.csv");

    const selected = data.filter(d => validCategories.includes(d.categoryId));

    const genreMap = {
        '24': 'Entertainment',
        '20': 'Gaming',
        '10': 'Music',
        '27': 'Education',
        '17': 'Sports',
        '25': 'News'
    };

    const totals = {};

    selected.forEach(d => {
        const genre = genreMap[d.categoryId];
        const views = +d.view_count;

        if (!totals[genre]) totals[genre] = 0;
        totals[genre] += views;
    });

    const sorted = Object.entries(totals)
        .map(([genre, views]) => ({ genre, views }))
        .sort((a, b) => b.views - a.views);

    const format = (num) => {
        if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
        if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
        return num;
    };

    const container = document.getElementById("ranking-card");

    container.innerHTML = `
        <div class="ranking-title">Ranking</div>
        <div class="ranking-subtitle">By view counts</div>
        ${sorted.map((d, i) => `
            <div class="ranking-item">
                <div class="ranking-left">
                    <div class="rank-number">#${i + 1}</div>
                    <div class="genre-name">${d.genre}</div>
                </div>
                <div class="view-value">${format(d.views)}</div>
            </div>
        `).join("")}
    `;
}

loadRanking();

const vis2 = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: {
        url: "dataset/US_youtube_trending_data.csv"
    },
    width: "container",
    height: 340,
    description: "Number of Trending Videos by Genre",
    transform: [
        {
            filter: "datum.categoryId == '24' || datum.categoryId == '20' || datum.categoryId == '10' || datum.categoryId == '27' || datum.categoryId == '17' || datum.categoryId == '25'"
        },
        {
            calculate:
                "datum.categoryId == '24' ? 'Entertainment' :" +
                "datum.categoryId == '20' ? 'Gaming' :" +
                "datum.categoryId == '10' ? 'Music' :" +
                "datum.categoryId == '27' ? 'Education' :" +
                "datum.categoryId == '17' ? 'Sports' :" +
                "'News'",
            as: "genre"
        }
    ],
    mark: {
        type: "bar",
        cornerRadiusEnd: 4
    },
    encoding: {
        y: {
            field: "genre",
            type: "nominal",
            sort: "-x",
            title: "Genre"
        },
        x: {
            aggregate: "count",
            type: "quantitative",
            title: "Number of Trending Videos"
        },

        color: {
            field: "genre",
            type: "nominal",
            legend: null
        },

        tooltip: [
            { field: "genre", type: "nominal" },
            { aggregate: "count", type: "quantitative", title: "Video Count" }
        ]
    }
};

vegaEmbed("#vis2", vis2);