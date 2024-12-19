async function filterGames() {
    const minPlayers = parseInt(document.getElementById('min-players').value) || 1;
    const maxPlayers = parseInt(document.getElementById('max-players').value) || 8;
    const type = document.getElementById('type').value;

    const url = `https://drmdev-github-io.onrender.com/api/games?min_players=${minPlayers}&max_players=${maxPlayers}&type=${type}`;
    const response = await fetch(url);
    const games = await response.json();

    const gameList = document.getElementById('game-list');
    gameList.innerHTML = games.map(game =>
        `<p><strong>${game.name}</strong> (${game.min_players}-${game.max_players} players, ${game.type})</p>`
    ).join('');
}

document.addEventListener('DOMContentLoaded', filterGames);
