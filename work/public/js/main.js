// ======================== DOM ELEMENTS ========================
// Grabbed with null safety so the file works on all pages (index, reviews, explore, quiz)
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

// ======================== STATE ========================
let currentAnalysisData = null;
let currentUser = null;
let selectedRating = 0;
let currentDomain = null;

// Quiz state
let quizData = [];
let quizCurrentIndex = 0;
let quizFoundFlags = [];
let quizChallengeComplete = false; // true once all flags found OR skip used

// ======================== HOME ICON / TAB ========================
function setActiveTab() {
    const currentPage = window.location.pathname;
    const postReviewBtnEl = document.getElementById('postReviewBtn');
    const exploreBtnEl = document.getElementById('exploreBtn');
    const homeIconOutline = document.getElementById('homeIconOutline');
    const homeIconEmoji = document.getElementById('homeIconEmoji');

    if (postReviewBtnEl) postReviewBtnEl.classList.remove('active');
    if (exploreBtnEl) exploreBtnEl.classList.remove('active');

    if (currentPage === '/' || currentPage === '/index.html') {
        if (homeIconOutline && homeIconEmoji) {
            homeIconOutline.classList.remove('hidden');
            homeIconEmoji.classList.add('hidden');
        }
    } else if (currentPage === '/reviews.html') {
        if (postReviewBtnEl) postReviewBtnEl.classList.add('active');
        if (homeIconOutline && homeIconEmoji) {
            homeIconOutline.classList.add('hidden');
            homeIconEmoji.classList.remove('hidden');
        }
    } else if (currentPage === '/explore.html') {
        if (exploreBtnEl) exploreBtnEl.classList.add('active');
        if (homeIconOutline && homeIconEmoji) {
            homeIconOutline.classList.add('hidden');
            homeIconEmoji.classList.remove('hidden');
        }
    }
}

// Support for SPA navigation
const originalPushState = history.pushState;
history.pushState = function () {
    originalPushState.apply(this, arguments);
    setActiveTab();
};
window.addEventListener('popstate', setActiveTab);

// ======================== DOMContentLoaded ========================
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    if (typeof setupReviewForm === 'function') setupReviewForm();
    setActiveTab();

    // Auto-load quiz when on quiz.html
    if (window.location.pathname === '/quiz.html') {
        loadQuiz();
    }
});

// ======================== NAV BUTTON LISTENERS (null-guarded) ========================
// Quiz button — navigates to quiz.html
if (quizBtn) {
    quizBtn.addEventListener("click", () => {
        window.location.href = '/quiz.html';
    });
}

// Quit quiz button — navigates back home
const quitQuizBtn = document.getElementById("quitQuizBtn");
if (quitQuizBtn) {
    quitQuizBtn.addEventListener("click", () => {
        window.location.href = '/';
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
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
        if (profileDropdown) profileDropdown.classList.toggle('show');
    });
}

// My Reviews button — navigates to reviews page
if (myReviewsBtn) {
    myReviewsBtn.addEventListener('click', () => {
        if (profileDropdown) profileDropdown.classList.remove('show');
        window.location.href = '/reviews.html';
    });
}

// Settings button handler
if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        if (profileDropdown) profileDropdown.classList.remove('show');
        showToast('Settings feature coming soon!', 'info');
    });
}

// Logout button handler
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (profileDropdown) profileDropdown.classList.remove('show');
        logout();
    });
}

// Auth-only listeners (only exist on index.html)
if (authenticateBtn) {
    authenticateBtn.addEventListener('click', handleAuthentication);
}
if (urlInput) {
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAuthentication();
    });
}
exampleUrls.forEach(btn => {
    btn.addEventListener('click', () => {
        if (urlInput) urlInput.value = btn.dataset.url;
        handleAuthentication();
    });
});
if (homeBtn) {
    homeBtn.addEventListener('click', () => resetToHome());
}

// Modal close handlers
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
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

if (postReviewBtn) {
    postReviewBtn.addEventListener('click', () => { window.location.href = '/reviews.html'; });
}
if (exploreBtn) {
    exploreBtn.addEventListener('click', () => { window.location.href = '/explore.html'; });
}
if (signInBtn) {
    signInBtn.addEventListener('click', showLoginModal);
}

document.getElementById('logoutBtn')?.addEventListener('click', logout);

// ======================== AUTH ========================
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
    const ddAvatarText = document.getElementById('dropdownAvatarText');
    const ddUsername = document.getElementById('dropdownUsername');
    const ddEmail = document.getElementById('dropdownEmail');

    if (userInfo && signInBtnElem && currentUser) {
        userInfo.classList.remove('hidden');
        signInBtnElem.classList.add('hidden');

        const displayName = currentUser.username || currentUser.email.split('@')[0];
        const avatarLetter = displayName.charAt(0).toUpperCase();

        if (userNameSpan) userNameSpan.textContent = displayName;
        if (avatarTextElem) avatarTextElem.textContent = avatarLetter;
        if (ddAvatarText) ddAvatarText.textContent = avatarLetter;
        if (ddUsername) ddUsername.textContent = displayName;
        if (ddEmail) ddEmail.textContent = currentUser.email;
    }
}

function updateUIForLoggedOutUser() {
    const userInfo = document.getElementById('userInfo');
    const signInBtnElem = document.getElementById('signInBtn');
    if (userInfo && signInBtnElem) {
        userInfo.classList.add('hidden');
        signInBtnElem.classList.remove('hidden');
    }
    if (profileDropdown) profileDropdown.classList.remove('show');
    currentUser = null;
}

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

            // Reload reviews for current domain if one is active
            if (currentDomain) {
                if (typeof loadAllReviews === 'function') await loadAllReviews(currentDomain);
                if (typeof loadUserReviews === 'function') await loadUserReviews(currentDomain);
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

    if (password !== confirmPassword) { showToast('Passwords do not match', 'error'); return; }

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
    if (profileDropdown) {
        profileDropdown.classList.remove('show');
    }
}

// ======================== REVIEW FORM ========================
function showReviewModal() {
    if (!currentUser) { showToast('Please sign in to post a review', 'info'); showLoginModal(); return; }
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
        star.addEventListener('mouseenter', () => updateRatingStars(parseInt(star.dataset.rating)));
        star.addEventListener('mouseleave', () => updateRatingStars(selectedRating));
    });

    document.getElementById('reviewForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = document.getElementById('reviewWebsiteUrl').value;
        const rating = parseInt(document.getElementById('reviewRating').value);
        const review = document.getElementById('reviewText').value;
        if (!url || !rating) { showToast('Please fill all required fields', 'error'); return; }

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
                    body: JSON.stringify({ website_name: domain, url: cleanUrl, domain })
                });
                const createData = await createResponse.json();
                websiteId = createData.data?.website_id;
            }

            // Submit review
            const reviewResponse = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ website_id: websiteId, rate: rating, review: review || null })
            });
            if (reviewResponse.ok) {
                showToast('Your review has been recorded!', 'success');
                document.getElementById('reviewModal').classList.remove('show');
                document.getElementById('reviewForm').reset();
                selectedRating = 0;
                updateRatingStars(0);

                // Reload reviews for current domain if active
                if (currentDomain === domain) {
                    if (typeof loadAllReviews === 'function') await loadAllReviews(domain);
                    if (typeof loadUserReviews === 'function') await loadUserReviews(domain);
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
    document.querySelectorAll('.rating-stars i').forEach((star, index) => {
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

// ======================== AUTHENTICATION ANALYSIS ========================
async function handleAuthentication() {
    if (!urlInput) return;
    let url = urlInput.value.trim();
    if (!url) { showToast('Please enter a website URL', 'error'); return; }

    showLoading(true);
    hideResults();

    try {
        if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;

        // First check if website exists
        try {
            const existsResponse = await fetch('/api/frontend/check-exists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url })
            });
            const existsData = await existsResponse.json();
            console.log('Exists check response:', existsData);

            if (!existsData.exists) {
                showToast(`Unable to reach "${url}". Please check the URL and try again.`, 'error');
                showLoading(false);
                return;
            }
        } catch (existsError) {
            console.error('Exists check failed:', existsError);
            // Continue anyway - don't block on existence check
        }

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
            body: JSON.stringify({ url })
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
    if (!resultsContainer) return;
    const score = data.authenticityScore;
    const riskStatus = data.riskStatus;
    const scoreColor = score >= 70 ? '#00c851' : score >= 40 ? '#ffbb33' : '#ff4444';
    window.currentAnalysisData = data;

    resultsContainer.innerHTML = `
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
        </div>`;

    resultsContainer.classList.remove('hidden');

    const viewDetailsBtn = document.getElementById('viewDetailsBtn');
    if (viewDetailsBtn) {
        const newBtn = viewDetailsBtn.cloneNode(true);
        viewDetailsBtn.parentNode.replaceChild(newBtn, viewDetailsBtn);
        newBtn.addEventListener('click', (e) => { e.preventDefault(); window.showDetailedAnalysis(); });
    }
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

window.showDetailedAnalysis = function () {
    console.log('showDetailedAnalysis called');

    if (!currentAnalysisData) { showToast('No analysis data available', 'error'); return; }

    const data = currentAnalysisData;
    const score = data.authenticityScore;

    // Determine score color and grade
    let scoreColor = '#dc3545';
    let scoreGrade = 'Dangerous';
    let scoreMessage = 'This website shows multiple red flags. Avoid entering personal information.';
    if (score >= 80) { scoreColor = '#1B7D4F'; scoreGrade = 'Excellent'; scoreMessage = 'This website appears highly secure and trustworthy.'; }
    else if (score >= 65) { scoreColor = '#28a745'; scoreGrade = 'Good'; scoreMessage = 'This website is generally safe but exercise normal caution.'; }
    else if (score >= 50) { scoreColor = '#C3A707'; scoreGrade = 'Average'; scoreMessage = 'This website has some concerns. Verify before proceeding.'; }
    else if (score >= 35) { scoreColor = '#fd7e14'; scoreGrade = 'Poor'; scoreMessage = 'This website shows suspicious signs. Proceed with caution.'; }
    else { scoreColor = '#dc3545'; scoreGrade = 'Critical'; scoreMessage = '⚠️ EXTREME CAUTION: This website exhibits multiple phishing indicators!'; }

    const modalContent = document.getElementById('modalContent');
    if (!modalContent) return;

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
                        let icon = 'ℹ️', bgColor = 'rgba(195, 167, 7, 0.1)', borderColor = '#C3A707';
                        if (rec.includes('NOT') || rec.includes('not') || rec.includes('Avoid') || rec.includes('Do NOT')) {
                            icon = '🚫'; bgColor = 'rgba(220, 53, 69, 0.1)'; borderColor = '#dc3545';
                        } else if (rec.includes('caution') || rec.includes('suspicious')) {
                            icon = '⚠️';
                        } else if (rec.includes('safe') || rec.includes('legitimate')) {
                            icon = '✅'; bgColor = 'rgba(27, 125, 79, 0.1)'; borderColor = '#1B7D4F';
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

                <!-- Pro Tips -->
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

// ======================== UTILITIES ========================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type) {
    // Remove any existing toasts first to avoid stacking
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="toast-content"><span class="toast-message">${escapeHtml(message)}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showLoading(show) {
    if (!loadingIndicator || !authenticateBtn) return;
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
    if (resultsContainer) resultsContainer.classList.add('hidden');
}

function resetToHome() {
    if (urlInput) urlInput.value = '';
    hideResults();
    if (urlInput) urlInput.focus();
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

// ======================== PRIVACY POLICY ========================
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

console.log('WebAware frontend loaded successfully');

// ======================== QUIZ ========================

function loadQuiz() {
    fetch("/api/quiz/challenges", { cache: "reload" })
        .then(res => {
            if (!res.ok) throw new Error(`Quiz API response ${res.status}`);
            return res.json();
        })
        .then(data => {
            quizData = data.data || data;
            quizCurrentIndex = 0;
            startQuiz();
        })
        .catch(err => {
            console.error("Quiz load error:", err);
            const qc = document.getElementById("quizContainer");
            if (qc) qc.innerHTML = `<p style='color:red;padding:2rem;'>Failed to load quiz: ${err.message}. Check console.</p>`;
        });
}

function startQuiz() {
    if (!quizData || quizData.length === 0) {
        const qc = document.getElementById("quizContainer");
        if (qc) qc.innerHTML = "<p>No quiz challenges found.</p>";
        return;
    }

    quizChallengeComplete = false;
    renderChallenge();

    // Next Challenge — only advances when challenge is complete
    const nextBtn = document.getElementById("nextQuizBtn");
    if (nextBtn) {
        const fresh = nextBtn.cloneNode(true); // remove any old listeners
        nextBtn.parentNode.replaceChild(fresh, nextBtn);
        fresh.addEventListener("click", () => {
            if (!quizChallengeComplete) {
                showToast("Find all flags first — or use Skip / See Solution!", "info");
                return;
            }
            if (quizCurrentIndex < quizData.length - 1) {
                quizCurrentIndex++;
                quizChallengeComplete = false;
                renderChallenge();
            } else {
                showQuizComplete();
            }
        });
    }

    // Skip / See Solution
    const skipBtn = document.getElementById("skipQuizBtn");
    if (skipBtn) {
        const fresh = skipBtn.cloneNode(true);
        skipBtn.parentNode.replaceChild(fresh, skipBtn);
        fresh.addEventListener("click", () => {
            const challenge = quizData[quizCurrentIndex];
            const game = document.getElementById("quizGame");
            if (!game) return;

            // Reveal all flags that haven't been found yet
            challenge.red_flags.forEach(flag => {
                if (!quizFoundFlags.includes(flag.flag_id)) {
                    quizFoundFlags.push(flag.flag_id);
                    const overlay = game.querySelector(`.quiz-flag[data-flag-id="${flag.flag_id}"]`);
                    if (overlay) overlay.style.display = "block";
                }
            });

            quizChallengeComplete = true;

            const fb = document.getElementById("quizFeedback");
            if (fb) {
                fb.textContent = "✅ All flags revealed. Click Next Challenge to continue.";
                fb.style.cssText = "background:#d4edda;color:#155724;padding:10px;border-radius:8px;margin-top:12px;";
            }
        });
    }
}

function renderChallenge() {
    const challenge = quizData[quizCurrentIndex];
    quizFoundFlags = [];

    const progressEl = document.getElementById("quizProgress");
    if (progressEl) progressEl.textContent = `Challenge ${quizCurrentIndex + 1} of ${quizData.length}: ${challenge.title}`;

    const fb = document.getElementById("quizFeedback");
    if (fb) { fb.textContent = ""; fb.style.cssText = ""; }

    const game = document.getElementById("quizGame");
    if (!game) return;
    game.querySelectorAll(".quiz-flag").forEach(el => el.remove());

    // Clone image to drop old listeners
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
                position: "absolute",
                border: "3px solid green",
                background: "rgba(0, 200, 0, 0.2)",
                pointerEvents: "none",
                display: "none",
                left: (flag.x_percent / 100) * newImg.clientWidth + "px",
                top: (flag.y_percent / 100) * newImg.clientHeight + "px",
                width: (flag.width_percent / 100) * newImg.clientWidth + "px",
                height: (flag.height_percent / 100) * newImg.clientHeight + "px",
            });
            game.appendChild(div);
        });

        newImg.style.cursor = "crosshair";
        newImg.addEventListener("click", (e) => {
            if (quizChallengeComplete) return; // ignore clicks after challenge done
            const rect = newImg.getBoundingClientRect();
            const xPct = ((e.clientX - rect.left) / newImg.clientWidth) * 100;
            const yPct = ((e.clientY - rect.top) / newImg.clientHeight) * 100;
            handleQuizClick(xPct, yPct, challenge, game);
        });
    };

    newImg.onerror = () => {
        console.error("Quiz screenshot failed to load:", challenge.screenshot_url);
        if (fb) {
            fb.textContent = "⚠️ Unable to load the challenge screenshot.";
            fb.style.cssText = "background:#f8d7da;color:#721c24;padding:10px;border-radius:8px;margin-top:12px;";
        }
    };

    // Normalise path — strip leading /public if present, ensure leading slash
    const path = challenge.screenshot_url.startsWith("/")
        ? challenge.screenshot_url
        : "/" + challenge.screenshot_url;
    newImg.src = path;
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
        if (fb) {
            fb.textContent = "❌ Nothing suspicious there — keep looking!";
            fb.style.cssText = "background:#f8d7da;color:#721c24;padding:10px;border-radius:8px;margin-top:12px;";
        }
        return;
    }

    if (quizFoundFlags.includes(hitFlag.flag_id)) {
        if (fb) {
            const explanation = hitFlag.explanation || hitFlag.explanation_text || "(no explanation available)";
            fb.innerHTML = `<strong>✅ ${hitFlag.label}</strong><br><span style="font-size:13px;">${hitFlag.explanation}</span>`;
            fb.style.cssText = "background:#d4edda;color:#155724;padding:12px 14px;border-radius:8px;margin-top:12px;line-height:1.5;";
        }
        return;
    }

    // Correct new find — reveal the highlight overlay
    quizFoundFlags.push(hitFlag.flag_id);
    const overlay = game.querySelector(`.quiz-flag[data-flag-id="${hitFlag.flag_id}"]`);
    if (overlay) overlay.style.display = "block";

    if (fb) {
        const explanation = hitFlag.explanation;
        fb.textContent = `✅ ${hitFlag.label}`;
        fb.style.cssText = "background:#d4edda;color:#155724;padding:10px;border-radius:8px;margin-top:12px;";
    }

    // All flags found for this challenge
    if (quizFoundFlags.length === challenge.red_flags.length) {
        quizChallengeComplete = true;
        if (fb) {
            const isLast = quizCurrentIndex === quizData.length - 1;
            fb.textContent += isLast
                ? "  🎉 All flags found! Click Next Challenge to finish."
                : "  🎉 All flags found! Click Next Challenge to continue.";
        }
    }
}

function showQuizComplete() {
    const game = document.getElementById("quizGame");
    const progressEl = document.getElementById("quizProgress");
    const fb = document.getElementById("quizFeedback");
    const actions = document.querySelector(".quiz-actions");

    if (game) game.style.display = "none";
    if (progressEl) progressEl.style.display = "none";
    if (actions) actions.style.display = "none";

    if (fb) {
        fb.innerHTML = `
            <div style="text-align:center;padding:40px;">
                <div style="font-size:4rem;margin-bottom:1rem;">🎉</div>
                <h2 style="color:#1B7D4F;margin-bottom:0.5rem;">All Challenges Completed!</h2>
                <p style="color:#D9D9D9;margin-bottom:1.5rem;">🛡️ Congratulations — you've mastered phishing detection!</p>
                <a href="/" id="goHomeBtn" class="nav-btn" style="padding:0.8rem 2rem;font-size:1rem;text-decoration:none;display:inline-block;">Go Home</a>
            </div>`;
        fb.style.cssText = "";
    }

    playClappingSound();

    createPartyPoppers();
}

function createPartyPoppers() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const confettiCount = 1000;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background-color: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * window.innerWidth}px;
            top: -10px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: fall ${2 + Math.random() * 1}s linear forwards;
            opacity: 0.8;
        `;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 3000);
    }

    // Add CSS animation if not already present
    if (!document.getElementById('quizConfettiStyle')) {
        const style = document.createElement('style');
        style.id = 'quizConfettiStyle';
        style.textContent = `
            @keyframes fall {
                to {
                    transform: translateY(${window.innerHeight + 20}px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}
function playClappingSound() {
    try {
        const audio = new Audio('/assets/sounds/clapping.mp3');
        audio.volume = 0.6;
        audio.play().catch(err => console.log('Could not play clapping sound:', err));
    } catch (err) {
        console.log('Audio playback not available:', err);
    }
}