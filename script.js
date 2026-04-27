let accountsData = {};
let buildsData = {};
let avatarMap = {};
let cardIndex = 0;

async function loadData() {
    try {
        const [accRes, buildRes, avatarRes] = await Promise.all([
            fetch('account.json'),
            fetch('builds.json'),
            fetch('avatarMapping.json')
        ]);
        accountsData = await accRes.json();
        buildsData = await buildRes.json();
        avatarMap = await avatarRes.json();
        
        document.getElementById('loading-screen').style.display = 'none';
        renderApp();
    } catch (error) {
        document.getElementById('loading-screen').innerHTML = '<p class="text-red-400">Failed to load data. Please refresh.</p>';
    }
}

function getAvatar(name) {
    const elements = ['Lux', 'Ignis', 'Aqua', 'Umbra', 'Ventus', 'Terra'];
    for (const el of elements) {
        const bucket = avatarMap[el];
        if (bucket && bucket[name]) return bucket[name];
    }
    return '';
}

function getCharacterElement(name) {
    const elements = ['Lux', 'Ignis', 'Aqua', 'Umbra', 'Ventus', 'Terra'];
    for (const el of elements) {
        const bucket = avatarMap[el];
        if (bucket && bucket[name]) return el;
    }
    return '';
}

function getElementIcon(element) {
    const icons = avatarMap.Elemental_Icons || {};
    return icons[element] || '';
}

function getElementColor(element) {
    const colors = avatarMap.Elemental_Colors || {};
    return colors[element] || '#ffffff';
}

let copiedBuildCode = '';
function copyCode(code, btn) {
    navigator.clipboard.writeText(code).then(() => {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.remove('bg-cyan-600', 'hover:bg-cyan-500');
        btn.classList.add('bg-green-500');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('bg-green-500');
            btn.classList.add('bg-cyan-600', 'hover:bg-cyan-500');
        }, 1500);
    }).catch(() => {
        alert('Failed to copy code.');
    });
}

function buildCardHtml(buildName, index) {
    const build = buildsData[buildName];
    if (!build) return '';

    const mainElement = getCharacterElement(build.main);
    const mainColor = getElementColor(mainElement);
    const mainAvatar = getAvatar(build.main);
    const supportsHtml = build.supports.map(s => {
        const url = getAvatar(s);
        const sEl = getCharacterElement(s);
        const sColor = getElementColor(sEl);
        return `<img src="${url}" alt="${s}" title="${s}" class="w-10 h-10 rounded-full border-2 object-cover support-icon cursor-pointer avatar-ring" style="--ring-color: ${sColor}33; border-color: ${sColor}66;" onmouseenter="showCharacterModal('${s}', event)" onmouseleave="hideCharacterModal()">`;
    }).join('');

    const elementsHtml = build.elements.map(e => {
        const url = getElementIcon(e);
        const color = getElementColor(e);
        return url
            ? `<img src="${url}" alt="${e}" title="${e}" class="w-6 h-6 object-contain element-badge cursor-pointer" style="filter: drop-shadow(0 0 4px ${color}); border-radius: 4px; padding: 1px;">`
            : `<span class="text-xs text-white px-2 py-0.5 rounded font-semibold" style="background: ${color}33; border: 1px solid ${color};">${e}</span>`;
    }).join('');

    const primaryElementColor = getElementColor(build.elements[0] || '');

    const delay = (index % 12) * 0.1;

    return `
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border build-card" style="animation-delay: ${delay}s; border-color: ${primaryElementColor}33; box-shadow: 0 4px 20px ${primaryElementColor}11;">
            <div class="flex items-start gap-3">
                <div class="flex flex-col items-center gap-2">
                    <p class="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">Main</p>
                    <div class="relative">
                        <img src="${mainAvatar}" alt="${build.main}" title="${build.main}" class="w-16 h-16 rounded-full border-2 object-cover avatar-ring cursor-pointer" style="--ring-color: ${mainColor}; border-color: ${mainColor};" onmouseenter="showCharacterModal('${build.main}', event)" onmouseleave="hideCharacterModal()">
                    </div>
                    <span class="text-xs text-white font-medium">${build.main}</span>
                </div>
                <div class="flex flex-col gap-2 flex-1">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">Supports:</span>
                        <div class="flex gap-2">${supportsHtml}</div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">Elements:</span>
                        <div class="flex gap-2">${elementsHtml}</div>
                    </div>
                    <button onclick="copyCode('${build.code}', this)" class="copy-btn mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded transition-all">
                        Copy Code
                    </button>
                </div>
            </div>
        </div>
    `;
}

function showCharacterModal(name, event) {
    const modal = document.getElementById('character-modal');
    const element = getCharacterElement(name);
    const color = getElementColor(element);
    const iconUrl = getElementIcon(element);
    const avatarUrl = getAvatar(name);

    modal.innerHTML = `
        <div class="modal-content" style="--modal-accent: ${color};">
            <img src="${avatarUrl}" alt="${name}" class="modal-avatar">
            <div class="modal-info">
                <h3 class="modal-name">${normalizeName(name)}</h3>
                <div class="modal-element">
                    <img src="${iconUrl}" alt="${element}" class="modal-element-icon">
                    <span style="color: ${color};">${element}</span>
                </div>
            </div>
        </div>
    `;

    const x = event.clientX;
    const y = event.clientY;
    const modalWidth = 220;
    const modalHeight = 280;
    let left = x + 20;
    let top = y - modalHeight / 2;

    if (left + modalWidth > window.innerWidth) left = x - modalWidth - 20;
    if (top < 10) top = 10;
    if (top + modalHeight > window.innerHeight) top = window.innerHeight - modalHeight - 10;

    modal.style.left = left + 'px';
    modal.style.top = top + 'px';
    modal.classList.add('active');
}

function hideCharacterModal() {
    document.getElementById('character-modal').classList.remove('active');
}

function copyText(text, icon) {
    navigator.clipboard.writeText(text).then(() => {
        icon.classList.add('copied');
        setTimeout(() => {
            icon.classList.remove('copied');
        }, 1500);
    }).catch(() => {
        alert('Failed to copy text.');
    });
}

function normalizeName(name) {
    const withSpaces = name.replace(/([a-z])([A-Z])/g, '$1 $2');
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function accountCardHtml(accountKey, account, index) {
    const avatarUrl = getAvatar(account.avatarURL);
    const bestElementsHtml = account.elementSpecialty.map(e => {
        const url = getElementIcon(e);
        const color = getElementColor(e);
        return url
            ? `<div class="relative group"><img src="${url}" alt="${e}" title="${e}" class="w-6 h-6 object-contain" style="filter: drop-shadow(0 0 6px ${color});"><div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style="background: ${color};"></div></div>`
            : `<span class="text-xs text-white px-2 py-0.5 rounded font-semibold" style="background: ${color}33; border: 1px solid ${color};">${e}</span>`;
    }).join('');

    const buildsHtml = account.builds.map((b, i) => buildCardHtml(b, cardIndex++)).join('');

    const delay = index * 0.2;

    return `
        <div class="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl account-card" style="animation-delay: ${delay}s">
            <div class="flex items-center gap-5 mb-5 pb-4 border-b border-white/10">
                <div class="relative">
                    <img src="${avatarUrl}" alt="${account.username}" class="w-20 h-20 rounded-full border-2 object-cover avatar-ring float-animation cursor-pointer" style="--ring-color: ${getElementColor(getCharacterElement(account.avatarURL))}; border-color: ${getElementColor(getCharacterElement(account.avatarURL))};" onmouseenter="showCharacterModal('${account.avatarURL}', event)" onmouseleave="hideCharacterModal()">
                </div>
                <div class="flex-1">
                    <h2 class="text-2xl font-bold text-white glow-text">${account.username} <span class="text-xs text-white/50">${accountKey}</span></h2>
                    <p class="text-sm text-cyan-300">UID: ${account.ingameID}</p>
                    <i class="fa-regular fa-copy copy-icon text-white/40 hover:text-cyan-300 text-sm ml-1" onclick="copyText('${account.ingameID}', this)"></i>
                </div>
                <div class="flex flex-col items-end gap-2">
                    <span class="text-[10px] text-white/50 uppercase tracking-wider">Main Elements</span>
                    <div class="flex gap-2">${bestElementsHtml}</div>
                    ${account.recentPull ? `
                        <div class="mt-2 flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                            <span class="text-xs text-yellow-300">Recently Pulled:</span>
                            <img src="${getAvatar(account.recentPull.character)}" alt="${account.recentPull.character}" class="w-6 h-6 rounded-full border cursor-pointer avatar-ring" style="--ring-color: ${getElementColor(getCharacterElement(account.recentPull.character))}; border-color: ${getElementColor(getCharacterElement(account.recentPull.character))};" onmouseenter="showCharacterModal('${account.recentPull.character}', event)" onmouseleave="hideCharacterModal()">
                            <span class="text-xs text-white font-semibold">${normalizeName(account.recentPull.character)}</span>
                            <span class="text-[10px] text-white/40">(${account.recentPull.date})</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                ${buildsHtml}
            </div>
        </div>
    `;
}

function renderApp() {
    const app = document.getElementById('app');
    const cards = Object.entries(accountsData).map(([key, acc], i) => accountCardHtml(key, acc, i)).join('');
    app.innerHTML = cards;
}

loadData();