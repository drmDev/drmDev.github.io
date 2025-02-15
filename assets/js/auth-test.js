// Initialize Supabase client
const { createClient } = supabase
const supabaseClient = createClient(
    'https://acrhtrgvkhjxbejrdgjn.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjcmh0cmd2a2hqeGJlanJkZ2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2Mjk2MzAsImV4cCI6MjA1NTIwNTYzMH0.-iILeoe7VlCH9kG8GE1bgf9_XHie-CXXcWftwkxf6-Y'
)

// Get DOM elements
const signInButton = document.getElementById('signInButton')
const signOutButton = document.getElementById('signOutButton')
const authStatus = document.getElementById('authStatus')
const userInfo = document.getElementById('userInfo')

// Show status message
function showStatus(message, type = 'info') {
    authStatus.textContent = message
    authStatus.className = `alert alert-${type}`
    authStatus.style.display = 'block'
}

// Update UI based on auth state
function updateUI(session) {
    if (session) {
        signInButton.style.display = 'none'
        signOutButton.style.display = 'block'
        showStatus('Signed in!', 'success')

        // Display user info
        userInfo.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">User Details</h5>
                    <p>Email: ${session.user.email}</p>
                    <p>ID: ${session.user.id}</p>
                    <p>Last Sign In: ${new Date(session.user.last_sign_in_at).toLocaleString()}</p>
                </div>
            </div>
        `
    } else {
        signInButton.style.display = 'block'
        signOutButton.style.display = 'none'
        showStatus('Signed out', 'info')
        userInfo.innerHTML = ''
    }
}

const getRedirectUrl = () => {
    const isProd = window.location.hostname === 'drmdev.github.io';
    if (isProd) {
        return 'https://drmdev.github.io/auth-test';
    }
    return 'http://localhost:4000/auth-test';
}

// Sign in and out listeners
signInButton.addEventListener('click', async () => {
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: getRedirectUrl()
            }
        })

        if (error) throw error
    } catch (error) {
        showStatus('Sign in failed: ' + error.message, 'danger')
    }
})

signOutButton.addEventListener('click', async () => {
    try {
        const { error } = await supabaseClient.auth.signOut()
        if (error) throw error
    } catch (error) {
        showStatus('Sign out failed: ' + error.message, 'danger')
    }
})

supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event)
    updateUI(session)
})

supabaseClient.auth.getSession().then(({ data: { session } }) => {
    updateUI(session)
})