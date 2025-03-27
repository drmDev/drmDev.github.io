---
layout: default
title: Tech Insights
permalink: /insights/
custom_css: blog.css
---
<link rel="stylesheet" href="{{ '/assets/css/blog.css' | relative_url }}">

<h1 class="mb-4 text-center"><i class="fas fa-pen-fancy"></i> Tech Insights</h1>

<p class="lead text-center mb-5">
		Concise technical articles on modern software development, automation, and QA matters.
</p>

<div class="row">
    <div class="col-12 col-lg-8 mx-auto">
        {% for post in site.posts %}
            <div class="card shadow-lg border-0 bg-dark text-light mb-4 blog-preview-card">
                <div class="card-body">
                    <h2 class="card-title h3">
                        <i class="fas fa-pen"></i> {{ post.title }}
                    </h2>
                    <div class="post-meta">
                        <i class="fas fa-calendar-alt"></i> {{ post.date | date: "%B %d, %Y" }}
                        {% if post.categories.size > 0 %}
                        <span class="ms-3">
                            <i class="fas fa-tags"></i>
                            {% for category in post.categories %}
                                <span class="badge bg-info">{{ category }}</span>
                            {% endfor %}
                        </span>
                        {% endif %}
                    </div>
                    <div class="card-text mb-3">
                        {{ post.excerpt }}
                    </div>
                    <a href="{{ post.url | relative_url }}" class="btn btn-primary">
                        <i class="fas fa-book-reader"></i> Read More
                    </a>
                </div>
            </div>
        {% endfor %}
    </div>
</div>