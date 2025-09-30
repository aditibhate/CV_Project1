/**
 * Assistive Crosswalk Navigation Tutorial - Main JavaScript
 * Handles interactive components, accessibility, and user interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeAudio();
    initializeQuizzes();
    initializeModals();
    initializeSlider();
    initializeNavigation();
    initializeAccessibility();
    initializeGameFunctionality();
    initializeTrailcast();
    initializeTaskTiles();
    initializeEnhancedQuiz();
    initializeDragDrop();
    initializeProcessFlow();
    initializeVisionDemo();
    compactVisionSliderDesktop();
    updateFooterYear();
});

/* =================================================================
   Drag and Drop Matching Activity (Sensors page)
================================================================= */
function initializeDragDrop() {
    const dragDropContainer = document.querySelector('.drag-drop-container');
    if (!dragDropContainer) return;

    const dragItems = dragDropContainer.querySelectorAll('.drag-item');
    const dropZones = dragDropContainer.querySelectorAll('.drop-zone');
    const resetBtn = dragDropContainer.querySelector('.drag-drop-reset');
    const feedback = dragDropContainer.querySelector('.drag-drop-feedback');

    let draggedItem = null;
    let correctMatches = 0;
    const totalMatches = dragItems.length;

    // Drag event listeners
    dragItems.forEach(item => {
        item.draggable = true;

        item.addEventListener('dragstart', function(e) {
            draggedItem = this;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            draggedItem = null;
        });

        item.addEventListener('touchstart', function(e) {
            e.preventDefault();
            draggedItem = this;
            this.style.position = 'absolute';
            this.style.zIndex = '1000';
        });
    });

    // Drop zone event listeners
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });

        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            if (draggedItem) {
                handleDrop(this, draggedItem);
            }
        });

        zone.addEventListener('touchend', function(e) {
            e.preventDefault();
            if (draggedItem) {
                handleDrop(this, draggedItem);
            }
        });
    });

    function handleDrop(dropZone, draggedItem) {
        const existingItem = dropZone.querySelector('.drag-item');
        if (existingItem) {
            document.querySelector('.drag-items').appendChild(existingItem);
            existingItem.style.position = '';
            existingItem.style.zIndex = '';
        }

        dropZone.appendChild(draggedItem);
        draggedItem.style.position = '';
        draggedItem.style.zIndex = '';
        dropZone.classList.add('filled');

        const isCorrect = draggedItem.dataset.match === dropZone.dataset.target;

        if (isCorrect) {
            dropZone.classList.add('correct');
            dropZone.classList.remove('incorrect');
        } else {
            dropZone.classList.add('incorrect');
            dropZone.classList.remove('correct');
        }

        updateDragDropProgress();
    }

    function updateDragDropProgress() {
        correctMatches = 0;
        let totalPlaced = 0;

        dropZones.forEach(zone => {
            const item = zone.querySelector('.drag-item');
            if (item) {
                totalPlaced++;
                if (item.dataset.match === zone.dataset.target) {
                    correctMatches++;
                }
            }
        });

        if (totalPlaced === totalMatches) {
            const percentage = Math.round((correctMatches / totalMatches) * 100);

            if (feedback) {
                if (correctMatches === totalMatches) {
                    feedback.textContent = `Perfect! All ${correctMatches} matches are correct! 🎉`;
                    feedback.style.background = 'rgba(16, 185, 129, 0.1)';
                    feedback.style.color = 'var(--success)';
                    feedback.style.border = '1px solid var(--success)';
                } else {
                    feedback.textContent = `${correctMatches}/${totalMatches} correct (${percentage}%). Try adjusting the incorrect matches.`;
                    feedback.style.background = 'rgba(245, 158, 11, 0.1)';
                    feedback.style.color = 'var(--warning)';
                    feedback.style.border = '1px solid var(--warning)';
                }
                feedback.style.display = 'block';
            }
        } else {
            if (feedback) feedback.style.display = 'none';
        }
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            const originalContainer = document.querySelector('.drag-items');
            dragItems.forEach(item => {
                originalContainer.appendChild(item);
                item.style.position = '';
                item.style.zIndex = '';
            });

            dropZones.forEach(zone => {
                zone.classList.remove('filled', 'correct', 'incorrect', 'drag-over');
            });

            if (feedback) feedback.style.display = 'none';
            correctMatches = 0;
        });
    }
}

/* =================================================================
   Task Tiles (Homepage)
================================================================= */
function initializeTaskTiles() {
    document.querySelectorAll('.task-tile').forEach(tile => {
        tile.addEventListener('click', function() {
            const popupId = this.dataset.popup;
            if (popupId) {
                openModal(popupId);
            }
        });

        tile.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });

        if (!tile.hasAttribute('tabindex')) {
            tile.setAttribute('tabindex', '0');
        }
    });
}

/* =================================================================
   Enhanced Quiz System (Activities page)
================================================================= */
function initializeEnhancedQuiz() {
    if (!document.querySelector('.quiz-card')) return;

    let quizStats = {
        answered: 0,
        correct: 0,
        total: document.querySelectorAll('.quiz-card').length
    };

    document.querySelectorAll('.quiz-card').forEach(initializeQuizCard);
    updateQuizProgress();

    function initializeQuizCard(card) {
        const submitBtn = card.querySelector('[data-submit]');
        const resetBtn = card.querySelector('[data-reset]');
        const options = card.querySelectorAll('.quiz-option');
        const feedback = card.querySelector('[data-feedback]');

        options.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            if (radio) {
                radio.addEventListener('change', function() {
                    if (submitBtn) submitBtn.disabled = false;
                    options.forEach(opt => {
                        opt.classList.remove('correct', 'incorrect');
                    });
                });
            }
        });

        if (submitBtn) {
            submitBtn.addEventListener('click', function() {
                handleQuizSubmit(card, options, feedback, submitBtn, resetBtn);
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                handleQuizReset(card, options, feedback, submitBtn, resetBtn);
            });
        }
    }

    function handleQuizSubmit(card, options, feedback, submitBtn, resetBtn) {
        const selectedOption = card.querySelector('input[type="radio"]:checked');
        if (!selectedOption) return;

        const selectedLabel = selectedOption.closest('.quiz-option');
        const isCorrect = selectedLabel.dataset.correct === 'true';

        options.forEach(option => {
            const isCorrectOption = option.dataset.correct === 'true';
            const isSelected = option.contains(selectedOption);

            if (isCorrectOption) {
                option.classList.add('correct');
            } else if (isSelected && !isCorrect) {
                option.classList.add('incorrect');
            }

            option.style.pointerEvents = 'none';
        });

        showQuizFeedback(feedback, isCorrect, card.dataset.quizId);

        if (!card.hasAttribute('data-answered')) {
            card.setAttribute('data-answered', 'true');
            quizStats.answered++;
            if (isCorrect) {
                quizStats.correct++;
            }
            updateQuizProgress();
        }

        if (submitBtn) submitBtn.style.display = 'none';
        if (resetBtn) resetBtn.style.display = 'inline-block';
    }

    function handleQuizReset(card, options, feedback, submitBtn, resetBtn) {
        options.forEach(option => {
            option.classList.remove('correct', 'incorrect');
            option.style.pointerEvents = 'auto';
            const radio = option.querySelector('input[type="radio"]');
            if (radio) radio.checked = false;
        });

        if (feedback) {
            feedback.classList.remove('show', 'correct', 'incorrect');
            feedback.style.display = 'none';
        }

        if (submitBtn) {
            submitBtn.style.display = 'inline-block';
            submitBtn.disabled = true;
        }
        if (resetBtn) resetBtn.style.display = 'none';

        card.removeAttribute('data-answered');
    }

    function showQuizFeedback(feedbackElement, isCorrect, questionId) {
        if (!feedbackElement) return;

        const feedbackMessages = {
            'q1': {
                correct: '✅ Correct! IMU noise from hand movement causes jittery readings. A moving average filter (3-5 frame window) smooths the data while maintaining responsiveness.',
                incorrect: '❌ Not quite right. The rapid alternation suggests sensor noise rather than multipath interference or processing lag. The IMU measures orientation and is most susceptible to hand movement jitter.'
            },
            'q2': {
                correct: '✅ Excellent! CNN-based approaches with data augmentation can handle varied marking styles and challenging lighting conditions much better than classical methods.',
                incorrect: '❌ While classical methods work well in ideal conditions, CNN-based approaches are more robust to varied marking styles and challenging lighting when accuracy is prioritized over speed.'
            },
            'q3': {
                correct: '✅ Correct! Continuing with reduced confidence maintains navigation assistance while indicating uncertainty. Stopping could leave users stranded in traffic.',
                incorrect: '❌ The system should maintain assistance when possible. Continuing with last known heading and reduced confidence keeps users moving safely while indicating uncertainty.'
            },
            'q4': {
                correct: '✅ Perfect! Δθ = 45° - 30° = +15°. Positive error means the user is oriented left of the optimal heading, so they need to turn right to align with the crosswalk.',
                incorrect: '❌ Remember: Δθ = θ_user - θ_crosswalk = 45° - 30° = +15°. Positive values indicate the user is left of optimal heading and should turn right.'
            },
            'home-quiz': {
                correct: '✅ Exactly! IMU provides θ_user (user heading) and Camera provides θ_crosswalk (crosswalk orientation). The difference Δθ = θ_user - θ_crosswalk tells the user which way to turn.',
                incorrect: '❌ The core calculation requires user heading (from IMU compass) and crosswalk orientation (from camera vision processing). GPS provides location context but not the precise angular measurements needed for alignment.'
            }
        };

        const message = feedbackMessages[questionId];
        if (message) {
            feedbackElement.textContent = isCorrect ? message.correct : message.incorrect;
            feedbackElement.className = `quiz-feedback show ${isCorrect ? 'correct' : 'incorrect'}`;
            feedbackElement.style.display = 'block';
        }
    }

    function updateQuizProgress() {
        const answeredEl = document.getElementById('answered');
        const correctEl = document.getElementById('correct');
        const percentageEl = document.getElementById('percentage');

        if (answeredEl) answeredEl.textContent = quizStats.answered;
        if (correctEl) correctEl.textContent = quizStats.correct;

        if (percentageEl) {
            const percentage = quizStats.answered > 0
                ? Math.round((quizStats.correct / quizStats.answered) * 100)
                : 0;
            percentageEl.textContent = percentage + '%';
        }
    }
}

/* =================================================================
   Audio Player Management
================================================================= */
function initializeAudio() {
    document.querySelectorAll('[data-audio]').forEach(element => {
        const audioSrc = element.dataset.audio;
        const audioTitle = element.dataset.audioTitle || 'Page Narration';
        const audioPlayer = createAudioPlayer(audioSrc, audioTitle);
        element.appendChild(audioPlayer);
    });

    document.querySelectorAll('audio').forEach(audio => {
        audio.addEventListener('loadedmetadata', function() {
            const duration = formatTime(this.duration);
            const durationElement = this.parentElement.querySelector('.audio-duration');
            if (durationElement) {
                durationElement.textContent = duration;
            }
        });

        audio.addEventListener('error', function() {
            console.warn('Audio file not found:', this.src);
            showAudioPlaceholder(this);
        });
    });
}

function createAudioPlayer(src, title) {
    const container = document.createElement('div');
    container.className = 'audio-player';

    container.innerHTML = `
        <div class="audio-title">${title}</div>
        <audio controls preload="metadata" class="audio-controls">
            <source src="${src}" type="audio/mpeg">
            <source src="${src.replace('.mp3', '.wav')}" type="audio/wav">
            Your browser does not support the audio element.
        </audio>
        <div class="audio-note">Duration: <span class="audio-duration">--:--</span></div>
    `;

    return container;
}

function showAudioPlaceholder(audioElement) {
    const placeholder = document.createElement('div');
    placeholder.className = 'audio-player';
    placeholder.innerHTML = `
        <div class="audio-title">🎵 Audio Narration</div>
        <div style="padding: 1rem; background: #f1f5f9; border-radius: 0.5rem; text-align: center;">
            <p style="margin: 0; color: #64748b;">Audio narration will be available here</p>
            <small style="color: #94a3b8;">To add audio: Record narration and save as MP3 files</small>
        </div>
    `;

    audioElement.parentNode.replaceChild(placeholder, audioElement);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/* =================================================================
   Trailcast Audio System
================================================================= */
function initializeTrailcast() {
    document.querySelectorAll('.trailcast').forEach(tc => {
        const title = tc.dataset.title || 'Narration';
        const src = tc.dataset.src;
        if (!src) return;

        tc.innerHTML = `
            <div class="tc-top">
                <div class="tc-title">${title}</div>
                <div class="tc-meta" data-tc-meta>--:--</div>
            </div>
            <audio class="tc-audio" controls preload="metadata">
                <source src="${src}" type="audio/mpeg">
                <source src="${src?.replace('.mp3','.wav') || ''}" type="audio/wav">
            </audio>
        `;

        const audio = tc.querySelector('audio');
        const meta = tc.querySelector('[data-tc-meta]');
        if (audio) {
            audio.addEventListener('loadedmetadata', () => {
                const d = Math.round(audio.duration || 0);
                const mm = String(Math.floor(d/60)).padStart(2,'0');
                const ss = String(d%60).padStart(2,'0');
                meta.textContent = `${mm}:${ss}`;
            });
        }
    });
}

/* =================================================================
   Quiz Management (Multi-question support)
================================================================= */
function initializeQuizzes() {
    const groups = Array.from(document.querySelectorAll('[data-quiz]'));
    const scoreEl = document.querySelector('.quiz-score');
    const barEl = document.querySelector('.quiz-progress-bar');
    const solved = new Set();
    const total = groups.length;

    function updateProgress() {
        if (scoreEl) scoreEl.textContent = `${solved.size} / ${total} correct`;
        if (barEl) {
            const pct = total ? Math.round((solved.size / total) * 100) : 0;
            barEl.style.width = `${pct}%`;
        }
    }

    groups.forEach(group => {
        const qid = group.getAttribute('data-quiz') || group.dataset.quiz;
        const result = group.querySelector('[data-quiz-result]');
        const choices = group.querySelectorAll('[data-quiz-choice]');

        choices.forEach(btn => {
            btn.addEventListener('click', () => {
                const correct = btn.dataset.correct === 'true';

                if (result) {
                    if (correct) {
                        result.textContent = 'Correct! ✅';
                        result.className = 'small ok';

                        if (qid === 'home-quiz') {
                            result.textContent = '✅ Exactly! IMU provides θ_user (user heading) and Camera provides θ_crosswalk (crosswalk orientation). The difference Δθ = θ_user - θ_crosswalk tells the user which way to turn.';
                        }
                    } else {
                        result.textContent = 'Try again.';
                        result.className = 'small bad';

                        if (qid === 'home-quiz') {
                            result.textContent = '❌ The core calculation requires user heading (from IMU compass) and crosswalk orientation (from camera vision processing). GPS provides location context but not the precise angular measurements needed for alignment.';
                        }
                    }

                    result.setAttribute('role','status');
                    result.setAttribute('aria-live','polite');
                    result.style.display = 'block';
                }

                if (correct) {
                    solved.add(qid);
                    choices.forEach(b => b.disabled = true);
                    group.classList.add('quiz-solved');
                } else {
                    group.classList.add('quiz-nudge');
                    setTimeout(() => group.classList.remove('quiz-nudge'), 150);
                }

                updateProgress();
            });
        });
    });

    updateProgress();

    // Legacy quiz system
    document.querySelectorAll('.quiz-container').forEach(quiz => {
        const options = quiz.querySelectorAll('.quiz-option');
        const feedback = quiz.querySelector('.quiz-feedback');

        options.forEach(option => {
            option.addEventListener('click', function() {
                handleQuizAnswer(this, options, feedback);
            });
        });
    });
}

function handleQuizAnswer(selectedOption, allOptions, feedback) {
    allOptions.forEach(option => {
        option.classList.remove('correct', 'incorrect');
    });

    const isCorrect = selectedOption.dataset.correct === 'true';

    allOptions.forEach(option => {
        if (option.dataset.correct === 'true') {
            option.classList.add('correct');
        } else if (option === selectedOption && !isCorrect) {
            option.classList.add('incorrect');
        }
    });

    if (feedback) {
        feedback.style.display = 'block';
        feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.textContent = isCorrect ?
            '✅ Correct! Well done.' :
            '❌ Not quite right. Try again!';

        feedback.setAttribute('role', 'status');
        feedback.setAttribute('aria-live', 'polite');
    }

    allOptions.forEach(option => {
        option.style.pointerEvents = 'none';
    });

    setTimeout(() => {
        allOptions.forEach(option => {
            option.style.pointerEvents = 'auto';
            option.classList.remove('correct', 'incorrect');
        });
        if (feedback) {
            feedback.style.display = 'none';
        }
    }, 3000);
}

/* =================================================================
   Modal Management
================================================================= */
function initializeModals() {
    document.querySelectorAll('[data-modal]').forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.dataset.modal;
            openModal(modalId);
        });
    });

    document.querySelectorAll('[data-modal-open]').forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.dataset.modalOpen;
            openModal(modalId);
        });
    });

    document.querySelectorAll('.modal-close, [data-close]').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            closeModal(this.closest('.modal'));
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.active');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/* =================================================================
   Before/After Slider
================================================================= */
function initializeSlider() {
    const slider = document.querySelector('.comparison-slider-control');
    const afterImage = document.querySelector('.comparison-after');

    if (slider && afterImage) {
        slider.addEventListener('input', function() {
            const value = this.value;
            afterImage.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
        });

        afterImage.style.clipPath = 'inset(0 50% 0 0)';
    }

    const legacySlider = document.getElementById('slider');
    const legacyAfterWrap = document.getElementById('afterWrap');
    if (legacySlider && legacyAfterWrap) {
        legacySlider.addEventListener('input', function() {
            const value = this.value;
            legacyAfterWrap.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
        });
        legacyAfterWrap.style.clipPath = 'inset(0 50% 0 0)';
    }
}

/* =================================================================
   Game Functionality (Alignment Simulator)
================================================================= */
function initializeGameFunctionality() {
    window.gameState = {
        userHeading: 0,
        crosswalkHeading: 0,
        attempts: 0,
        perfectAlignments: 0,
        gameStarted: false,
        bestAccuracy: null,
        challengeMode: false,
        hasAchievedPerfect: false
    };

    window.turnLeft = function() {
        window.gameState.gameStarted = true;
        window.gameState.userHeading = (window.gameState.userHeading - 5 + 360) % 360;
        window.gameState.attempts++;
        updateGameDisplay();
        updateGameStats();
    };

    window.turnRight = function() {
        window.gameState.gameStarted = true;
        window.gameState.userHeading = (window.gameState.userHeading + 5) % 360;
        window.gameState.attempts++;
        updateGameDisplay();
        updateGameStats();
    };

    window.resetGame = function() {
        window.gameState.userHeading = window.gameState.crosswalkHeading + (Math.random() - 0.5) * 60;
        window.gameState.userHeading = (window.gameState.userHeading + 360) % 360;
        window.gameState.gameStarted = false;
        window.gameState.hasAchievedPerfect = false;
        updateGameDisplay();
    };

    window.newScenario = function() {
        window.gameState.challengeMode = false;
        window.gameState.crosswalkHeading = (Math.random() - 0.5) * 90;
        window.gameState.crosswalkHeading = (window.gameState.crosswalkHeading + 360) % 360;

        const crosswalk = document.getElementById('crosswalk');
        if (crosswalk) {
            crosswalk.style.transform = `translateY(-50%) rotate(${window.gameState.crosswalkHeading}deg)`;
        }

        window.gameState.hasAchievedPerfect = false;
        window.resetGame();
    };

    if (document.getElementById('crosswalk')) {
        window.newScenario();
        updateGameDisplay();
    }
}

function updateGameDisplay() {
    if (!window.gameState) return;

    const state = window.gameState;
    const delta = state.userHeading - state.crosswalkHeading;
    const normalizedDelta = ((delta + 180) % 360) - 180;

    const direction = document.getElementById('direction');
    if (direction) {
        direction.style.transform = `translateX(-50%) rotate(${state.userHeading}deg)`;
    }

    const display = document.getElementById('display');
    if (display) {
        display.innerHTML =
            `<div style="color: #3498db;">User: ${state.userHeading}°</div>
             <div style="color: #e74c3c;">Crosswalk: ${state.crosswalkHeading}°</div>
             <div style="color: #f39c12;">Error (Δθ): ${normalizedDelta.toFixed(1)}°</div>`;
    }

    const feedback = document.getElementById('feedback');
    if (!feedback) return;

    const absDelta = Math.abs(normalizedDelta);

    if (state.gameStarted && (state.bestAccuracy === null || absDelta < state.bestAccuracy)) {
        state.bestAccuracy = absDelta;
        updateGameStats();
    }

    if (!state.gameStarted) {
        feedback.textContent = "Click Turn Left or Turn Right to adjust your heading direction";
        feedback.style.background = "var(--bg-tertiary)";
        feedback.style.color = "var(--text-secondary)";
        feedback.style.border = "2px solid var(--border)";
        return;
    }

    if (absDelta <= 3) {
        feedback.textContent = `🎉 Perfect Alignment! You're ready to cross safely. (Error: ${absDelta.toFixed(1)}°)`;
        feedback.style.background = "rgba(46, 204, 113, 0.15)";
        feedback.style.color = "#27ae60";
        feedback.style.border = "2px solid #27ae60";

        if (absDelta <= 3 && state.attempts > 0 && !state.hasAchievedPerfect) {
            state.perfectAlignments++;
            state.hasAchievedPerfect = true;
            updateGameStats();
        }
    } else if (absDelta <= 10) {
        const direction = normalizedDelta > 0 ? "right" : "left";
        feedback.textContent = `✅ Good progress! Turn slightly ${direction} to improve. (${absDelta.toFixed(1)}° off)`;
        feedback.style.background = "rgba(241, 196, 15, 0.15)";
        feedback.style.color = "#f39c12";
        feedback.style.border = "2px solid #f39c12";
    } else {
        const direction = normalizedDelta > 0 ? "right" : "left";
        feedback.textContent = `⚠️ Keep turning ${direction}! You're ${absDelta.toFixed(1)}° off the centerline.`;
        feedback.style.background = "rgba(231, 76, 60, 0.15)";
        feedback.style.color = "#e74c3c";
        feedback.style.border = "2px solid #e74c3c";
    }
}

function updateGameStats() {
    if (!window.gameState) return;

    const state = window.gameState;

    const elements = {
        attempts: document.getElementById('attempts'),
        perfect: document.getElementById('perfect'),
        successRate: document.getElementById('successRate'),
        bestAccuracy: document.getElementById('bestAccuracy')
    };

    if (elements.attempts) elements.attempts.textContent = state.attempts;
    if (elements.perfect) elements.perfect.textContent = state.perfectAlignments;

    if (elements.successRate) {
        const successRate = state.attempts > 0 ? (state.perfectAlignments / state.attempts * 100).toFixed(1) : 0;
        elements.successRate.textContent = successRate + '%';
    }

    if (elements.bestAccuracy) {
        elements.bestAccuracy.textContent =
            state.bestAccuracy !== null ? state.bestAccuracy.toFixed(1) + '°' : '--°';
    }
}

/* =================================================================
   Navigation Enhancement
================================================================= */
function initializeNavigation() {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link, .links a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.setAttribute('aria-current', 'page');
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header, header');
        if (window.scrollY > 100) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
        lastScrollY = window.scrollY;
    });
}

/* =================================================================
   Accessibility Enhancements
================================================================= */
function initializeAccessibility() {
    addSkipLink();
    announcePageContent();
    initializeKeyboardNavigation();
    manageFocus();
}

function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only';
    skipLink.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 9999;
        padding: 10px;
        background: var(--primary);
        color: white;
        text-decoration: none;
        border-radius: 4px;
        transform: translateY(-100px);
        transition: transform 0.3s;
    `;

    skipLink.addEventListener('focus', function() {
        this.style.transform = 'translateY(0)';
        this.classList.remove('sr-only');
    });

    skipLink.addEventListener('blur', function() {
        this.style.transform = 'translateY(-100px)';
        this.classList.add('sr-only');
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
}

function announcePageContent() {
    const main = document.querySelector('main');
    if (main && !main.id) {
        main.id = 'main-content';
    }

    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);
}

function initializeKeyboardNavigation() {
    document.querySelectorAll('.card').forEach(card => {
        if (!card.querySelector('a, button')) {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');

            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        }
    });

    document.querySelectorAll('.quiz-container').forEach(quiz => {
        const options = quiz.querySelectorAll('.quiz-option');
        options.forEach((option, index) => {
            option.addEventListener('keydown', function(e) {
                let nextIndex;
                switch(e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        nextIndex = (index + 1) % options.length;
                        options[nextIndex].focus();
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        nextIndex = (index - 1 + options.length) % options.length;
                        options[nextIndex].focus();
                        break;
                }
            });
        });
    });
}

function manageFocus() {
    let lastFocusedElement = null;

    document.addEventListener('focusin', function(e) {
        lastFocusedElement = e.target;
    });

    window.addEventListener('modalClosed', function() {
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    });
}

/* =================================================================
   Utility Functions
================================================================= */
function updateFooterYear() {
    const yearElements = document.querySelectorAll('#current-year, #year');
    yearElements.forEach(element => {
        element.textContent = new Date().getFullYear();
    });
}

function announceToScreenReader(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

/* =================================================================
   Performance Monitoring
================================================================= */
window.addEventListener('load', function() {
    setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            console.log('Page load time:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
        }
    }, 0);
});

window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

/* =================================================================
   Quiz Button Text Fix
================================================================= */
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.quiz-option').forEach(button => {
        if (!button.textContent.trim()) {
            const originalText = button.getAttribute('data-text') || button.innerHTML;
            if (originalText) {
                button.textContent = originalText;
            }
        }

        button.style.color = 'var(--text-primary)';
        button.style.backgroundColor = 'var(--bg-primary)';
        button.style.border = '2px solid var(--border)';
        button.style.display = 'block';
        button.style.width = '100%';
        button.style.textAlign = 'left';
        button.style.padding = '1rem 1.5rem';
        button.style.marginBottom = '0.5rem';
        button.style.borderRadius = 'var(--radius-md)';
        button.style.cursor = 'pointer';
        button.style.fontSize = '1.05rem';
        button.style.lineHeight = '1.4';
    });
});

/* =================================================================
   Home Page Quiz Fix
================================================================= */
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', function() {
        const quizOptions = document.querySelectorAll('[data-quiz="home-quiz"] .quiz-option');
        const optionTexts = [
            'GPS + Camera for location and visual detection',
            'IMU + Camera for user heading and crosswalk orientation',
            'Microphone + Camera for audio cues and visual confirmation'
        ];

        quizOptions.forEach((option, index) => {
            if (optionTexts[index]) {
                option.textContent = optionTexts[index];
                option.style.display = 'block';
                option.style.visibility = 'visible';
            }
        });
    });
}

/* =================================================================
   Crosswalk Spotter Functions (Homepage)
================================================================= */
const spotterTruth = { s1:'yes', s2:'no', s3:'yes' };

function revealSpotter(group, ansId, correct) {
    const selected = document.querySelector(`input[name="${group}"]:checked`)?.value;
    const el = document.getElementById(ansId);
    const ok = selected ? (selected === correct) : null;

    el.style.display = 'block';
    el.className = 'result ' + (ok === null ? '' : (ok ? 'ok' : 'bad'));

    if (ok === null) {
        el.innerHTML = 'ℹ️ Correct answer: <strong>' + (correct === 'yes' ? 'Yes' : 'No') + '</strong>.';
    } else if (ok) {
        el.innerHTML = '✅ Nice! Correct.';
    } else {
        el.innerHTML = '❌ Not quite. Correct answer: <strong>' +
            (correct === 'yes' ? 'Yes – zebra/faded stripes.' : 'No – just a lane divider.') + '</strong>';
    }
}

function tallySpotter() {
    let score = 0;
    const total = Object.keys(spotterTruth).length;

    for (const k in spotterTruth) {
        const sel = document.querySelector(`input[name="${k}"]:checked`)?.value;
        if (sel === spotterTruth[k]) score++;
    }

    const scoreEl = document.getElementById('spotter-score');
    scoreEl.style.display = 'block';
    scoreEl.textContent = `Your tally: ${score}/${total} correct`;

    if (score === total) {
        scoreEl.textContent += ' - Perfect! 🎉';
    }
}

function resetSpotter() {
    ['s1', 's2', 's3'].forEach(n => {
        const sel = document.querySelector(`input[name="${n}"]:checked`);
        if (sel) sel.checked = false;
    });

    ['ans1', 'ans2', 'ans3'].forEach(id => {
        const el = document.getElementById(id);
        el.style.display = 'none';
        el.className = 'result';
        el.textContent = '';
    });

    const scoreEl = document.getElementById('spotter-score');
    scoreEl.style.display = 'none';
    scoreEl.textContent = '';
}

/* =================================================================
   Sequential Process Flow (Tasks page)
================================================================= */
function initializeProcessFlow() {
    const container = document.getElementById('process-flow');
    if (!container) return;

    const steps = Array.from(container.querySelectorAll('.step'));
    if (!steps.length) return;

    let current = Math.max(steps.findIndex((el) => el.classList.contains('active')) + 1, 1);

    function show(stepIndex) {
        steps.forEach((el, i) => {
            el.classList.toggle('active', i === stepIndex - 1);
        });
    }

    window.nextStep = function() {
        current = current % steps.length + 1;
        show(current);
    };

    window.toggleMetrics = function() {
        const m = document.getElementById('metrics');
        if (!m) return;
        const isHidden = getComputedStyle(m).display === 'none';
        m.style.display = isHidden ? 'block' : 'none';
    };

    show(current);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            window.nextStep();
        }
    });
}

/* =================================================================
   Vision Demo Overlay Slider (Homepage)
================================================================= */
function initializeVisionDemo() {
    const slider = document.getElementById('slider');
    const overlay = document.getElementById('overlay');
    if (!slider || !overlay) return;

    overlay.style.width = `${slider.value}%`;

    slider.addEventListener('input', function() {
        overlay.style.width = `${this.value}%`;
    });

    slider.addEventListener('keydown', function(e) {
        const step = (this.step && Number(this.step)) || 1;
        if (e.key === 'ArrowLeft') {
            this.value = Math.max(0, Number(this.value) - step);
            this.dispatchEvent(new Event('input'));
        } else if (e.key === 'ArrowRight') {
            this.value = Math.min(100, Number(this.value) + step);
            this.dispatchEvent(new Event('input'));
        }
    });
}

/* =================================================================
   Compact Vision Slider on Desktop
================================================================= */
function compactVisionSliderDesktop() {
    const el = document.querySelector('.slider-wrap');
    if (!el) return;

    const DESKTOP_MIN = 1024;
    const SCALE_Y = 0.60;

    function apply() {
        el.style.transform = '';
        el.style.marginBottom = '';

        if (window.innerWidth >= DESKTOP_MIN) {
            const h = el.getBoundingClientRect().height;
            el.style.transformOrigin = 'top center';
            el.style.transform = `scaleY(${SCALE_Y})`;
            el.style.marginBottom = `${-(1 - SCALE_Y) * h}px`;
        }
    }

    apply();
    window.addEventListener('resize', () => requestAnimationFrame(apply));
}

/* =================================================================
   Modern Algorithms Quiz (Algorithms page)
================================================================= */
document.addEventListener('DOMContentLoaded', function() {
    const modernQuiz = document.querySelector('[data-quiz="modern-algorithms"]');
    if (modernQuiz) {
        const options = modernQuiz.querySelectorAll('.quiz-option');
        const result = modernQuiz.querySelector('[data-quiz-result]');

        options.forEach(option => {
            option.addEventListener('click', function() {
                const isCorrect = this.dataset.correct === 'true';

                options.forEach(opt => {
                    opt.classList.remove('correct', 'incorrect');
                    if (opt.dataset.correct === 'true') {
                        opt.classList.add('correct');
                    } else if (opt === this && !isCorrect) {
                        opt.classList.add('incorrect');
                    }
                    opt.style.pointerEvents = 'none';
                });

                if (result) {
                    result.style.display = 'block';
                    if (isCorrect) {
                        result.textContent = '✅ Correct! Deep learning methods like YOLO handle environmental variation, different marking styles, and challenging lighting far better than classical CV approaches, making them essential for production systems.';
                        result.className = 'small ok';
                    } else {
                        result.textContent = '❌ Not quite. While speed and power are considerations, the primary advantage is robustness to varied real-world conditions.';
                        result.className = 'small bad';
                    }
                }

                setTimeout(() => {
                    options.forEach(opt => {
                        opt.style.pointerEvents = 'auto';
                        opt.classList.remove('correct', 'incorrect');
                    });
                    if (result) {
                        result.style.display = 'none';
                    }
                }, 3000);
            });
        });
    }
});