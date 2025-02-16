const { createClient } = supabase

// Initialize Supabase client
const supabaseClient = createClient(
    'https://acrhtrgvkhjxbejrdgjn.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjcmh0cmd2a2hqeGJlanJkZ2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2Mjk2MzAsImV4cCI6MjA1NTIwNTYzMH0.-iILeoe7VlCH9kG8GE1bgf9_XHie-CXXcWftwkxf6-Y'
)
// MODIFIED: Improved environment detection
function getEnvironment() {
    const host = window.location.hostname;
    const port = window.location.port;

    if (host === 'localhost' || host === '127.0.0.1') {
        return {
            type: 'development',
            redirectUrl: `http://${host}:${port}/puzzles`
        };
    }
    return {
        type: 'production',
        redirectUrl: 'https://drmdev.github.io/puzzles'
    };
}

// MODIFIED: Enhanced auth functions with better logging
async function signInWithGoogle() {
    try {
        const env = getEnvironment();
        console.log('Environment:', env.type);
        console.log('Redirect URL:', env.redirectUrl);

        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: env.redirectUrl,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'select_account'
                }
            }
        });
        if (error) throw error;
    } catch (error) {
        console.error('Sign in failed:', error);
        // ADDED: Show error to user
        alert('Sign in failed. Please try again or check your console for more details.');
    }
}

async function signOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        window.location.reload();
    } catch (error) {
        console.error('Sign out failed:', error);
        alert('Sign out failed. Please check your console for more details.');
    }
}

// MODIFIED: Enhanced redirect handling
window.addEventListener('load', async () => {
    console.log('Page loaded. Current URL:', window.location.href);

    if (window.location.hash.includes('access_token')) {
        console.log('Handling OAuth redirect');

        try {
            // ADDED: Wait for auth to initialize
            await new Promise(resolve => setTimeout(resolve, 500));

            const { data: { session }, error } = await supabaseClient.auth.getSession();
            if (error) throw error;

            if (session) {
                console.log('Session established:', session);
                // Clean up URL
                window.history.replaceState(null, '', '/puzzles');
                // Force refresh to ensure state is updated
                window.location.reload();
            }
        } catch (error) {
            console.error('Error handling redirect:', error);
            alert('Authentication failed. Please try again.');
        }
    }
});

// Export functions
window.auth = {
    signInWithGoogle,
    signOut,
    supabaseClient,
    getEnvironment // ADDED: Expose for debugging
}