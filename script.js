let accountsData = {};
let buildsData = {};
let avatarMap = {};

async function loadData() {
    const [accRes, buildRes, avatarRes] = await Promise.all([
        fetch('account.json'),
        fetch('builds.json'),
        fetch('avatarMapping.json')
    ]);
    accountsData = await accRes.json();
    buildsData = await buildRes.json();
    avatarMap = await avatarRes.json();
    renderApp();
}

function getAvatar(name) {
    const firstLetter = name.charAt(0);
    const bucket = avatarMap[firstLetter];
    if (bucket && bucket[name]) return bucket[name];
    return '';
}

function getElementIcon(element) {
    const icons = avatarMap.Elemental_Icons || {};
    return icons[element] || '';
}

function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        alert('Build code copied to clipboard!');
    }).catch(() => {
        alert('Failed to copy code.');
    });
}

function buildCardHtml(buildName) {
    const build = buildsData[buildName];
    if (!build) return '';

    const mainAvatar = getAvatar(build.main);
    const supportsHtml = build.supports.map(s => {
        const url = getAvatar(s);
        return `<img src="${url}" alt="${s}" title="${s}" class="w-10 h-10 rounded-full border border-white object-cover">`;
    }).join('');

    const elementsHtml = build.elements.map(e => {
        const url = getElementIcon(e);
        return url
            ? `<img src="${url}" alt="${e}" title="${e}" class="w-6 h-6 object-contain">`
            : `<span class="text-xs text-white bg-gray-700 px-1 rounded">${e}</span>`;
    }).join('');

    return `
        <div class="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
            <div class="flex items-start gap-3">
                <div class="flex flex-col items-center gap-1">
                    <p class="text-xs text-white font-semibold">Main</p>
                    <img src="${mainAvatar}" alt="${build.main}" title="${build.main}" class="w-14 h-14 rounded-full border-2 border-red-400 object-cover">
                    <span class="text-xs text-white">${build.main}</span>
                </div>
                <div class="flex flex-col gap-1 flex-1">
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-white font-semibold">Supports:</span>
                        <div class="flex gap-1">${supportsHtml}</div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-white font-semibold">Elements:</span>
                        <div class="flex gap-1">${elementsHtml}</div>
                    </div>
                    <button onclick="copyCode('${build.code}')" class="mt-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded transition">
                        Copy Code
                    </button>
                </div>
            </div>
        </div>
    `;
}

function accountCardHtml(accountKey, account) {
    const avatarUrl = getAvatar(account.avatarURL);
    const bestElementsHtml = account.elementSpecialty.map(e => {
        const url = getElementIcon(e);
        return url
            ? `<img src="${url}" alt="${e}" title="${e}" class="w-5 h-5 object-contain">`
            : `<span class="text-xs text-white">${e}</span>`;
    }).join('');

    const buildsHtml = account.builds.map(b => buildCardHtml(b)).join('');

    return `
        <div class="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl">
            <div class="flex items-center gap-4 mb-4 pb-3 border-b border-white/20">
                <img src="${avatarUrl}" alt="${account.username}" class="w-16 h-16 rounded-full border-2 border-cyan-300 object-cover">
                <div class="flex-1">
                    <p class="text-lg font-bold text-white">${account.username}</p>
                    <p class="text-sm text-cyan-200">UID: ${account.ingameID}</p>
                </div>
                <div class="flex flex-col items-end gap-1">
                    <span class="text-xs text-white/70">Best Elements</span>
                    <div class="flex gap-1">${bestElementsHtml}</div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                ${buildsHtml}
            </div>
        </div>
    `;
}

function renderApp() {
    const app = document.getElementById('app');
    const cards = Object.entries(accountsData).map(([key, acc]) => accountCardHtml(key, acc)).join('');
    app.innerHTML = cards;
}

loadData();