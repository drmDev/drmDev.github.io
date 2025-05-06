async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateCommanders() {
    const output = document.getElementById('commander-results');
    output.innerHTML = 'Loading...';
    const baseURL = 'https://api.scryfall.com/cards/random?q=type%3Alegendary%20type%3Acreature%20rarity%3Auncommon%20in%3Aarena%20format%3Abrawl';

    try {
        const results = [];

        for (let i = 0; i < 3; i++) {
            const res = await fetch(baseURL);
            const card = await res.json();
            results.push(card);
            await delay(100);
        }

        output.innerHTML = '';
        results.forEach(card => {
            const image = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || '';
            const manaCost = card.mana_cost || card.card_faces?.[0]?.mana_cost || '';
            const name = card.name;
            const typeLine = card.type_line;

            const cardDiv = document.createElement('div');
            cardDiv.className = "text-center";

            cardDiv.innerHTML = `
        <a href="${card.scryfall_uri}" target="_blank" rel="noopener noreferrer">
          <img src="${image}" 
               alt="${name}" 
               class="img-fluid rounded shadow mb-2" 
               style="max-width:250px;" />
        </a>
        <div class="text-light">
          <strong>${name}</strong><br>
          <span>${manaCost}</span><br>
          <small>${typeLine}</small>
        </div>
      `;
            output.appendChild(cardDiv);
        });
    } catch (err) {
        console.error(err);
        output.innerHTML = '<p class="text-danger">Failed to fetch cards. Try again.</p>';
    }
}
