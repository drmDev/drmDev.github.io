---
layout: default
title: Welcome
permalink: /
---

# <i class="fas fa-user-tie"></i> Welcome to My Portfolio

Hi, I'm Derek! I'm passionate about problem-solving and automation. I'm also a nerd that loves games and technology!

<p style="text-align: center;">
    <img src="/assets/images/prof_chess.jpg" alt="Picture of me playing chess" style="max-width: 300px; border-radius: 8px;">
</p>

---

## <i class="fas fa-laptop-code"></i> Technologies Behind This Site

<div class="row row-cols-1 row-cols-md-2 g-4">

    <!-- Frontend Card -->
    <div class="col">
        <div class="card h-100 shadow-lg border-0 bg-dark text-light">
            <div class="card-body">
                <h5 class="card-title"><i class="fas fa-tools"></i> Frontend</h5>
                {{ "
- **Jekyll**: Converts Markdown and Liquid templates into a static site, making content management a breeze.
- **Bootstrap**: Powers the site's responsive layout, ensuring a clean look whether you're on a phone, tablet, or desktop.
- **FontAwesome**: Adds visual flair with icons, such as chess pieces and interactive links, for a modern, engaging feel.
- **JavaScript**: Handles interactive elements, including dynamic filters on the board games section and my Chess Woodpecker app.
" | markdownify }}
            </div>
        </div>
    </div>

    <!-- Backend Card -->
    <div class="col">
        <div class="card h-100 shadow-lg border-0 bg-dark text-light">
            <div class="card-body">
                <h5 class="card-title"><i class="fas fa-server"></i> Backend</h5>
                {{ "
- **Go**: Powers a fast and reliable REST API that queries the PostgreSQL database and serves data for board game filtering and my Chess Woodpecker app.
- **PostgreSQL**: Stores all board game and Chess puzzle data.
- **Docker**: Simplifies deployment by bundling all dependencies into isolated containers, making the entire system portable across environments.
- **Railway**: Manages backend hosting and the PostgreSQL database with automatic deployments and scaling.
" | markdownify }}
            </div>
        </div>
    </div>
    <!-- Automation and Testing Card -->
    <div class="col">
        <div class="card h-100 shadow-lg border-0 bg-dark text-light">
            <div class="card-body">
                <h5 class="card-title"><i class="fab fa-github"></i> Automation and Testing</h5>
                <ul>
                    <li>
                        <strong>GitHub Actions:</strong> Automates builds and testing.
                        <img src="https://github.com/drmDev/drmDev.github.io/actions/workflows/ci-cd.yml/badge.svg" alt="Build Status" style="max-width: 100%;">
                        <a href="https://github.com/drmDev/drmDev.github.io/blob/main/.github/workflows/ci-cd.yml" target="_blank" rel="noopener noreferrer">
                            View CI/CD Workflow (YAML)
                        </a>
                    </li>
                    <li>
                        <strong>Selenium WebDriver:</strong> Validates UI functionality.
                        <br>
                        <a href="https://github.com/drmDev/drmDev.github.io/tree/main/SeleniumTests" target="_blank" rel="noopener noreferrer">
                            View Tests (C#)
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>

