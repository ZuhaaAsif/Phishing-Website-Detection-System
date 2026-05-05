// DOM Elements
const urlInput = document.getElementById('urlInput');
const authenticateBtn = document.getElementById('authenticateBtn');
const resultsContainer = document.getElementById('resultsContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const homeBtn = document.getElementById('homeBtn');
const exampleUrls = document.querySelectorAll('.example-url');
const modal = document.getElementById('detailsModal');
const postReviewBtn = document.getElementById('postReviewBtn');
const exploreBtn = document.getElementById('exploreBtn');
const signInBtn = document.getElementById('signInBtn');
// const reviewsContainer = document.getElementById('reviewsContainer');
// const userReviewsList = document.getElementById('userReviewsList');
// const allReviewsList = document.getElementById('allReviewsList');
// const addReviewSection = document.getElementById('addReviewSection');
// const userReviewsSection = document.getElementById('userReviewsSection');
// const addReviewBtn = document.getElementById('addReviewBtn');
const profileTrigger = document.getElementById('profileTrigger');
const profileDropdown = document.getElementById('profileDropdown');
const avatarText = document.getElementById('avatarText');
const dropdownAvatarText = document.getElementById('dropdownAvatarText');
const dropdownUsername = document.getElementById('dropdownUsername');
const dropdownEmail = document.getElementById('dropdownEmail');
const myReviewsBtn = document.getElementById('myReviewsBtn');
const settingsBtn = document.getElementById('settingsBtn');
const quizBtn = document.getElementById("quizBtn");
const quizContainer = document.getElementById("quizContainer");
const mainContent = document.querySelector(".hero-section");

let currentAnalysisData = null;
let currentUser = null;
let selectedRating = 0;
let currentDomain = null;
let quizData = [];

// ======================== HOME ICON ANIMATION ========================
function setActiveTab() {
    const currentPage = window.location.pathname;
    const postReviewBtn = document.getElementById('postReviewBtn');
    const exploreBtn = document.getElementById('exploreBtn');
    const homeIconOutline = document.getElementById('homeIconOutline');
    const homeIconEmoji = document.getElementById('homeIconEmoji');
    
    if (postReviewBtn) postReviewBtn.classList.remove('active');
    if (exploreBtn) exploreBtn.classList.remove('active');
    
    if (currentPage === '/' || currentPage === '/index.html') {
        if (homeIconOutline && homeIconEmoji) {
            homeIconOutline.classList.remove('hidden');
            homeIconEmoji.classList.add('hidden');
        }
    } else if (currentPage === '/reviews.html') {
        if (postReviewBtn) postReviewBtn.classList.add('active');
        if (homeIconOutline && homeIconEmoji) {
            homeIconOutline.classList.add('hidden');
            homeIconEmoji.classList.remove('hidden');
        }
    } else if (currentPage === '/explore.html') {
        if (exploreBtn) exploreBtn.classList.add('active');
        if (homeIconOutline && homeIconEmoji) {
            homeIconOutline.classList.add('hidden');
            homeIconEmoji.classList.remove('hidden');
        }
    }
}

// Support for SPA navigation (if any)
const originalPushState = history.pushState;
history.pushState = function() {
    originalPushState.apply(this, arguments);
    setActiveTab();
};
window.addEventListener('popstate', setActiveTab);
// ====================================================================
// Check for existing session on load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupReviewForm();
    setActiveTab();
});

quizBtn.addEventListener("click", () => {
  mainContent.style.display = "none";
  quizContainer.classList.remove("hidden");

  loadQuiz(); // your quiz logic function
});

document.getElementById("quitQuizBtn").addEventListener("click", () => {
  quizContainer.classList.add("hidden");
  mainContent.style.display = "block";
});

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userInfo = document.getElementById('userInfo');
    const dropdown = document.getElementById('profileDropdown');
    
    if (userInfo && dropdown && !userInfo.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Profile trigger click handler
if (profileTrigger) {
    profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });
}

// My Reviews button handler
if (myReviewsBtn) {
    myReviewsBtn.addEventListener('click', () => {
        profileDropdown.classList.remove('show');
        showToast('Please analyze a website first to see your reviews', 'info');
    });
}

// Settings button handler
if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        profileDropdown.classList.remove('show');
        showToast('Settings feature coming soon!', 'info');
    });
}

// Logout button handler
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        profileDropdown.classList.remove('show');
        logout();
    });
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
    const avatarTextElem = document.getElementById('avatarText');
    const dropdownAvatarTextElem = document.getElementById('dropdownAvatarText');
    const dropdownUsernameElem = document.getElementById('dropdownUsername');
    const dropdownEmailElem = document.getElementById('dropdownEmail');
    
    if (userInfo && signInBtnElem && currentUser) {
        userInfo.classList.remove('hidden');
        signInBtnElem.classList.add('hidden');
        
        // Get display name and avatar letter
        const displayName = currentUser.username || currentUser.email.split('@')[0];
        const avatarLetter = displayName.charAt(0).toUpperCase();
        
        // Update navbar
        if (userNameSpan) userNameSpan.textContent = displayName;
        if (avatarTextElem) avatarTextElem.textContent = avatarLetter;
        
        // Update dropdown
        if (dropdownAvatarTextElem) dropdownAvatarTextElem.textContent = avatarLetter;
        if (dropdownUsernameElem) dropdownUsernameElem.textContent = displayName;
        if (dropdownEmailElem) dropdownEmailElem.textContent = currentUser.email;
    }
}

function updateUIForLoggedOutUser() {
    const userInfo = document.getElementById('userInfo');
    const signInBtnElem = document.getElementById('signInBtn');
    
    if (userInfo && signInBtnElem) {
        userInfo.classList.add('hidden');
        signInBtnElem.classList.remove('hidden');
    }
    
    // Close dropdown if open
    if (profileDropdown) {
        profileDropdown.classList.remove('show');
    }
    currentUser = null;
}

// Event Listeners
authenticateBtn.addEventListener('click', handleAuthentication);
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAuthentication();
});

exampleUrls.forEach(btn => {
    btn.addEventListener('click', () => {
        urlInput.value = btn.dataset.url;
        handleAuthentication();
    });
});

homeBtn.addEventListener('click', () => {
    resetToHome();
});

// Modal close handlers
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Find the parent modal and close only that one
        const modalElement = btn.closest('.modal');
        if (modalElement) {
            modalElement.classList.remove('show');
            modalElement.classList.add('hidden');
            modalElement.style.display = '';
        }
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    document.querySelectorAll('.modal').forEach(modalElement => {
        if (e.target === modalElement) {
            modalElement.classList.remove('show');
            modalElement.classList.add('hidden');
            modalElement.style.display = '';
        }
    });
});

// Review Button Handlers
postReviewBtn.addEventListener('click', () => {
    window.location.href = '/reviews.html';
});

exploreBtn.addEventListener('click', () => {
    window.location.href = '/explore.html';
});

signInBtn.addEventListener('click', showLoginModal);

document.getElementById('logoutBtn')?.addEventListener('click', logout);

// Authentication Modal Handlers
function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.classList.remove('hidden');
        loginModal.classList.add('show');
    }
}

function showRegisterModal() {
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        registerModal.classList.remove('hidden');
        registerModal.classList.add('show');
    }
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
            
            // Reload reviews for current domain
            if (currentDomain) {
                await loadAllReviews(currentDomain);
                await loadUserReviews(currentDomain);
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

async function logout() {
    localStorage.removeItem('authToken');
    currentUser = null;
    updateUIForLoggedOutUser();
    showToast('Logged out successfully', 'success');
    
    // Close dropdown if open
    if (profileDropdown) {
        profileDropdown.classList.remove('show');
    }
}

// Review Functions
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
                if (currentDomain === domain) {
                    await loadAllReviews(domain);
                    await loadUserReviews(domain);
                }
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

function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star empty"></i>';
    }
    return stars;
}

// Main authentication handler
async function handleAuthentication() {
    let url = urlInput.value.trim();
    if (!url) {
        showToast('Please enter a website URL', 'error');
        return;
    }
    
    showLoading(true);
    hideResults();
    
    try {
        if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
        
        // Validate URL format
        try {
            new URL(url);
        } catch (e) {
            showToast('Please enter a valid website URL (e.g., google.com, https://example.com)', 'error');
            showLoading(false);
            return;
        }

        const response = await fetch('/api/frontend/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentAnalysisData = result.data;
            currentDomain = new URL(url).hostname;
            displayResults(result.data);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function displayResults(data) {
    const score = data.authenticityScore;
    const riskStatus = data.riskStatus;
    let scoreColor = score >= 70 ? '#00c851' : score >= 40 ? '#ffbb33' : '#ff4444';
    
    // Store data globally for access
    window.currentAnalysisData = data;

    const html = `
        <div class="score-card">
            <div style="text-align: center;">
                <div class="score-value" style="color: ${scoreColor}; font-size: 72px;">${score}</div>
                <div style="font-size: 14px; color: #666;">out of 100</div>
            </div>
            <div class="risk-status ${riskStatus.toLowerCase()}" style="text-align: center; margin: 20px auto;">
                ${data.riskIcon} ${riskStatus} Website
            </div>
            <p style="text-align: center; color: #666;">${escapeHtml(data.riskMessage)}</p>
        </div>
        <div class="details-section">
            <h3>📊 Analysis Summary</h3>
            <div class="detail-item">
                <div class="detail-title">🔍 URL Heuristics Score</div>
                <div class="detail-message"><strong>${data.details.urlHeuristics.score}/100</strong><br>${data.details.urlHeuristics.issueCount} issues detected</div>
            </div>
            <div class="detail-item">
                <div class="detail-title">🛡️ Google Safe Browsing</div>
                <div class="detail-message">Status: <strong>${data.details.googleSafeBrowsing.status === 'clean' ? '✅ Clean' : '⚠️ Flagged'}</strong><br>${escapeHtml(data.details.googleSafeBrowsing.message)}</div>
            </div>
        </div>
        <div style="margin-top: 20px; text-align: center;">
            <button class="view-details-btn" id="viewDetailsBtn">🔍 View Detailed Analysis</button>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
    resultsContainer.classList.remove('hidden');

    const viewDetailsBtn = document.getElementById('viewDetailsBtn');
    if (viewDetailsBtn) {
        const newBtn = viewDetailsBtn.cloneNode(true);
        viewDetailsBtn.parentNode.replaceChild(newBtn, viewDetailsBtn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.showDetailedAnalysis();
        });
    }

    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

window.showDetailedAnalysis = function() {
    console.log('showDetailedAnalysis called');
    
    if (!currentAnalysisData) {
        showToast('No analysis data available', 'error');
        return;
    }
    
    const data = currentAnalysisData;
    const score = data.authenticityScore;
    
    // Determine score color and grade
    let scoreColor = '#dc3545';
    let scoreGrade = 'Dangerous';
    let scoreMessage = 'This website shows multiple red flags. Avoid entering personal information.';
    if (score >= 80) {
        scoreColor = '#1B7D4F';
        scoreGrade = 'Excellent';
        scoreMessage = 'This website appears highly secure and trustworthy.';
    } else if (score >= 65) {
        scoreColor = '#28a745';
        scoreGrade = 'Good';
        scoreMessage = 'This website is generally safe but exercise normal caution.';
    } else if (score >= 50) {
        scoreColor = '#C3A707';
        scoreGrade = 'Average';
        scoreMessage = 'This website has some concerns. Verify before proceeding.';
    } else if (score >= 35) {
        scoreColor = '#fd7e14';
        scoreGrade = 'Poor';
        scoreMessage = 'This website shows suspicious signs. Proceed with caution.';
    } else {
        scoreColor = '#dc3545';
        scoreGrade = 'Critical';
        scoreMessage = '⚠️ EXTREME CAUTION: This website exhibits multiple phishing indicators!';
    }
    
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <div style="padding: 0;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1B7D4F 0%, #066839 100%); padding: 25px; border-radius: 15px 15px 0 0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="color: white; margin: 0; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-shield-alt"></i> Detailed Security Analysis
                        </h2>
                        <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">
                            Comprehensive website security report generated by WebAware
                        </p>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 48px; font-weight: bold; color: white;">${score}</div>
                        <div style="font-size: 12px; color: rgba(255,255,255,0.8);">out of 100</div>
                    </div>
                </div>
            </div>
            
            <div style="padding: 25px;">
                <!-- Grade Card -->
                <div style="background: ${scoreColor}15; border: 2px solid ${scoreColor}; border-radius: 12px; padding: 20px; margin-bottom: 25px; text-align: center;">
                    <div style="font-size: 14px; color: #666; margin-bottom: 5px;">Security Rating</div>
                    <div style="font-size: 32px; font-weight: bold; color: ${scoreColor};">${scoreGrade}</div>
                    <div style="font-size: 14px; color: ${scoreColor}; margin-top: 8px;">${scoreMessage}</div>
                </div>
                
                <!-- URL Information Card -->
                <div style="background: #212224; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                        <i class="fas fa-link" style="color: #C3A707;"></i>
                        <strong style="color: white;">Analyzed URL</strong>
                    </div>
                    <code style="background: #494F52; padding: 10px 12px; border-radius: 8px; display: block; word-break: break-all; color: #D9D9D9; font-size: 13px;">
                        ${escapeHtml(data.url)}
                    </code>
                    <div style="display: flex; gap: 20px; margin-top: 12px; font-size: 12px; color: #D9D9D9;">
                        <span><i class="far fa-calendar-alt"></i> ${new Date(data.analyzedAt).toLocaleString()}</span>
                        <span><i class="fas fa-chart-line"></i> Real-time Analysis</span>
                    </div>
                </div>
                
                <!-- Score Breakdown -->
                <h3 style="color: #C3A707; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-chart-pie"></i> Security Score Breakdown
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
                    <div style="background: #212224; border-radius: 10px; padding: 15px; text-align: center;">
                        <div style="font-size: 28px; font-weight: bold; color: #C3A707;">${data.details.urlHeuristics.score}/100</div>
                        <div style="font-size: 12px; color: #D9D9D9; margin-top: 5px;">
                            <i class="fas fa-code-branch"></i> URL Structure
                        </div>
                        <div style="font-size: 11px; color: #999; margin-top: 8px;">Analyzes domain patterns, length, special characters</div>
                    </div>
                    <div style="background: #212224; border-radius: 10px; padding: 15px; text-align: center;">
                        <div style="font-size: 28px; font-weight: bold; color: ${data.details.googleSafeBrowsing.status === 'clean' ? '#1B7D4F' : '#dc3545'}">
                            ${data.details.googleSafeBrowsing.status === 'clean' ? '✅ Clean' : '⚠️ Flagged'}
                        </div>
                        <div style="font-size: 12px; color: #D9D9D9; margin-top: 5px;">
                            <i class="fas fa-shield-virus"></i> Google Safe Browsing
                        </div>
                        <div style="font-size: 11px; color: #999; margin-top: 8px;">Cross-referenced with Google's threat database</div>
                    </div>
                    <div style="background: #212224; border-radius: 10px; padding: 15px; text-align: center;">
                        <div style="font-size: 28px; font-weight: bold; color: ${data.authenticityScore >= 60 ? '#1B7D4F' : '#dc3545'}">
                            ${data.riskStatus}
                        </div>
                        <div style="font-size: 12px; color: #D9D9D9; margin-top: 5px;">
                            <i class="fas fa-flag-checkered"></i> Risk Level
                        </div>
                        <div style="font-size: 11px; color: #999; margin-top: 8px;">Overall risk assessment based on all factors</div>
                    </div>
                </div>
                
                <!-- Detected Issues Section -->
                <div style="background: #212224; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                        <i class="fas fa-exclamation-triangle" style="color: ${data.details.urlHeuristics.issues?.length > 0 ? '#C3A707' : '#1B7D4F'};"></i>
                        <strong style="color: white;">Security Issues Detected</strong>
                        <span style="background: ${data.details.urlHeuristics.issues?.length > 0 ? '#C3A707' : '#1B7D4F'}; color: white; padding: 2px 10px; border-radius: 20px; font-size: 11px;">
                            ${data.details.urlHeuristics.issueCount || 0} found
                        </span>
                    </div>
                    ${data.details.urlHeuristics.issues && data.details.urlHeuristics.issues.length > 0 
                        ? `<div style="display: flex; flex-direction: column; gap: 10px;">
                            ${data.details.urlHeuristics.issues.map(issue => `
                                <div style="background: rgba(220, 53, 69, 0.1); border-left: 3px solid #dc3545; padding: 12px; border-radius: 8px;">
                                    <div style="color: #dc3545; font-weight: 500;">⚠️ Critical Finding</div>
                                    <div style="color: #D9D9D9; font-size: 13px; margin-top: 5px;">${escapeHtml(issue)}</div>
                                </div>
                            `).join('')}
                          </div>`
                        : `<div style="background: rgba(27, 125, 79, 0.1); border-left: 3px solid #1B7D4F; padding: 15px; border-radius: 8px; display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-check-circle" style="color: #1B7D4F; font-size: 24px;"></i>
                            <div>
                                <div style="color: #1B7D4F; font-weight: 500;">No Security Issues Found</div>
                                <div style="color: #D9D9D9; font-size: 13px;">This website passed all security checks and appears legitimate.</div>
                            </div>
                          </div>`
                    }
                </div>
                
                <!-- Google Safe Browsing Details -->
                <div style="background: #212224; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                        <i class="fas fa-google" style="color: #C3A707;"></i>
                        <strong style="color: white;">Google Safe Browsing Status</strong>
                    </div>
                    <div style="background: ${data.details.googleSafeBrowsing.status === 'clean' ? 'rgba(27, 125, 79, 0.1)' : 'rgba(220, 53, 69, 0.1)'}; border-radius: 8px; padding: 12px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            ${data.details.googleSafeBrowsing.status === 'clean' 
                                ? '<i class="fas fa-shield-alt" style="color: #1B7D4F; font-size: 20px;"></i>' 
                                : '<i class="fas fa-skull-crossbones" style="color: #dc3545; font-size: 20px;"></i>'}
                            <div>
                                <div style="color: white; font-weight: 500;">
                                    ${data.details.googleSafeBrowsing.status === 'clean' ? 'Not Flagged' : 'Flagged as Malicious'}
                                </div>
                                <div style="color: #D9D9D9; font-size: 13px; margin-top: 4px;">
                                    ${escapeHtml(data.details.googleSafeBrowsing.message)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Recommendations Section -->
                <h3 style="color: #C3A707; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-lightbulb"></i> Security Recommendations
                </h3>
                <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                    ${data.recommendations.map(rec => {
                        let icon = 'ℹ️';
                        let bgColor = 'rgba(195, 167, 7, 0.1)';
                        let borderColor = '#C3A707';
                        if (rec.includes('NOT') || rec.includes('not') || rec.includes('Avoid') || rec.includes('Do NOT')) {
                            icon = '🚫';
                            bgColor = 'rgba(220, 53, 69, 0.1)';
                            borderColor = '#dc3545';
                        } else if (rec.includes('caution') || rec.includes('suspicious')) {
                            icon = '⚠️';
                            bgColor = 'rgba(195, 167, 7, 0.1)';
                            borderColor = '#C3A707';
                        } else if (rec.includes('safe') || rec.includes('legitimate')) {
                            icon = '✅';
                            bgColor = 'rgba(27, 125, 79, 0.1)';
                            borderColor = '#1B7D4F';
                        } else if (rec.includes('Always keep')) {
                            icon = '🔄';
                        }
                        return `
                            <div style="background: ${bgColor}; border-left: 3px solid ${borderColor}; border-radius: 8px; padding: 12px 15px; display: flex; align-items: flex-start; gap: 12px;">
                                <span style="font-size: 18px;">${icon}</span>
                                <span style="color: #D9D9D9; line-height: 1.5;">${escapeHtml(rec)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <!-- Additional Tips -->
                <div style="background: linear-gradient(135deg, #1B7D4F20 0%, #06683920 100%); border-radius: 12px; padding: 18px; margin-top: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                        <i class="fas fa-info-circle" style="color: #C3A707;"></i>
                        <strong style="color: white;">Pro Tips for Safe Browsing</strong>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #D9D9D9;">
                            <i class="fas fa-lock" style="color: #1B7D4F;"></i> Always check for HTTPS
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #D9D9D9;">
                            <i class="fas fa-search" style="color: #1B7D4F;"></i> Verify domain spelling
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #D9D9D9;">
                            <i class="fas fa-shield-alt" style="color: #1B7D4F;"></i> Use a trusted antivirus
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #D9D9D9;">
                            <i class="fas fa-clock" style="color: #1B7D4F;"></i> Check domain age (new = suspicious)
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #212224; text-align: center; font-size: 11px; color: #666;">
                    <i class="fas fa-robot"></i> WebAware Security Scanner v2.0 | Real-time threat detection | Report generated ${new Date().toLocaleString()}
                </div>
            </div>
        </div>
    `;
    
    const modalElem = document.getElementById('detailsModal');
    if (modalElem) {
        modalElem.classList.remove('hidden');
        modalElem.classList.add('show');
        modalElem.style.display = 'flex';
    }
};

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

function showLoading(show) {
    if (show) {
        loadingIndicator.classList.remove('hidden');
        authenticateBtn.disabled = true;
        authenticateBtn.innerHTML = '<span>⏳ Analyzing...</span>';
    } else {
        loadingIndicator.classList.add('hidden');
        authenticateBtn.disabled = false;
        authenticateBtn.innerHTML = '<span>Authenticate</span>';
    }
}

function hideResults() {
    resultsContainer.classList.add('hidden');
}

function resetToHome() {
    urlInput.value = '';
    hideResults();
    urlInput.focus();
    currentAnalysisData = null;
    currentDomain = null;
}

function resetForms() {
    ['loginForm', 'registerForm', 'reviewForm'].forEach(id => {
        document.getElementById(id)?.reset();
    });
    selectedRating = 0;
    updateRatingStars(0);
}

console.log('WebAware frontend loaded successfully');

// ── Paste this block at the bottom of public/js/main.js ──────────────────────
// It replaces the empty loadQuiz() stub and adds all quiz rendering logic.

// State
let quizCurrentIndex = 0;
let quizFoundFlags   = [];   // flag_ids found in the current challenge

function loadQuiz() {
  fetch("/api/quiz/challenges")
    .then(res => res.json())
    .then(data => {
      quizData = data.data || data;
      quizCurrentIndex = 0;
      startQuiz();
    })
    .catch(err => {
      console.error("Quiz load error:", err);
      document.getElementById("quizContainer").innerHTML =
        "<p style='color:red'>Failed to load quiz. Check console.</p>";
    });
}

function startQuiz() {
  if (!quizData || quizData.length === 0) {
    document.getElementById("quizContainer").innerHTML =
      "<p>No quiz challenges found.</p>";
    return;
  }
  renderChallenge();
}

function renderChallenge() {
  const challenge = quizData[quizCurrentIndex];
  quizFoundFlags = [];

  document.getElementById("quizProgress").textContent =
    `Challenge ${quizCurrentIndex + 1} of ${quizData.length}: ${challenge.title}`;

  document.getElementById("quizFeedback").textContent = "";
  document.getElementById("quizFeedback").style.cssText = "";

  const game = document.getElementById("quizGame");
  game.querySelectorAll(".quiz-flag").forEach(el => el.remove());

  // Remove any old image click listener by cloning the element
  const img = document.getElementById("quizImage");
  const newImg = img.cloneNode(true);
  img.parentNode.replaceChild(newImg, img);

  newImg.onload = () => {
    game.querySelectorAll(".quiz-flag").forEach(el => el.remove());

    // Pre-create hidden highlight overlays for each flag
    challenge.red_flags.forEach(flag => {
      const div = document.createElement("div");
      div.className = "quiz-flag";
      div.dataset.flagId = flag.flag_id;
      Object.assign(div.style, {
        position:       "absolute",
        border:         "3px solid green",
        background:     "rgba(0, 200, 0, 0.2)",
        pointerEvents:  "none",       // invisible to clicks — image handles them
        display:        "none",       // hidden until correctly clicked
        left:   (flag.x_percent     / 100) * newImg.clientWidth  + "px",
        top:    (flag.y_percent     / 100) * newImg.clientHeight + "px",
        width:  (flag.width_percent  / 100) * newImg.clientWidth  + "px",
        height: (flag.height_percent / 100) * newImg.clientHeight + "px",
      });
      game.appendChild(div);
    });

    // One click listener on the whole image
    newImg.style.cursor = "crosshair";
    newImg.addEventListener("click", (e) => {
      const rect = newImg.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left)  / newImg.clientWidth)  * 100;
      const yPct = ((e.clientY - rect.top)   / newImg.clientHeight) * 100;
      handleQuizClick(xPct, yPct, challenge, game);
    });
  };

  const path = challenge.screenshot_url.replace("/public", "");
  newImg.src = window.location.origin + path;
}

function handleQuizClick(xPct, yPct, challenge, game) {
  const fb = document.getElementById("quizFeedback");

  // Check if click falls inside any flag bounding box
  const hitFlag = challenge.red_flags.find(flag =>
    xPct >= flag.x_percent &&
    xPct <= flag.x_percent + flag.width_percent &&
    yPct >= flag.y_percent &&
    yPct <= flag.y_percent + flag.height_percent
  );

  if (!hitFlag) {
    fb.textContent = "❌ Nothing suspicious there — keep looking!";
    fb.style.cssText = "background:#f8d7da;color:#721c24;padding:10px;border-radius:8px;margin-top:12px;";
    return;
  }

  if (quizFoundFlags.includes(hitFlag.flag_id)) {
    fb.textContent = "👀 Already found this one!";
    fb.style.cssText = "background:#fff3cd;color:#856404;padding:10px;border-radius:8px;margin-top:12px;";
    return;
  }

  // Correct new find — reveal the highlight overlay
  quizFoundFlags.push(hitFlag.flag_id);
  const overlay = game.querySelector(`.quiz-flag[data-flag-id="${hitFlag.flag_id}"]`);
  if (overlay) overlay.style.display = "block";

  fb.textContent = `✅ ${hitFlag.label}: ${hitFlag.explanation || ""}`;
  fb.style.cssText = "background:#d4edda;color:#155724;padding:10px;border-radius:8px;margin-top:12px;";

  if (quizFoundFlags.length === challenge.red_flags.length) {
    fb.textContent += "  🎉 All flags found!";
  }
}

// Wire up Next / Quit buttons (already in HTML, just override handlers)
document.getElementById("nextQuizBtn").addEventListener("click", () => {
  if (quizCurrentIndex < quizData.length - 1) {
    quizCurrentIndex++;
    renderChallenge();
  } else {
    // Quiz complete
    quizContainer.classList.add("hidden");
    mainContent.style.display = "";
    showToast("🛡️ Quiz complete! Great job spotting those phishing attempts.", "success");
  }
});

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