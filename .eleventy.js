const path = require("path");
const fs = require("fs");
const navigationPlugin = require("@11ty/eleventy-navigation");

// Normalize an Eleventy inputPath to always look like "content/x/y.md",
function normalizePath(p) {
  return p.replace(/\\/g, "/").replace(/^\.\//, "");
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(navigationPlugin);

  eleventyConfig.addPassthroughCopy("content/**/*.{css,js,png,jpg,jpeg,gif,svg,mp3,mp4,webm,woff,woff2,ttf}");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addWatchTarget("./content/");
  eleventyConfig.addWatchTarget("./css/");

  eleventyConfig.addFilter("titleFromPath", function (inputPath) {
    const basename = path.basename(inputPath, ".md");
    return basename
      .replace(/^\d+-/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase());
  });

  eleventyConfig.addFilter("formatDate", function (date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  });

  eleventyConfig.addFilter("htmlDateString", function (date) {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("limit", function (arr, n) {
    if (!arr || !Array.isArray(arr)) return [];
    return arr.slice(0, n);
  });

  eleventyConfig.addFilter("isSeriesParent", function (allPages, parentKey) {
    if (!parentKey) return false;
    const parentPage = allPages.find(p => p.data.eleventyNavigation && p.data.eleventyNavigation.key === parentKey);
    return !!(parentPage && parentPage.data.type === "series");
  });

  eleventyConfig.addGlobalData("genres", () => {
    const contentDir = path.join(__dirname, "content");
    if (!fs.existsSync(contentDir)) return [];
    return fs.readdirSync(contentDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        name: dirent.name,
        title: dirent.name.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        url: "/" + dirent.name + "/"
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  eleventyConfig.addCollection("allContent", function (collectionApi) {
    return collectionApi.getAll().filter(item => {
      return normalizePath(item.inputPath).startsWith("content/");
    });
  });

  eleventyConfig.addCollection("allPosts", function (collectionApi) {
    return collectionApi
      .getAll()
      .filter(item => {
        const p = normalizePath(item.inputPath);
        return (
          p.startsWith("content/") &&
          p.endsWith(".md") &&
          path.basename(p) !== "index.md"
        );
      })
      .sort((a, b) => {
        const dateA = a.data.date ? new Date(a.data.date) : new Date(0);
        const dateB = b.data.date ? new Date(b.data.date) : new Date(0);
        return dateB - dateA;
      });
  });

  eleventyConfig.addGlobalData("cssFiles", () => {
    const cssDir = path.join(__dirname, "css/other");
    if (!fs.existsSync(cssDir)) return [];

    return fs.readdirSync(cssDir, { withFileTypes: true })
      .filter(dirent => dirent.isFile() && dirent.name.endsWith('.css'))
      .map(dirent => `/css/other/${dirent.name}`)
      .sort((a, b) => a.localeCompare(b));
  });

  eleventyConfig.addFilter("findNavIndex", function (siblings, key) {
    return siblings.findIndex(s => s.key === key);
  });

  return {
    dir: {
      input: "content",
      output: "_site",
      includes: "../_includes",
      data: "../_data"
    },
    templateFormats: ["md", "html", "njk", "css", "js", "png", "jpg", "jpeg", "gif", "svg", "mp3", "mp4", "webm", "woff", "woff2", "ttf"],
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk"
  };
};