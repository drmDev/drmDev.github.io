---
layout: default
title: Auth Test
---

<div class="container mt-4">
    <h2>Supabase Google Auth Test</h2>
    
    <!-- Status display -->
    <div id="authStatus" class="alert" style="display: none;"></div>
    
    <!-- Auth buttons -->
    <div id="authButtons">
        <button id="signInButton" class="btn btn-primary">
            Sign in with Google
        </button>
        <button id="signOutButton" class="btn btn-secondary" style="display: none;">
            Sign Out
        </button>
    </div>

    <!-- User info display -->
    <div id="userInfo" class="mt-3">
        <!-- User details will be inserted here -->
    </div>
</div>

<!-- Supabase JS Client -->
<script src="https://unpkg.com/@supabase/supabase-js@2.39.3"></script>

<!-- Auth Test JS -->
<script src="{{ '/assets/js/auth-test.js' | relative_url }}"></script>