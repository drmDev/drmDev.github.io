async function filterGames() {
    let minPlayers = parseInt(document.getElementById('min-players').value) || 1;
    let maxPlayers = parseInt(document.getElementById('max-players').value) || 12;

    // Enforce valid ranges
    minPlayers = Math.max(1, minPlayers); // Minimum is 1
    maxPlayers = Math.min(12, maxPlayers); // Maximum is 12

    // Ensure minPlayers is not greater than maxPlayers
    if (minPlayers > maxPlayers) {
        alert("Minimum players cannot be greater than Maximum players.");
        return;
    }

    const type = document.getElementById('type').value;

    const url = `https://drmdev-github-io.onrender.com/api/games?min_players=${minPlayers}&max_players=${maxPlayers}&type=${type}`;
    try {
        const response = await fetch(url);
        const games = await response.json();

        const gameList = document.getElementById('game-list');
        gameList.innerHTML = games.map(game => `
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${game.name}</h5>
                        <p class="card-text">
                            Players: ${game.min_players} - ${game.max_players}<br>
                            Type: ${game.type}
                        </p>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error fetching games:", error);
    }
}
