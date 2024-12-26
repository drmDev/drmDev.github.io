async function fetchBoardGames() {
    // Fetch filter inputs
    const minPlayers = document.getElementById('min-players').value || 1;
    const maxPlayers = document.getElementById('max-players').value || 12;
    const type = document.getElementById('type').value || '';
	const baseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
		? 'http://localhost:8080'
		: 'https://drmdevgithubio-production.up.railway.app';
		
	//const baseUrl = "http://localhost:8080"; // forcing locally
	//const baseUrl = "https://drmdevgithubio-production.up.railway.app" // forcing Railway

    // Build query parameters dynamically
    let apiUrl = `${baseUrl}/api/games?min_players=${minPlayers}&max_players=${maxPlayers}`;
    if (type) {
        apiUrl += `&type=${type}`;
    }
	console.log(`Fetching from URL: ${apiUrl}`);

    try {
        // Make the API request
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch board games.');

        const games = await response.json();

        // Render the games
        const gameList = document.getElementById('game-list');
        gameList.innerHTML = games.map(game => `
            <div class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${game.name}</h5>
                        <p class="card-text">
                            Players: ${game.min_players} - ${game.max_players}<br>
                            Type: ${game.type}<br>
                            Play Time: ${game.play_time} mins<br>
                            ${game.description ? `Description: ${game.description}` : ''}
                        </p>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error(error.message);
        alert('Failed to fetch board games. Please try again later.');
    }
}
