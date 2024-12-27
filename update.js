import { Octokit } from '@octokit/rest';
import { Buffer } from 'node:buffer';
import fs from 'fs';
import path from 'path';

const github = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const release = await github.rest.repos.getReleaseByTag({
  owner: 'catppuccin',
  repo: 'userstyles',
  tag: 'all-userstyles-export',
})
const id = release.data.assets.find((asset) => asset.name === 'import.json').id;
const url = `https://api.github.com/repos/catppuccin/userstyles/releases/assets/${id}`;

fetch(url, {
  method: "GET",
  headers: {
    "Accept": "application/octet-stream"
  }
})
  .then(response => response.arrayBuffer())
  .then(buffer => {
    const outpath = path.join(process.cwd(), "import.json");
    fs.writeFileSync(outpath, Buffer.from(buffer));
  });
