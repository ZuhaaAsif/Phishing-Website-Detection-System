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
const reviewsContainer = document.getElementById('reviewsContainer');
const userReviewsList = document.getElementById('userReviewsList');
const allReviewsList = document.getElementById('allReviewsList');
const addReviewSection = document.getElementById('addReviewSection');
const userReviewsSection = document.getElementById('userReviewsSection');
const addReviewBtn = document.getElementById('addReviewBtn');
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
        // Scroll to user reviews section
        if (userReviewsSection && currentDomain) {
            userReviewsSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            showToast('Please analyze a website first to see your reviews', 'info');
        }
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
    
    // Show add review button
    if (addReviewSection) {
        addReviewSection.classList.remove('hidden');
    }
    
    // Load user's reviews if we have a current domain
    if (currentDomain) {
        loadUserReviews(currentDomain);
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
    
    // Hide add review button
    if (addReviewSection) {
        addReviewSection.classList.add('hidden');
    }
    
    // Hide user reviews section
    if (userReviewsSection) {
        userReviewsSection.classList.add('hidden');
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
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('show'));
    });
});

window.addEventListener('click', (e) => {
    document.querySelectorAll('.modal').forEach(modal => {
        if (e.target === modal) modal.classList.remove('show');
    });
});

// Review Button Handlers
postReviewBtn.addEventListener('click', () => {
    window.location.href = '/reviews.html';
});

exploreBtn.addEventListener('click', () => {
    showToast('Enter a URL and click Authenticate to see reviews', 'info');
});

signInBtn.addEventListener('click', showLoginModal);

document.getElementById('logoutBtn')?.addEventListener('click', logout);

// Add Review Button
if (addReviewBtn) {
    addReviewBtn.addEventListener('click', showReviewModal);
}

// Authentication Modal Handlers
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
    
    // Reload reviews for current domain (now anonymous)
    if (currentDomain) {
        await loadAllReviews(currentDomain);
        if (userReviewsSection) userReviewsSection.classList.add('hidden');
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

async function loadAllReviews(domain) {
    if (!domain) return;
    
    try {
        const response = await fetch(`/api/reviews/domain/${encodeURIComponent(domain)}`);
        if (response.ok) {
            const data = await response.json();
            displayAllReviews(data.data || []);
        }
    } catch (error) {
        console.error('Failed to load reviews:', error);
    }
}

async function loadUserReviews(domain) {
    if (!domain || !currentUser) return;
    
    try {
        const response = await fetch(`/api/reviews/domain/${encodeURIComponent(domain)}`);
        if (response.ok) {
            const data = await response.json();
            const userReviews = (data.data || []).filter(r => r.user_id === currentUser.user_id);
            displayUserReviews(userReviews);
            
            if (userReviewsSection) {
                userReviewsSection.classList[userReviews.length > 0 ? 'remove' : 'add']('hidden');
            }
        }
    } catch (error) {
        console.error('Failed to load user reviews:', error);
    }
}

function displayAllReviews(reviews) {
    if (!allReviewsList) return;
    
    if (!reviews || reviews.length === 0) {
        allReviewsList.innerHTML = '<div class="no-reviews">No reviews yet. Be the first to review!</div>';
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
            ${review.review ? `<div class="review-text">${escapeHtml(review.review)}</div>` : ''}
        </div>
    `).join('');
}

function displayUserReviews(reviews) {
    if (!userReviewsList) return;
    
    if (!reviews || reviews.length === 0) {
        userReviewsList.innerHTML = '<div class="no-reviews">You haven\'t reviewed this website yet</div>';
        return;
    }
    
    userReviewsList.innerHTML = reviews.map(review => `
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
            ${review.review ? `<div class="review-text">${escapeHtml(review.review)}</div>` : ''}
        </div>
    `).join('');
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
    reviewsContainer.classList.add('hidden');
    
    try {
        if (!url.startsWith('http')) url = 'https://' + url;
        
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
            
            // Load reviews
            reviewsContainer.classList.remove('hidden');
            await loadAllReviews(currentDomain);
            if (currentUser) await loadUserReviews(currentDomain);
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
    
    document.getElementById('viewDetailsBtn')?.addEventListener('click', () => showDetailedAnalysis());
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showDetailedAnalysis() {
    if (!currentAnalysisData) return;
    
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="color: #667eea;">Detailed Analysis Report</h2>
            <hr>
            <h3>URL Information</h3>
            <p><strong>URL:</strong> ${escapeHtml(currentAnalysisData.url)}</p>
            <h3>Security Scores</h3>
            <ul>
                <li><strong>Overall Score:</strong> ${currentAnalysisData.authenticityScore}/100</li>
                <li><strong>URL Heuristics:</strong> ${currentAnalysisData.details.urlHeuristics.score}/100</li>
            </ul>
            <h3>Detected Issues</h3>
            ${currentAnalysisData.details.urlHeuristics.issues?.map(i => `<li>${escapeHtml(i)}</li>`).join('') || '<p>No major issues</p>'}
            <h3>Recommendations</h3>
            <ul>${currentAnalysisData.recommendations.map(rec => `<li>${escapeHtml(rec)}</li>`).join('')}</ul>
        </div>
    `;
    modal.classList.add('show');
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
    reviewsContainer.classList.add('hidden');
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