async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Maps Scryfall mana symbols to your image asset filenames
const manaSymbolMap = {
    '{W}': 'plains',
    '{U}': 'island',
    '{B}': 'swamp',
    '{R}': 'mountain',
    '{G}': 'forest'
};

function renderManaCost(manaCost) {
    if (!manaCost) return '';

    return manaCost.match(/{[^}]+}/g).map(symbol => {
        const filename = manaSymbolMap[symbol];
        if (filename) {
            return `<img src="/assets/images/mtg/${filename}.svg" alt="${symbol}" width="24" style="margin: 0 2px;">`;
        }

        const genericMatch = symbol.match(/{(\d{1,2})}/);
        if (genericMatch) {
            const num = genericMatch[1];
            return `
            <span class="fa-stack" title="{1}" style="width: 1.2em; height: 1.2em; line-height: 1.2em;">
            <i class="fas fa-circle fa-stack-1x text-light" style="transform: scale(1.5);"></i>
            <strong class="fa-stack-1x" style="color: black; font-size: 1.5em;">${num}</strong>
            </span>
        `;
        }

        if (symbol === '{X}') {
            return `
        <span class="fa-stack fa-sm" title="X" style="width: 1.5em; height: 1.5em;">
          <i class="fas fa-circle fa-stack-1x text-light"></i>
          <i class="fas fa-xmark fa-stack-1x text-dark"></i>
        </span>
      `;
        }

        return `<span class="text-light">${symbol}</span>`;
    }).join('');
}

async function generateCommanders() {
    const output = document.getElementById('commander-results');
    output.innerHTML = 'Loading...';

    const count = parseInt(document.getElementById('commander-count').value, 10) || 3;
    const baseURL = 'https://api.scryfall.com/cards/random?q=type%3Alegendary%20type%3Acreature%20rarity%3Auncommon%20in%3Aarena%20format%3Abrawl';

    try {
        const results = [];
        const uniqueCommanders = new Set(); // Track unique commanders by name

        while (results.length < count) {
            const res = await fetch(baseURL);
            const card = await res.json();
            
            // Only add the card if we haven't seen this commander before
            if (!uniqueCommanders.has(card.name)) {
                uniqueCommanders.add(card.name);
                results.push(card);
            }
            
            await delay(100); // Scryfall-friendly rate limiting
        }

        output.innerHTML = '';
        results.forEach(card => {
            const image = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || '';
            const manaCost = card.mana_cost || card.card_faces?.[0]?.mana_cost || '';
            const name = card.name;
            const typeLine = card.type_line;

            const cardCol = document.createElement('div');
            cardCol.className = 'col';

            const cardDiv = document.createElement('div');
            cardDiv.className = 'text-center';

            cardDiv.innerHTML = `
                <a href="${card.scryfall_uri}" target="_blank" rel="noopener noreferrer">
                    <img src="${image}" 
                        alt="${name}" 
                        class="img-fluid rounded shadow mb-2" 
                        style="max-width:250px;" />
                </a>
                <div class="text-light mb-4">
                    <strong>${name}</strong><br>
                    ${renderManaCost(manaCost)}<br>
                    <small>${typeLine}</small>
                </div>
                `;

            cardCol.appendChild(cardDiv);
            output.appendChild(cardCol);
        });
    } catch (err) {
        console.error(err);
        output.innerHTML = '<p class="text-danger">Failed to fetch cards. Try again.</p>';
    }
}