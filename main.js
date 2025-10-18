// --- Config ---
const CONTENT_DIR = 'content';
const INDEX_FILE = `${CONTENT_DIR}/index.json`;

// --- Elements ---
const sidebar = document.getElementById('sidebar');
const contentEl = document.getElementById('content');
const breadcrumbsEl = document.getElementById('breadcrumbs');

// --- Helper: Render Tree ---
function renderTree(node, basePath = '') {
  const ul = document.createElement('ul');
  ul.classList.add('pl-2', 'space-y-1');
  for (const [name, value] of Object.entries(node)) {
    const li = document.createElement('li');
    if (typeof value === 'string') {
      // File
      const a = document.createElement('a');
      a.href = '#/' + basePath + value.replace(/\.md$/, '');
      a.textContent = name.replace(/\.md$/, '');
      a.className = 'text-blue-600 hover:underline block';
      li.appendChild(a);
    } else {
      // Folder
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = name;
      summary.className = 'font-semibold cursor-pointer';
      details.appendChild(summary);
      details.appendChild(renderTree(value, `${basePath}${name}/`));
      li.appendChild(details);
    }
    ul.appendChild(li);
  }
  return ul;
}

// --- Helper: Build Breadcrumbs ---
function renderBreadcrumbs(path) {
  const parts = path.split('/').filter(Boolean);
  breadcrumbsEl.innerHTML = parts.map((p, i) => {
    const subPath = parts.slice(0, i + 1).join('/');
    return `<a href="#/${subPath}" class="text-blue-600 hover:underline">${p}</a>`;
  }).join(' / ');
}

// --- Helper: Load Markdown with Caching ---
async function loadMarkdown(filePath) {
  const cacheKey = `mdcache:${filePath}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    return cached;
  }
  const res = await fetch(filePath);
  if (!res.ok) throw new Error(`Failed to load ${filePath}`);
  const text = await res.text();
  const html = marked.parse(text);
  localStorage.setItem(cacheKey, html);
  return html;
}

// --- Router ---
async function router() {
  const hash = window.location.hash.slice(2) || 'index';
  const filePath = `${CONTENT_DIR}/${hash}.md`;
  renderBreadcrumbs(hash);
  try {
    const html = await loadMarkdown(filePath);
    contentEl.innerHTML = html;
  } catch (e) {
    contentEl.innerHTML = `<p class="text-red-600">404: File not found</p>`;
  }
}

// --- Init ---
async function init() {
  const index = await fetch(INDEX_FILE).then(r => r.json());
  sidebar.appendChild(renderTree(index));
  window.addEventListener('hashchange', router);
  router();
}

init();
