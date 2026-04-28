// DOM Elements
const floatingAddBtn = document.getElementById('floatingAddBtn');
const reviewFormModal = document.getElementById('reviewFormModal');
const closeFormBtn = document.getElementById('closeFormBtn');
const reviewsList = document.getElementById('reviewsList');
const signInBtn = document.getElementById('signInBtn');
const submitBtn = document.getElementById('submitBtn');
const privacyLink = document.getElementById('privacyPolicyLink');
const privacyModal = document.getElementById('privacyModal');

// Form elements
const reviewForm = document.getElementById('reviewForm');
const reviewUrlInput = document.getElementById('reviewWebsiteUrl');
const reviewText = document.getElementById('reviewText');
const ratingInputs = document.querySelectorAll('.rating-input i');
const anonymousToggle = document.getElementById('anonymousToggle');
const privacyToggle = document.getElementById('privacyToggle');

let currentUser = null;
let selectedRating = 0;
let isAnonymous = false;
let privacyAccepted = false;
let allReviews = [];

// Check auth status on load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthStatus();  // Wait for auth to complete
    setupEventListeners();
    setupReviewForm();
    
    // Only load reviews if user is logged in
    if (currentUser) {
        await loadUserReviews();
    } else {
        if (reviewsList) {
            reviewsList.innerHTML = '<div class="no-reviews">🔐 Please login to see your reviews</div>';
        }
    }
});

function setupEventListeners() {
    // Floating add button - show modal
    if (floatingAddBtn) {
        floatingAddBtn.addEventListener('click', () => {
            if (currentUser) {
                showReviewModal();
            } else {
                showToast('Please login to post a review', 'info');
                showLoginModal();
            }
        });
    }
    
    // Close form button
    if (closeFormBtn) {
        closeFormBtn.addEventListener('click', () => {
            if (reviewFormModal) {
                reviewFormModal.classList.add('hidden');
            }
        });
    }
    
    // Click outside modal to close
    if (reviewFormModal) {
        reviewFormModal.addEventListener('click', (e) => {
            if (e.target === reviewFormModal) {
                reviewFormModal.classList.add('hidden');
            }
        });
    }
    
    // Rating stars
    if (ratingInputs.length > 0) {
        ratingInputs.forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.rating);
                updateRatingStars(selectedRating);
                checkSubmitEnabled();
            });
            
            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.dataset.rating);
                updateRatingStars(rating);
            });
            
            star.addEventListener('mouseleave', () => {
                updateRatingStars(selectedRating);
            });
        });
    }
    
    // Anonymous toggle
    if (anonymousToggle) {
        anonymousToggle.addEventListener('click', () => {
            anonymousToggle.classList.toggle('active');
            isAnonymous = anonymousToggle.classList.contains('active');
        });
    }
    
    // Privacy toggle
    if (privacyToggle) {
        privacyToggle.addEventListener('click', () => {
            privacyToggle.classList.toggle('active');
            privacyAccepted = privacyToggle.classList.contains('active');
            checkSubmitEnabled();
        });
    }
    
    // Privacy policy link
    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (privacyModal) {
                privacyModal.classList.add('show');
            }
        });
    }
    
    // Input validation
    if (reviewUrlInput) {
        reviewUrlInput.addEventListener('input', checkSubmitEnabled);
    }
    
    if (reviewText) {
        reviewText.addEventListener('input', checkSubmitEnabled);
    }
    
    // Navigation
    const postReviewBtnNav = document.getElementById('postReviewBtnNav');
    const exploreBtn = document.getElementById('exploreBtn');
    const homeBtn = document.getElementById('homeBtn');
    const quizBtn = document.getElementById('quizBtn');

    if (postReviewBtnNav) {
        postReviewBtnNav.addEventListener('click', () => {
            window.location.href = '/reviews.html';
        });
    }
    
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            window.location.href = '/explore.html';
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

    if (quizBtn) {
        quizBtn.addEventListener('click', () => {
        window.location.href = '/quiz.html';
    });
}
    
    // Profile dropdown
    const profileTrigger = document.getElementById('profileTrigger');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileTrigger && profileDropdown) {
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
            if (profileDropdown) profileDropdown.classList.remove('show');
            const myReviewsSection = document.getElementById('myReviewsSection');
            if (myReviewsSection) {
                myReviewsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            if (profileDropdown) profileDropdown.classList.remove('show');
            showToast('Settings feature coming soon!', 'info');
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (profileDropdown) profileDropdown.classList.remove('show');
            logout();
        });
    }
}

function checkSubmitEnabled() {
    if (!submitBtn) return;
    
    const url = reviewUrlInput?.value.trim();
    const review = reviewText?.value.trim();
    const hasUrl = url && url.length > 0;
    const hasReview = review && review.length > 0;
    const hasRating = selectedRating > 0;
    
    // Enable submit only if ALL conditions are met
    if (hasUrl && hasRating && hasReview && privacyAccepted) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

function updateRatingStars(rating) {
    if (ratingInputs.length === 0) return;
    
    ratingInputs.forEach((star, index) => {
        if (index < rating) {
            star.className = 'fas fa-star active';
        } else {
            star.className = 'far fa-star';
        }
    });
}

function showReviewModal() {
    if (!currentUser) {
        showToast('Please sign in to post a review', 'info');
        showLoginModal();
        return;
    }
    
    // Reset form
    selectedRating = 0;
    isAnonymous = false;
    privacyAccepted = false;
    
    if (reviewForm) reviewForm.reset();
    updateRatingStars(0);
    
    if (anonymousToggle) anonymousToggle.classList.remove('active');
    if (privacyToggle) privacyToggle.classList.remove('active');
    if (submitBtn) submitBtn.disabled = true;
    
    if (reviewFormModal) {
        reviewFormModal.classList.remove('hidden');
    }
}

function setupReviewForm() {
    if (!reviewForm) return;
    
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const url = reviewUrlInput?.value.trim();
        const rating = selectedRating;
        const review = reviewText?.value.trim() || '';
        
        // Validation checks
        if (!url) {
            alert('Please enter a website URL'); // Temporary alert
            showToast('❌ Please enter a website URL', 'error');
            return;
        }
        
        if (!rating) {
            alert('Please select a rating'); // Temporary alert
            showToast('⭐ Please select a rating (click on the stars)', 'error');
            return;
        }
        
        if (!review) {
            alert('Please write a review'); // Temporary alert
            showToast('📝 Please write a review', 'error');
            return;
        }
        
        if (!privacyAccepted) {
            alert('Please accept the Privacy Policy'); // Temporary alert
            showToast('📋 Please accept the Privacy Policy to continue', 'error');
            return;
        }
        
        if (!currentUser) {
            showToast('🔐 Please sign in to post a review', 'error');
            showLoginModal();
            return;
        }
        
        const submitBtnElem = submitBtn;
        const originalText = submitBtnElem?.innerHTML || 'Submit';
        if (submitBtnElem) {
            submitBtnElem.innerHTML = '<span class="btn-text">Submitting...</span><span class="btn-icon">⏳</span>';
            submitBtnElem.disabled = true;
        }
        
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
                body: JSON.stringify({ 
                    website_id: websiteId, 
                    rate: rating, 
                    review: review || null 
                })
            });
            
            if (reviewResponse.ok) {
                showToast(isAnonymous ? '✅ Your anonymous review has been recorded!' : '✅ Your review has been recorded!', 'success');
                
                // Close modal
                if (reviewFormModal) {
                    reviewFormModal.classList.add('hidden');
                }
                
                if (reviewForm) reviewForm.reset();
                selectedRating = 0;
                isAnonymous = false;
                privacyAccepted = false;
                updateRatingStars(0);
                if (anonymousToggle) anonymousToggle.classList.remove('active');
                if (privacyToggle) privacyToggle.classList.remove('active');
                if (submitBtn) submitBtn.disabled = true;
                
                // Reload reviews
                await loadUserReviews();
            } else {
                const error = await reviewResponse.json();
                showToast(error.error || 'Failed to submit review', 'error');
            }
        } catch (error) {
            console.error('Review submission error:', error);
            showToast(error.message || 'Failed to submit review', 'error');
        } finally {
            if (submitBtnElem) {
                submitBtnElem.innerHTML = originalText;
                submitBtnElem.disabled = false;
            }
            checkSubmitEnabled();
        }
    });
}

// Load only current user's reviews
async function loadUserReviews() {
    console.log('loadUserReviews called, currentUser:', currentUser); // Debug
    if (!currentUser) {
        console.log('No current user, showing login message'); // Debug
        if (reviewsList) {
            reviewsList.innerHTML = '<div class="no-reviews">🔐 Please login to see your reviews</div>';
        }
        return;
    }
    
    try {
        const response = await fetch('/api/reviews');
        if (response.ok) {
            const data = await response.json();
            // Filter reviews for current user only
            const userReviews = (data.data || []).filter(review => review.user_id === currentUser.user_id);
            console.log(`Found ${userReviews.length} reviews for user`); // Debug
            displayReviews(userReviews);
        }
    } catch (error) {
        console.error('Failed to load user reviews:', error);
    }
}

function displayReviews(reviews) {
    if (!reviewsList) return;
    
    if (!currentUser) {
        reviewsList.innerHTML = '<div class="no-reviews">🔐 Please login to view your reviews</div>';
        return;
    }
    
    if (!reviews || reviews.length === 0) {
        reviewsList.innerHTML = '<div class="no-reviews">📝 You haven\'t posted any reviews yet. Click the + button to add your first review!</div>';
        return;
    }
    
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-card-header">
                <div class="reviewer-info" style="display: flex; align-items: center; gap: 8px;">
                    <div class="reviewer-avatar">${(currentUser?.username || 'U').charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="reviewer-name">${escapeHtml(currentUser?.username || 'You')}</div>
                        <div class="review-date">${new Date(review.created_at || Date.now()).toLocaleDateString()}</div>
                    </div>
                </div>
                <div class="review-rating">
                    ${generateStarRating(review.rate)}
                </div>
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

// Authentication Functions
async function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    console.log('Checking auth, token exists:', !!token); // Debug
    if (token) {
        try {
            const response = await fetch('/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    console.log('User logged in:', currentUser.username); // Debug
                    currentUser = data.data;
                    updateUIForLoggedInUser();
                    return true;
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
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.classList.add('show');
}

function showRegisterModal() {
    const registerModal = document.getElementById('registerModal');
    if (registerModal) registerModal.classList.add('show');
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
            await loadUserReviews(); //line added
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

    // Check if privacy policy is accepted
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

// Switch between login and register
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
    console.log('🔔 Toast called:', message, type); // Debug line
    
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="toast-content"><span class="toast-message">${escapeHtml(message)}</span></div>`;
    
    // Style directly to ensure visibility
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#212224';
    toast.style.color = 'white';
    toast.style.padding = '15px 20px';
    toast.style.borderRadius = '10px';
    toast.style.zIndex = '999999';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    toast.style.borderLeft = `4px solid ${type === 'success' ? '#1B7D4F' : type === 'error' ? '#dc3545' : '#C3A707'}`;
    
    document.body.appendChild(toast);
    console.log('✅ Toast appended to body'); // Debug line
    
    setTimeout(() => {
        toast.remove();
        console.log('Toast removed'); // Debug line
    }, 3000);
}

console.log('Reviews page loaded successfully');

// Make sure modal functions are global
window.showLoginModal = function() {
    console.log('showLoginModal called from reviews page');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('show');
    } else {
        console.error('Login modal not found on reviews page');
    }
};

window.showRegisterModal = function() {
    console.log('showRegisterModal called from reviews page');
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('show');
    } else {
        console.error('Register modal not found on reviews page');
    }
};

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

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (privacyPolicyModal && e.target === privacyPolicyModal) {
        privacyPolicyModal.classList.add('hidden');
        privacyPolicyModal.classList.remove('show');
    }
});