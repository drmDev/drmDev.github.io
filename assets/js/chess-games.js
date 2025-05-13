async function fetchAndDisplayLatestGames() {
    try {
        const response = await fetch('https://api.chess.com/pub/player/escplan9/games/live/900/10');
        if (!response.ok) throw new Error('Failed to fetch recent games.');

        const data = await response.json();

        // Sort games by end_time (latest first) and take the first 5 games
        const latestGames = data.games
            .sort((a, b) => b.end_time - a.end_time)
            .slice(0, 5);

        const gamesList = document.getElementById('latest-games-list');
        gamesList.innerHTML = ''; // Clear any existing content

        latestGames.forEach(game => {
            const opponent = game.white.username === 'escplan9' ? game.black.username : game.white.username;
            const playerColor = game.black.username === 'escplan9' ? 'black' : 'white';
            const result = game[playerColor].result === 'win' ? 'Win' : (game[playerColor].result === 'checkmated' ? 'Loss' : game[playerColor].result);
            const rating = game[playerColor].rating;
            const gameDate = new Date(game.end_time * 1000).toLocaleDateString();

            const gameItem = document.createElement('li');
            gameItem.innerHTML = `
                <i class="fas fa-chess-board"></i> <strong>${gameDate}</strong>: vs. ${opponent} - <span class="${result === 'Win' ? 'text-success' : 'text-danger'}">${result}</span> - Rating: ${rating}
            `;
            gamesList.appendChild(gameItem);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// fetchAndDisplayLatestGames();
