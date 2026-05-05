// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('resultsSection');
const noResultsSection = document.getElementById('noResultsSection');
const errorSection = document.getElementById('errorSection');
const loadingIndicator = document.getElementById('loadingIndicator');
const reviewsList = document.getElementById('reviewsList');
const websiteName = document.getElementById('websiteName');
const websiteUrl = document.getElementById('websiteUrl');
const reviewCount = document.getElementById('reviewCount');
const avgRating = document.getElementById('avgRating');
const signInBtn = document.getElementById('signInBtn');
const postReviewFromExplore = document.getElementById('postReviewFromExplore');

let currentDomain = null;
let currentUser = null;
let intendedDestination = null;

// Check auth status on load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
    
    // Check if there's a search query in URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
        searchInput.value = query;
        performSearch(query);
    }
});

function setupEventListeners() {
    // Search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (!query) {
                showToast('Please enter a website URL or domain', 'error');
                return;
            }
            performSearch(query);
            const url = new URL(window.location);
            url.searchParams.set('q', query);
            window.history.pushState({}, '', url);
        });
    }
    
    // Enter key in search input
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (!query) {
                    showToast('Please enter a website URL or domain', 'error');
                    return;
                }
                performSearch(query);
                const url = new URL(window.location);
                url.searchParams.set('q', query);
                window.history.pushState({}, '', url);
            }
        });
    }
    
    // Example search buttons
    document.querySelectorAll('.example-search').forEach(btn => {
        btn.addEventListener('click', () => {
            const domain = btn.dataset.domain;
            searchInput.value = domain;
            performSearch(domain);
            const url = new URL(window.location);
            url.searchParams.set('q', domain);
            window.history.pushState({}, '', url);
        });
    });
    
    // Post review suggestion button
    if (postReviewFromExplore) {
        postReviewFromExplore.onclick = function(e) {
            e.preventDefault();
            if (currentUser) {
                window.location.href = '/reviews.html';
            } else {
                intendedDestination = '/reviews.html';
                showToast('Please login to post a review', 'info');
                showLoginModal();
            }
        };
    }
    
    // Retry button
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) performSearch(query);
        });
    }
    
    // Navigation
    const homeBtn = document.getElementById('homeBtn');
    const postReviewBtn = document.getElementById('postReviewBtn');
    const exploreBtn = document.getElementById('exploreBtn');
    const quizBtn = document.getElementById('quizBtn');

    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
    
    if (postReviewBtn) {
        postReviewBtn.addEventListener('click', () => {
            window.location.href = '/reviews.html';
        });
    }
    
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            window.location.href = '/explore.html';
        });
    }
    
    if (signInBtn) {
        console.log('Sign in button found, adding listener');
        signInBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Sign in button clicked');
            showLoginModal();
        });
    }

    if (quizBtn) {
        quizBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
    
    // Profile dropdown
    const profileTrigger = document.getElementById('profileTrigger');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileTrigger) {
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
    }
    
    document.addEventListener('click', function(event) {
        const userInfo = document.getElementById('userInfo');
        const dropdown = document.getElementById('profileDropdown');
        if (userInfo && dropdown && !userInfo.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });
    
    // Dropdown buttons
    const myReviewsBtn = document.getElementById('myReviewsBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (myReviewsBtn) {
        myReviewsBtn.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
            window.location.href = '/reviews.html';
        });
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
            showToast('Settings feature coming soon!', 'info');
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
            logout();
        });
    }
}

async function performSearch(query) {
    hideAllSections();
    showLoading(true);
    
    try {
        // Clean the query - extract domain
        let domain = query;
        let fullUrl = query;
        
        // Remove http:// or https:// if present
        let cleanQuery = query.replace(/^https?:\/\//i, '');
        // Replace backslashes with forward slashes if present
        cleanQuery = cleanQuery.replace(/\\/g, '/');
        // Get domain part (before first slash)
        domain = cleanQuery.split('/')[0];
        fullUrl = `https://${domain}`;
        
        console.log('Searching for domain:', domain);
        currentDomain = domain;
        
        // Get website info
        let websiteResponse = await fetch(`/api/websites/domain/${encodeURIComponent(domain)}`);
        let website = null;
        
        if (websiteResponse.ok) {
            const websiteData = await websiteResponse.json();
            if (websiteData.success && websiteData.data) {
                website = websiteData.data;
                console.log('Website found in database:', website);
            }
        }
        
        // Get reviews for this website
        const reviewsResponse = await fetch(`/api/reviews/domain/${encodeURIComponent(domain)}`);
        const reviewsData = await reviewsResponse.json();
        const reviews = reviewsData.success ? reviewsData.data : [];
        
        console.log(`Found ${reviews.length} reviews for ${domain}`);
        
        // Display website info
        if (website) {
            displayWebsiteInfo(website, reviews);
        } else {
            const tempWebsite = {
                website_name: domain,
                url: fullUrl,
                domain: domain
            };
            displayWebsiteInfo(tempWebsite, reviews);
        }
        
        // Display reviews
        if (reviews.length === 0) {
            showNoResults('No reviews yet for this website.');
        } else {
            displayReviews(reviews);
            showResults();
        }
        
    } catch (error) {
        console.error('Search error:', error);
        showError('Unable to search. Please try again.');
    } finally {
        showLoading(false);
    }
}

function displayWebsiteInfo(website, reviews) {
    if (!websiteName || !websiteUrl) return;
    
    websiteName.textContent = website.website_name || website.domain;
    websiteUrl.textContent = website.url || `https://${website.domain}`;
    
    let totalRating = 0;
    reviews.forEach(review => {
        totalRating += review.rate;
    });
    const average = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
    
    if (reviewCount) reviewCount.textContent = reviews.length;
    if (avgRating) avgRating.textContent = average;
}

function displayReviews(reviews) {
    if (!reviewsList) return;
    
    if (!reviews || reviews.length === 0) {
        reviewsList.innerHTML = '<div class="no-reviews">No reviews yet for this website.</div>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < reviews.length; i++) {
        const review = reviews[i];
        const isAnonymous = review.is_anonymous === true;
        const username = review.users?.username || 'Anonymous';
        const displayName = isAnonymous ? 'Anonymous' : username;
        const avatarLetter = isAnonymous ? 'A' : (username.charAt(0) || 'A').toUpperCase();
        
        html += `
            <div class="review-card">
                <div class="review-card-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">${avatarLetter}</div>
                        <div>
                            <div class="reviewer-name">${escapeHtml(displayName)}</div>
                            <div class="review-date">${new Date(review.created_at || Date.now()).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div class="review-rating">
                        ${generateStarRating(review.rate)}
                    </div>
                </div>
                ${review.review ? `<div class="review-text">${escapeHtml(review.review)}</div>` : ''}
            </div>
        `;
    }
    
    reviewsList.innerHTML = html;
    console.log('Reviews displayed:', reviews.length);
}

function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star empty"></i>';
        }
    }
    return stars;
}

function hideAllSections() {
    if (resultsSection) resultsSection.classList.add('hidden');
    if (noResultsSection) noResultsSection.classList.add('hidden');
    if (errorSection) errorSection.classList.add('hidden');
}

function showResults() {
    if (resultsSection) {
        resultsSection.classList.remove('hidden');
        console.log('Results section shown');
    }
    if (noResultsSection) noResultsSection.classList.add('hidden');
    if (errorSection) errorSection.classList.add('hidden');
}

function showNoResults(message) {
    if (noResultsSection) {
        const msgElement = noResultsSection.querySelector('.no-results-content p');
        if (msgElement) msgElement.textContent = message || 'No reviews yet for this website.';
        noResultsSection.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        console.log('No results section shown');
    }
}

function showError(message) {
    const errorMessageElem = document.getElementById('errorMessage');
    if (errorMessageElem) errorMessageElem.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${escapeHtml(message)}`;
    if (errorSection) {
        errorSection.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        noResultsSection.classList.add('hidden');
    }
}

function showLoading(show) {
    if (loadingIndicator) {
        if (show) {
            loadingIndicator.classList.remove('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }
}

// Authentication Functions
async function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            const response = await fetch('/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    currentUser = data.data;
                    updateUIForLoggedInUser();
                } else {
                    localStorage.removeItem('authToken');
                    updateUIForLoggedOutUser();
                }
            } else {
                localStorage.removeItem('authToken');
                updateUIForLoggedOutUser();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('authToken');
            updateUIForLoggedOutUser();
        }
    } else {
        updateUIForLoggedOutUser();
    }
}

function updateUIForLoggedInUser() {
    const userInfo = document.getElementById('userInfo');
    const signInBtnElem = document.getElementById('signInBtn');
    const userNameSpan = document.getElementById('userName');
    const avatarText = document.getElementById('avatarText');
    const dropdownAvatarText = document.getElementById('dropdownAvatarText');
    const dropdownUsername = document.getElementById('dropdownUsername');
    const dropdownEmail = document.getElementById('dropdownEmail');
    
    if (userInfo && signInBtnElem && currentUser) {
        userInfo.classList.remove('hidden');
        signInBtnElem.classList.add('hidden');
        
        const displayName = currentUser.username || currentUser.email.split('@')[0];
        const avatarLetter = displayName.charAt(0).toUpperCase();
        
        if (userNameSpan) userNameSpan.textContent = displayName;
        if (avatarText) avatarText.textContent = avatarLetter;
        if (dropdownAvatarText) dropdownAvatarText.textContent = avatarLetter;
        if (dropdownUsername) dropdownUsername.textContent = displayName;
        if (dropdownEmail) dropdownEmail.textContent = currentUser.email;
    }
}

function updateUIForLoggedOutUser() {
    const userInfo = document.getElementById('userInfo');
    const signInBtnElem = document.getElementById('signInBtn');
    
    if (userInfo && signInBtnElem) {
        userInfo.classList.add('hidden');
        signInBtnElem.classList.remove('hidden');
    }
    currentUser = null;
}

// Modal Functions
function showLoginModal() {
    console.log('showLoginModal called on explore page');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('show');
        console.log('Login modal opened');
    } else {
        console.error('Login modal not found');
    }
}

function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.classList.add('show');
}

// Login Handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            localStorage.setItem('authToken', data.data.token);
            currentUser = data.data.user;
            updateUIForLoggedInUser();
            document.getElementById('loginModal').classList.remove('show');
            showToast('Login successful!', 'success');
            
            if (intendedDestination) {
                const dest = intendedDestination;
                intendedDestination = null;
                window.location.href = dest;
            }
        } else {
            showToast(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showToast('Login failed', 'error');
    }
});

// Register Handler
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const privacyAccepted = document.getElementById('privacyPolicyAccept');
    if (!privacyAccepted || !privacyAccepted.checked) {
        showToast('Please read and accept the Privacy Policy to continue', 'error');
        return;
    }

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showToast('Registration successful! Please login.', 'success');
            document.getElementById('registerModal').classList.remove('show');
            showLoginModal();
        } else {
            showToast(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showToast('Registration failed', 'error');
    }
});

document.getElementById('showRegisterBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginModal').classList.remove('show');
    showRegisterModal();
});

document.getElementById('showLoginBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerModal').classList.remove('show');
    showLoginModal();
});

// Close modals
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('show'));
    });
});

window.addEventListener('click', (e) => {
    document.querySelectorAll('.modal').forEach(modal => {
        if (e.target === modal) modal.classList.remove('show');
    });
});

async function logout() {
    localStorage.removeItem('authToken');
    currentUser = null;
    updateUIForLoggedOutUser();
    showToast('Logged out successfully', 'success');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type) {
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="toast-content"><span class="toast-message">${escapeHtml(message)}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

console.log('Explore page loaded successfully');

// Make modal functions global
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;

// Privacy Policy Link Handler
const privacyPolicyLink = document.getElementById('privacyPolicyRegisterLink');
const privacyPolicyModal = document.getElementById('privacyPolicyModal');
const closePrivacyModal = document.getElementById('closePrivacyModal');

if (privacyPolicyLink) {
    privacyPolicyLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (privacyPolicyModal) {
            privacyPolicyModal.classList.remove('hidden');
            privacyPolicyModal.classList.add('show');
        }
    });
}

if (closePrivacyModal) {
    closePrivacyModal.addEventListener('click', () => {
        if (privacyPolicyModal) {
            privacyPolicyModal.classList.add('hidden');
            privacyPolicyModal.classList.remove('show');
        }
    });
}

window.addEventListener('click', (e) => {
    if (privacyPolicyModal && e.target === privacyPolicyModal) {
        privacyPolicyModal.classList.add('hidden');
        privacyPolicyModal.classList.remove('show');
    }
});