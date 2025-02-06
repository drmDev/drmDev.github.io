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
	// console.log(`Fetching from URL: ${apiUrl}`);

    try {
        // Make the API request
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch board games.');

        const games = await response.json();

        // Render the games
        const gameList = document.getElementById('game-list');
		
		if (games.length === 0) {
            // No games found
            gameList.innerHTML = `
                <div class="col">
                    <div class="card h-100 text-center">
                        <div class="card-body">
                            <h5 class="card-title">No games found</h5>
                            <p class="card-text">Try adjusting your filters to see more results.</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
		
        gameList.innerHTML = games.map(game => `
				 <div class="col">
							<div class="card h-100 bg-dark text-light shadow">
									<div class="card-body">
											<h5 class="card-title text-warning text-center">${game.name}</h5>
											<h6 class="game-info"><i class="fas fa-users"></i> Players:</h6> ${game.min_players} - ${game.max_players}<br>
											<h6 class="game-info"><i class="fas fa-tag"></i> Type:</h6> ${game.type}<br>
											<h6 class="game-info"><i class="fas fa-clock"></i> Play Time:</h6> ${game.play_time} mins<br>
											${game.description ? `<h6 class="game-info"><i class="fas fa-info-circle"></i> Description:</h6> ${game.description}` : ''}
									</div>
							</div>
					</div>
        `).join('');
    } catch (error) {
        console.error(error.message);
        alert('Failed to fetch board games. Please try again later.');
    }
}
