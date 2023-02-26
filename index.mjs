import fetch from "node-fetch";
import fs from "fs";

const API_TOKEN = fs.readFileSync(".ph-token", "utf8").trim();
const API_BASE_URL = "https://api.producthunt.com/v1";

async function main() {
  const html = [
    "<DOCTYPE html>",
    "<html>",
    "<head>",
    "<title>Product Hunt</title>",
    '<link rel="stylesheet" href="./style.css" />',
    `<link href="./style.css" rel="stylesheet" />`,
    "</head>",
  ];
  const productHtml = [];

  try {
    // Get current date
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 72);

    while (currentDate < new Date()) {
      const year = currentDate.getUTCFullYear();
      const month = currentDate.getUTCMonth() + 1;
      const url = `${API_BASE_URL}/posts/all?sort_by=votes_count&order=desc&search[featured_month]=${month}&search[featured_year]=${year}&search[topic]=developer-tools`;
      console.log(">", url);
      // Make an API request to get the best products of the month
      const resp = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });
      const data = await resp.json();
      // console.log(
      //   data.posts.map((p) => ({ name: p.name, votes: p.votes_count }))
      // );

      const product = data.posts[0];
      console.log(`${product.name}: ${product.votes_count}`);

      productHtml.push(`<div class="product">
          <img src="${product.thumbnail.image_url}" />
          <a class="title" href="${product.redirect_url}">${product.name}</a>
          <div class="tagline">${product.tagline}</div>
          <div class="votes">Votes: ${product.votes_count}</div>
          <div class="day">Month: ${year}-${month}</div>
          <div class="tags">Tags: ${product.topics
            .map((t) => t.name)
            .join(", ")}</div>
        </div>`);

      // Move to the next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  } catch (error) {
    console.error("Error:", error);
  }

  fs.writeFileSync("index.html", [...html, ...productHtml.reverse()].join("\n"));
}

main();
