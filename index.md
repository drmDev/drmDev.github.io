---
layout: default
title: Welcome
permalink: /
---

# <i class="fas fa-user-circle"></i> Welcome to My Portfolio

Hi, I'm Derek! I'm passionate about problem-solving and automation. This has driven my love for software development and strategy games. Believe it or not, there is a strong overlap with my enjoyment of the two!

<p style="text-align: center;">
    <img src="/assets/images/prof_chess.jpg" alt="Picture of me playing chess" style="max-width: 300px; border-radius: 8px;">
</p>

---

## <i class="fas fa-file-alt"></i> My Resume
Explore my professional background and experiences:
<p>
    <a href="/assets/pdf/DM_Resume_2024.pdf" download>
        <i class="fas fa-file-download"></i> Download My Resume (PDF)
    </a>
</p>

<iframe src="/assets/pdf/DM_Resume_2024.pdf" width="100%" height="500px" style="border: none;"></iframe>

---

## <i class="fas fa-laptop-code"></i> Technologies Behind This Site

<div class="row row-cols-1 row-cols-md-2 g-4">
    <div class="col">
        <div class="card h-100 shadow-lg border-0 bg-dark text-light">
            <div class="card-body">
                <h5 class="card-title"><i class="fas fa-tools"></i> Frontend</h5>
                {{ "
- **Jekyll**: Streamlines static site generation and content organization.
- **Bootstrap**: Enables responsive design.
- **FontAwesome**: Provides rich iconography for a modern UI.
- **JavaScript**: Adds dynamic interactivity and API calls.
" | markdownify }}
            </div>
        </div>
    </div>

    <div class="col">
        <div class="card h-100 shadow-lg border-0 bg-dark text-light">
            <div class="card-body">
                <h5 class="card-title"><i class="fas fa-server"></i> Backend</h5>
                {{ "
- **Go**: Handles API and database interactions.
- **PostgreSQL**: Provides scalable data storage.
- **Docker**: Ensures consistent deployment.
- **Railway**: Handles backend hosting and provisioning.
" | markdownify }}
            </div>
        </div>
    </div>

    <div class="col">
        <div class="card h-100 shadow-lg border-0 bg-dark text-light">
            <div class="card-body">
                <h5 class="card-title"><i class="fab fa-github"></i> Automation and Testing</h5>
                {{ "
- **GitHub Actions**: Automates builds and testing. [View CI/CD Workflow (YAML)](https://github.com/drmDev/drmDev.github.io/blob/main/.github/workflows/ci-cd.yml)
  ![Build Status](https://github.com/drmDev/drmDev.github.io/actions/workflows/ci-cd.yml/badge.svg)
- **Selenium WebDriver**: Ensures UI functionality.
  [View Tests](https://github.com/drmDev/drmDev.github.io/tree/main/SeleniumTests)
" | markdownify }}
            </div>
        </div>
    </div>
</div>
