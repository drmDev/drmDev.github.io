document.addEventListener("DOMContentLoaded", function () {
    const categorySelect = document.getElementById("categorySelect");
    const puzzleTitle = document.getElementById("puzzleTitle");
    const puzzleFrame = document.getElementById("puzzleFrame");
		const baseUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
		? 'http://localhost:8081'
		: 'https://chesswoodpecker-production.up.railway.app';
		let apiUrl = `${baseUrl}/api/puzzles`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(puzzles => {
            const categories = [...new Set(puzzles.map(p => p.category))];

            // Populate dropdown with categories
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });

            categorySelect.addEventListener("change", function () {
                const selectedCategory = categorySelect.value;
                if (!selectedCategory) return;

                // Get first puzzle of selected category
                const puzzle = puzzles.find(p => p.category === selectedCategory);
                if (puzzle) {
                    puzzleTitle.textContent = `Current Puzzle: ${selectedCategory}`;
                    window.open(puzzle.url, "_blank");
                }
            });
        })
        .catch(error => console.error("Error fetching puzzles:", error));
});
