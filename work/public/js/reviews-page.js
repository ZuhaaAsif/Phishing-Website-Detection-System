// DOM Elements
const addReviewMainBtn = document.getElementById('addReviewMainBtn');
const myReviewsSection = document.getElementById('myReviewsSection');
const myReviewsList = document.getElementById('myReviewsList');
const allReviewsList = document.getElementById('allReviewsList');
const postReviewBtnNav = document.getElementById('postReviewBtnNav');
const exploreBtn = document.getElementById('exploreBtn');
const signInBtn = document.getElementById('signInBtn');
const homeBtn = document.getElementById('homeBtn');

let currentUser = null;
let selectedRating = 0;
let allReviews = [];

// Check auth status on load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadAllReviews();
    setupEventListeners();
    setupReviewForm();
});

function setupEventListeners() {
    // Add review button
    if (addReviewMainBtn) {
        addReviewMainBtn.addEventListener('click', () => {
            if (currentUser) {
                showReviewModal();
            } else {
                showToast('Please login to post a review', 'info');
                showLoginModal();
            }
        });
    }
    
    // Navigation
    if (postReviewBtnNav) {
        postReviewBtnNav.addEventListener('click', () => {
            window.location.href = '/reviews.html';
        });
    }
    
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
    
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
    
    if (signInBtn) {
        signInBtn.addEventListener('click', showLoginModal);
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
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const userInfo = document.getElementById('userInfo');
        const dropdown = document.getElementById('profileDropdown');
        if (userInfo && dropdown && !userInfo.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });
    
    // My Reviews button in dropdown
    const myReviewsBtn = document.getElementById('myReviewsBtn');
    if (myReviewsBtn) {
        myReviewsBtn.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
            document.getElementById('myReviewsSection').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
            showToast('Settings feature coming soon!', 'info');
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
            logout();
        });
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
                    await loadUserReviews();
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
    
    // Show my reviews section
    if (myReviewsSection) {
        myReviewsSection.classList.remove('hidden');
    }
}

function updateUIForLoggedOutUser() {
    const userInfo = document.getElementById('userInfo');
    const signInBtnElem = document.getElementById('signInBtn');
    
    if (userInfo && signInBtnElem) {
        userInfo.classList.add('hidden');
        signInBtnElem.classList.remove('hidden');
    }
    
    if (myReviewsSection) {
        myReviewsSection.classList.add('hidden');
    }
    
    currentUser = null;
}

// Load all reviews from database
async function loadAllReviews() {
    try {
        const response = await fetch('/api/reviews');
        if (response.ok) {
            const data = await response.json();
            allReviews = data.data || [];
            displayAllReviews(allReviews);
        }
    } catch (error) {
        console.error('Failed to load reviews:', error);
    }
}

// Load current user's reviews
async function loadUserReviews() {
    if (!currentUser) return;
    
    try {
        const response = await fetch('/api/reviews');
        if (response.ok) {
            const data = await response.json();
            const userReviews = (data.data || []).filter(r => r.user_id === currentUser.user_id);
            displayUserReviews(userReviews);
        }
    } catch (error) {
        console.error('Failed to load user reviews:', error);
    }
}

function displayAllReviews(reviews) {
    if (!allReviewsList) return;
    
    if (!reviews || reviews.length === 0) {
        allReviewsList.innerHTML = '<div class="no-reviews">No reviews yet. Be the first to post a review!</div>';
        return;
    }
    
    allReviewsList.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">${review.users?.username?.charAt(0).toUpperCase() || 'U'}</div>
                    <div>
                        <div class="reviewer-name">${escapeHtml(review.users?.username || 'Anonymous')}</div>
                        <div class="review-date">${new Date(review.created_at || Date.now()).toLocaleDateString()}</div>
                    </div>
                </div>
                <div class="rating-display">${generateStarRating(review.rate)}</div>
            </div>
            <div class="review-website">
                <i class="fas fa-globe"></i> ${escapeHtml(review.websites?.website_name || 'Unknown')}
            </div>
            ${review.review ? `<div class="review-text">${escapeHtml(review.review)}</div>` : ''}
        </div>
    `).join('');
}

function displayUserReviews(reviews) {
    if (!myReviewsList) return;
    
    if (!reviews || reviews.length === 0) {
        myReviewsList.innerHTML = '<div class="no-reviews">You haven\'t posted any reviews yet. Click the + button to add your first review!</div>';
        return;
    }
    
    myReviewsList.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">${currentUser?.username?.charAt(0).toUpperCase() || 'U'}</div>
                    <div>
                        <div class="reviewer-name">${escapeHtml(currentUser?.username || 'You')}</div>
                        <div class="review-date">${new Date(review.created_at || Date.now()).toLocaleDateString()}</div>
                    </div>
                </div>
                <div class="rating-display">${generateStarRating(review.rate)}</div>
            </div>
            <div class="review-website">
                <i class="fas fa-globe"></i> ${escapeHtml(review.websites?.website_name || 'Unknown')}
            </div>
            ${review.review ? `<div class="review-text">${escapeHtml(review.review)}</div>` : ''}
        </div>
    `).join('');
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

// Review Modal Functions
function showReviewModal() {
    if (!currentUser) {
        showToast('Please sign in to post a review', 'info');
        showLoginModal();
        return;
    }
    
    selectedRating = 0;
    document.getElementById('reviewForm').reset();
    document.getElementById('reviewRating').value = '';
    updateRatingStars(0);
    document.getElementById('reviewModal').classList.add('show');
}

function setupReviewForm() {
    const stars = document.querySelectorAll('.rating-stars i');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            document.getElementById('reviewRating').value = selectedRating;
            updateRatingStars(selectedRating);
        });
        
        star.addEventListener('mouseenter', () => {
            updateRatingStars(parseInt(star.dataset.rating));
        });
        
        star.addEventListener('mouseleave', () => {
            updateRatingStars(selectedRating);
        });
    });
    
    document.getElementById('reviewForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const url = document.getElementById('reviewWebsiteUrl').value;
        const rating = parseInt(document.getElementById('reviewRating').value);
        const review = document.getElementById('reviewText').value;
        
        if (!url || !rating) {
            showToast('Please fill all required fields', 'error');
            return;
        }
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Please login');
            
            let cleanUrl = url;
            if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
            const domain = new URL(cleanUrl).hostname;
            
            // Find or create website
            let searchResponse = await fetch(`/api/websites/domain/${encodeURIComponent(domain)}`);
            let websiteId;
            
            if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                websiteId = searchData.data?.website_id;
            }
            
            if (!websiteId) {
                const createResponse = await fetch('/api/websites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ website_name: domain, url: cleanUrl, domain: domain })
                });
                const createData = await createResponse.json();
                websiteId = createData.data?.website_id;
            }
            
            // Submit review
            const reviewResponse = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ website_id: websiteId, rate: rating, review: review || null })
            });
            
            if (reviewResponse.ok) {
                showToast('Your review has been recorded!', 'success');
                document.getElementById('reviewModal').classList.remove('show');
                document.getElementById('reviewForm').reset();
                selectedRating = 0;
                updateRatingStars(0);
                
                // Reload reviews
                await loadAllReviews();
                await loadUserReviews();
            } else {
                const error = await reviewResponse.json();
                showToast(error.error || 'Failed to submit review', 'error');
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

function updateRatingStars(rating) {
    const stars = document.querySelectorAll('.rating-stars i');
    stars.forEach((star, index) => {
        star.className = index < rating ? 'fas fa-star active' : 'far fa-star';
    });
}

// Modal Functions
function showLoginModal() {
    document.getElementById('loginModal').classList.add('show');
}

function showRegisterModal() {
    document.getElementById('registerModal').classList.add('show');
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
            resetForms();
            await loadUserReviews();
            await loadAllReviews();
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
            resetForms();
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
    await loadAllReviews();
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="toast-content"><span class="toast-message">${escapeHtml(message)}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function resetForms() {
    ['loginForm', 'registerForm', 'reviewForm'].forEach(id => {
        document.getElementById(id)?.reset();
    });
    selectedRating = 0;
    updateRatingStars(0);
}

console.log('Reviews page loaded successfully');