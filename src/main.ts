// --- Lotus Identity by Slow - TypeScript Application Core ---

import './style.css';
import { loadEmbeddings, generateChatResponse, generateChatResponseStream } from './services/chat';

document.addEventListener('DOMContentLoaded', async () => {
    initParticles();
    init3DTilt();
    initSmoothScroll();
    initQuiz();
    await loadEmbeddings();
    initChatbot();
    initMinigame();
    initScrollAnimations();
    initHeroCarousel();
});

/* ==========================================================================
   1. Smooth Scroll Navigation Management
   ========================================================================== */
function initSmoothScroll(): void {
    const navTabs = document.querySelectorAll<HTMLButtonElement>('.nav-tab');
    const switchBtns = document.querySelectorAll<HTMLButtonElement>('.switch-tab-btn');

    function scrollToSection(targetId: string): void {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-scroll-to');
            if (targetId) scrollToSection(targetId);
        });
    });

    switchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-scroll-to');
            if (targetId) scrollToSection(targetId);
        });
    });

    // Intersection Observer for highlighting nav menu
    const sections = document.querySelectorAll<HTMLElement>('.page-section');
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navTabs.forEach(tab => tab.classList.remove('active'));
                const id = entry.target.getAttribute('id');
                const activeNav = document.querySelector<HTMLButtonElement>(`.nav-tab[data-scroll-to='${id}']`);
                if (activeNav) {
                    activeNav.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        navObserver.observe(section);
    });
}

/* ==========================================================================
   2. Canvas Particle Background (Pastel Lotus Petals - Light Mode)
   ========================================================================== */
function initParticles(): void {
    const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let particlesArray: Particle[] = [];
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class Particle {
        x: number;
        y: number;
        size: number;
        speedY: number;
        speedX: number;
        opacity: number;
        color: string;

        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height + height;
            this.size = Math.random() * 4 + 2; // Slightly larger for soft petals
            this.speedY = -(Math.random() * 0.5 + 0.15); // Drifts slower
            this.speedX = Math.random() * 0.3 - 0.15;
            this.opacity = Math.random() * 0.3 + 0.05; // Low opacity for light mode
            // Soft pink and gold pastel colors
            this.color = Math.random() > 0.5 ? 'hsl(340, 80%, 75%)' : 'hsl(38, 90%, 75%)';
        }

        update(): void {
            this.y += this.speedY;
            this.x += this.speedX;
            if (this.y < 100) {
                this.opacity -= 0.005;
            }
            if (this.y < 0 || this.opacity <= 0) {
                this.x = Math.random() * width;
                this.y = height + Math.random() * 50;
                this.speedY = -(Math.random() * 0.5 + 0.15);
                this.speedX = Math.random() * 0.3 - 0.15;
                this.opacity = Math.random() * 0.3 + 0.05;
            }
        }

        draw(): void {
            if (!ctx) return;
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
    }

    function init(): void {
        particlesArray = [];
        const numberOfParticles = Math.min(40, Math.floor((width * height) / 30000));
        for (let i = 0; i < numberOfParticles; i++) {
            const p = new Particle();
            p.y = Math.random() * height;
            particlesArray.push(p);
        }
    }

    function animate(): void {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        particlesArray.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    init();
    animate();
}

/* ==========================================================================
   3. 3D Card Tilt Effect
   ========================================================================== */
function init3DTilt(): void {
    const cards = document.querySelectorAll<HTMLElement>('[data-tilt]');
    
    if (window.matchMedia('(hover: hover)').matches) {
        cards.forEach(card => {
            card.addEventListener('mousemove', (e: MouseEvent) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((centerY - y) / centerY) * 8; // Max 8 deg for subtle tilt
                const rotateY = ((x - centerX) / centerX) * 8;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });
    }
}

/* ==========================================================================
   4. Diagnostic Quiz & SVG Radar Chart
   ========================================================================== */
interface QuizOption {
    text: string;
    score: number;
}

interface QuizQuestion {
    id: number;
    category: string;
    question: string;
    options: QuizOption[];
}

interface UserScores {
    [key: string]: number;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        id: 1,
        category: "culture",
        question: "Khi đối mặt với sự khác biệt văn hóa lớn ở môi trường quốc tế, thái độ của bạn là gì?",
        options: [
            { text: "Bảo vệ tuyệt đối văn hóa Việt Nam, từ chối tiếp thu văn hóa nước bạn.", score: 4 },
            { text: "Dễ dàng hòa theo văn hóa mới, bỏ qua các giá trị truyền thống Việt Nam.", score: 6 },
            { text: "Lắng nghe, tôn trọng sự khác biệt, đồng thời tự hào giới thiệu bản sắc văn hóa Việt Nam của mình.", score: 10 },
            { text: "Tránh giao tiếp với người nước ngoài, chỉ chơi với nhóm đồng hương.", score: 2 }
        ]
    },
    {
        id: 2,
        category: "ethics",
        question: "Trong công việc nhóm hoặc thi cử, nếu phát hiện hành vi gian lận hoặc thiếu trung thực, bạn sẽ giải quyết ra sao?",
        options: [
            { text: "Bỏ qua vì cho rằng không liên quan đến mình và để tránh mất lòng bạn bè.", score: 4 },
            { text: "Thẳng thắn trao đổi riêng với bạn để sửa đổi, hướng tới sự chính trực trong học tập.", score: 10 },
            { text: "Báo cáo ngay cho giảng viên mà không cần trao đổi hay tìm hiểu lý do.", score: 8 },
            { text: "Đồng lõa để cả nhóm đạt điểm cao hơn.", score: 2 }
        ]
    },
    {
        id: 3,
        category: "learning",
        question: "Bác Hồ có tinh thần tự học vĩ đại (học nhiều ngoại ngữ khi đi làm). Bạn áp dụng tinh thần này thế nào?",
        options: [
            { text: "Chỉ học những gì giảng viên yêu cầu trên lớp để qua môn.", score: 3 },
            { text: "Chủ động tự học qua mạng, đọc thêm tài liệu chuyên ngành quốc tế để nâng cao năng lực bản thân.", score: 10 },
            { text: "Tham gia các khóa học ngoài nhưng bỏ dở giữa chừng khi gặp khó khăn.", score: 6 },
            { text: "Chờ đợi người khác hướng dẫn hoặc làm hộ bài.", score: 2 }
        ]
    },
    {
        id: 4,
        category: "willpower",
        question: "Khi gặp thất bại lớn trong dự án hoặc sốc văn hóa/áp lực học tập, bạn phản ứng thế nào?",
        options: [
            { text: "Nản chí, muốn từ bỏ mục tiêu ban đầu và đổ lỗi cho hoàn cảnh.", score: 2 },
            { text: "Tìm kiếm sự giúp đỡ từ người khác hoàn toàn để họ giải quyết hộ.", score: 5 },
            { text: "Xem đó là cơ hội rèn luyện bản lĩnh vượt khó, bình tĩnh đúc kết bài học để đứng lên đi tiếp.", score: 10 },
            { text: "Bỏ qua thất bại và chuyển ngay sang làm việc khác mà không suy ngẫm.", score: 6 }
        ]
    },
    {
        id: 5,
        category: "integration",
        question: "Theo bạn, điều kiện tiên quyết nào giúp con người phát triển bền vững khi bước ra môi trường toàn cầu?",
        options: [
            { text: "Kỹ năng chuyên môn giỏi là đủ, không cần bận tâm đến đạo đức hay văn hóa.", score: 4 },
            { text: "Nắm vững chuyên môn, làm chủ công nghệ, lấy đạo đức làm gốc và giữ vững bản sắc dân tộc.", score: 10 },
            { text: "Chỉ cần khả năng giao tiếp và ngoại ngữ tốt để thiết lập mối quan hệ.", score: 6 },
            { text: "Sự may mắn và việc đi theo xu hướng của đám đông.", score: 2 }
        ]
    }
];

function initQuiz(): void {
    const questionContainer = document.getElementById('quiz-question-container');
    const prevBtn = document.getElementById('quiz-prev-btn') as HTMLButtonElement | null;
    const nextBtn = document.getElementById('quiz-next-btn') as HTMLButtonElement | null;
    const progressFill = document.getElementById('quiz-progress') as HTMLElement | null;
    const questionNumberLabel = document.getElementById('question-number');
    
    if (!questionContainer || !prevBtn || !nextBtn || !progressFill || !questionNumberLabel) return;

    let currentQuestionIdx = 0;
    
    const userScores: UserScores = {
        culture: 5,
        ethics: 5,
        learning: 5,
        willpower: 5,
        integration: 5
    };
    
    const selectedChoices: (number | null)[] = new Array(QUIZ_QUESTIONS.length).fill(null);

    renderRadarChart(userScores);

    function displayQuestion(): void {
        if (!nextBtn || !prevBtn || !progressFill || !questionNumberLabel || !questionContainer) return;
        
        const currentQuestion = QUIZ_QUESTIONS[currentQuestionIdx];
        const progressPercent = ((currentQuestionIdx + 1) / QUIZ_QUESTIONS.length) * 100;
        progressFill.style.width = `${progressPercent}%`;
        questionNumberLabel.textContent = `Câu hỏi ${currentQuestionIdx + 1}/${QUIZ_QUESTIONS.length}`;
        
        let html = `
            <div class="quiz-question">${currentQuestion.question}</div>
            <div class="quiz-options">
        `;
        
        currentQuestion.options.forEach((opt, idx) => {
            const isSelected = selectedChoices[currentQuestionIdx] === idx;
            html += `
                <div class="quiz-option ${isSelected ? 'selected' : ''}" data-idx="${idx}">
                    <div class="quiz-radio"></div>
                    <div class="quiz-option-text">${opt.text}</div>
                </div>
            `;
        });
        
        html += `</div>`;
        questionContainer.innerHTML = html;

        const optionsElements = questionContainer.querySelectorAll<HTMLElement>('.quiz-option');
        optionsElements.forEach(optEl => {
            optEl.addEventListener('click', () => {
                const idxStr = optEl.getAttribute('data-idx');
                if (idxStr === null) return;
                const idx = parseInt(idxStr);
                selectedChoices[currentQuestionIdx] = idx;
                
                optionsElements.forEach(el => el.classList.remove('selected'));
                optEl.classList.add('selected');
                
                const category = currentQuestion.category;
                userScores[category] = currentQuestion.options[idx].score;
                
                renderRadarChart(userScores);
            });
        });

        prevBtn.disabled = currentQuestionIdx === 0;
        
        if (currentQuestionIdx === QUIZ_QUESTIONS.length - 1) {
            nextBtn.innerHTML = `Hoàn Thành <i class="fa-solid fa-check"></i>`;
        } else {
            nextBtn.innerHTML = `Tiếp Theo <i class="fa-solid fa-chevron-right"></i>`;
        }
    }

    prevBtn.addEventListener('click', () => {
        if (currentQuestionIdx > 0) {
            currentQuestionIdx--;
            displayQuestion();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (selectedChoices[currentQuestionIdx] === null) {
            alert("Vui lòng chọn một đáp án trước khi tiếp tục!");
            return;
        }

        if (currentQuestionIdx < QUIZ_QUESTIONS.length - 1) {
            currentQuestionIdx++;
            displayQuestion();
        } else {
            showQuizResult(userScores);
        }
    });

    displayQuestion();
}

function showQuizResult(scores: UserScores): void {
    const questionContainer = document.getElementById('quiz-question-container');
    const prevBtn = document.getElementById('quiz-prev-btn');
    const nextBtn = document.getElementById('quiz-next-btn');
    const progressFill = document.getElementById('quiz-progress');
    const questionNumberLabel = document.getElementById('question-number');

    if (!questionContainer || !prevBtn || !nextBtn || !progressFill || !questionNumberLabel) return;

    progressFill.style.width = '100%';
    questionNumberLabel.textContent = 'Kết quả khảo sát';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';

    const avg = ((scores.culture + scores.ethics + scores.learning + scores.willpower + scores.integration) / 5).toFixed(1);
    let advice = "";
    if (parseFloat(avg) >= 8.5) {
        advice = "Tuyệt vời! Bạn đang sở hữu một nền tảng vững chắc cả về văn hóa, đạo đức và kỹ năng tự học hội nhập. Hãy luôn giữ tinh thần chủ động này để vươn tầm thế giới một cách tự hào nhất!";
    } else if (parseFloat(avg) >= 6.5) {
        advice = "Khá tốt! Bạn đã có nhận thức đúng đắn và chuẩn bị hành trang ổn định. Hãy rèn luyện thêm tinh thần tự học kiên trì và bản lĩnh đối đầu nghịch cảnh để tự tin hơn nữa nhé.";
    } else {
        advice = "Hãy cố gắng lên! Hành trình vươn ra thế giới đòi hỏi sự kiên trì tích lũy nội lực. Bạn cần bồi đắp thêm chiều sâu văn hóa và sự rèn luyện đạo đức tự thân để xây dựng nền móng bền vững.";
    }

    questionContainer.innerHTML = `
        <div class="quiz-result-summary" style="text-align: center; padding: 20px 0;">
            <div style="font-size: 3rem; color: var(--secondary); font-weight: 800; margin-bottom: 10px;">${avg}/10</div>
            <h4 style="font-size: 1.25rem; color: var(--text-primary); margin-bottom: 16px;">Điểm Chỉ Số Bản Sắc Toàn Diện</h4>
            <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px;">${advice}</p>
            <button class="btn btn-primary" onclick="window.location.reload()"><i class="fa-solid fa-rotate-left"></i> Thực Hiện Lại</button>
        </div>
    `;
}

function renderRadarChart(scores: UserScores): void {
    const svg = document.getElementById('radar-chart') as ISVGElement | null;
    if (!svg) return;
    svg.innerHTML = '';
    
    const cx = 200;
    const cy = 200;
    const maxR = 125;
    const totalAxes = 5;
    
    const categories = [
        { name: "Văn Hóa", key: "culture" },
        { name: "Đạo Đức", key: "ethics" },
        { name: "Tự Học", key: "learning" },
        { name: "Bản Lĩnh", key: "willpower" },
        { name: "Hội Nhập", key: "integration" }
    ];
    
    const levels = 5;
    for (let level = 1; level <= levels; level++) {
        const r = (level / levels) * maxR;
        const points: string[] = [];
        for (let i = 0; i < totalAxes; i++) {
            const angle = (i * 2 * Math.PI / totalAxes) - Math.PI / 2;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            points.push(`${x},${y}`);
        }
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', points.join(' '));
        poly.setAttribute('class', 'radar-grid');
        svg.appendChild(poly);
    }
    
    categories.forEach((cat, i) => {
        const angle = (i * 2 * Math.PI / totalAxes) - Math.PI / 2;
        const endX = cx + maxR * Math.cos(angle);
        const endY = cy + maxR * Math.sin(angle);
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', cx.toString());
        line.setAttribute('y1', cy.toString());
        line.setAttribute('x2', endX.toString());
        line.setAttribute('y2', endY.toString());
        line.setAttribute('class', 'radar-axis');
        svg.appendChild(line);
        
        const labelDistance = maxR + 25;
        const labelX = cx + labelDistance * Math.cos(angle);
        const labelY = cy + labelDistance * Math.sin(angle) + 4;
        
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', labelX.toString());
        label.setAttribute('y', labelY.toString());
        label.setAttribute('class', 'radar-label');
        label.textContent = cat.name;
        svg.appendChild(label);
    });
    
    const dataPoints: string[] = [];
    categories.forEach((cat, i) => {
        const angle = (i * 2 * Math.PI / totalAxes) - Math.PI / 2;
        const score = scores[cat.key];
        const r = (score / 10) * maxR;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        dataPoints.push(`${x},${y}`);
    });
    
    const dataPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    dataPoly.setAttribute('points', dataPoints.join(' '));
    dataPoly.setAttribute('class', 'radar-polygon');
    svg.appendChild(dataPoly);
    
    categories.forEach((cat, i) => {
        const angle = (i * 2 * Math.PI / totalAxes) - Math.PI / 2;
        const score = scores[cat.key];
        const r = (score / 10) * maxR;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        
        const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.setAttribute('cx', x.toString());
        point.setAttribute('cy', y.toString());
        point.setAttribute('r', '5');
        point.setAttribute('class', 'radar-point');
        svg.appendChild(point);
    });
}

// Fallback interface to support svg inner element typing safely
interface ISVGElement extends HTMLElement {}

/* ==========================================================================
   5. Standalone AI Chatbot Interface with Gemini API
   ========================================================================== */

function initChatbot(): void {
    const messagesContainer = document.getElementById('main-chat-messages');
    const inputField = document.getElementById('main-chat-input') as HTMLInputElement | null;
    const sendBtn = document.getElementById('main-chat-send-btn') as HTMLButtonElement | null;
    const suggestionsContainer = document.getElementById('main-chat-suggestions');

    if (!messagesContainer || !inputField || !sendBtn) {
        console.warn('Chat elements not found');
        return;
    }

    let chatHistory: Array<{ role: string; content: string }> = [];
    // Số lượt hỏi-đáp gần nhất được giữ làm ngữ cảnh (10 lượt = 20 tin nhắn)
    const MAX_HISTORY_MESSAGES = 20;
    let welcomeShown = false;

    // Render the friendly welcome / empty state
    function renderWelcome(): void {
        if (!messagesContainer) return;
        messagesContainer.innerHTML = `
            <div class="chat-welcome" id="chat-welcome">
                <div class="chat-welcome-icon"><i class="fa-solid fa-robot"></i></div>
                <h3>Xin chào! Mình là Slow AI Assistant 🌸</h3>
                <p>Mình ở đây để cùng bạn trò chuyện về văn hóa, đạo đức và hành trình phát triển bản thân theo tư tưởng Hồ Chí Minh. Hãy chọn một câu hỏi gợi ý bên dưới hoặc tự đặt câu hỏi nhé!</p>
            </div>`;
        welcomeShown = true;
    }

    function clearWelcome(): void {
        if (welcomeShown && messagesContainer) {
            const welcome = document.getElementById('chat-welcome');
            if (welcome) welcome.remove();
            welcomeShown = false;
        }
    }

    renderWelcome();

    async function handleUserMessage(displayMsg: string): Promise<void> {
        if (!displayMsg.trim() || !inputField || !messagesContainer) return;

        clearWelcome();
        if (suggestionsContainer) suggestionsContainer.style.display = 'none';
        appendMessage(displayMsg, "user");
        inputField.value = '';

        chatHistory.push({ role: "user", content: displayMsg });
        showTypingIndicator();

        const history = chatHistory.slice(-MAX_HISTORY_MESSAGES);

        // Typewriter state. The network fills `target`; an animation loop reveals
        // it at a steady speed so the text "morphs" in smoothly, independent of
        // how fast/bursty the API chunks arrive.
        const tw: {
            bubble: HTMLDivElement | null;
            target: string;
            shown: number;
            finished: boolean;
            raf: number;
            lastTs: number;
        } = { bubble: null, target: '', shown: 0, finished: false, raf: 0, lastTs: 0 };

        // Characters revealed per second — lower = slower/calmer morph effect.
        const CHARS_PER_SECOND = 45;

        const renderShown = (): void => {
            if (!tw.bubble) return;
            tw.bubble.innerHTML = formatBotText(tw.target.slice(0, Math.floor(tw.shown)));
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        };

        const startLoop = (): void => {
            if (tw.raf) return;
            const tick = (ts: number): void => {
                if (!tw.lastTs) tw.lastTs = ts;
                const dt = (ts - tw.lastTs) / 1000;
                tw.lastTs = ts;

                if (tw.shown < tw.target.length) {
                    tw.shown = Math.min(tw.target.length, tw.shown + CHARS_PER_SECOND * dt);
                    renderShown();
                }

                // Stop only once the stream is done AND all text is revealed.
                if (tw.finished && tw.shown >= tw.target.length) {
                    tw.shown = tw.target.length;
                    renderShown();
                    if (tw.bubble) tw.bubble.classList.remove('streaming');
                    tw.raf = 0;
                    return;
                }
                tw.raf = requestAnimationFrame(tick);
            };
            tw.raf = requestAnimationFrame(tick);
        };

        const ensureBubble = (): void => {
            if (tw.bubble) return;
            removeTypingIndicator();
            tw.bubble = appendMessage('', "bot");
            if (tw.bubble) tw.bubble.classList.add('streaming');
            startLoop();
        };

        // Each streamed chunk just updates the reveal target; the loop animates.
        const onChunk = (fullText: string): void => {
            ensureBubble();
            tw.target = fullText;
        };

        const finalize = (response: string): void => {
            ensureBubble();
            tw.target = response;
            tw.finished = true;
            startLoop();
            chatHistory.push({ role: "assistant", content: response });
        };

        try {
            const response = await generateChatResponseStream(displayMsg, history, onChunk);
            finalize(response);
        } catch (streamError) {
            console.warn("Streaming failed, falling back to non-stream:", streamError);
            // Fallback to the non-streaming request so a stream failure
            // (e.g. proxy without SSE support) still returns an answer.
            try {
                const response = await generateChatResponse(displayMsg, history);
                finalize(response);
            } catch (error) {
                removeTypingIndicator();
                appendMessage("Xin lỗi, có lỗi khi xử lý câu hỏi. Vui lòng thử lại.", "bot");
                console.error("Chat error:", error);
            }
        }
    }

    sendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (inputField) handleUserMessage(inputField.value);
    });

    inputField.addEventListener('keypress', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleUserMessage(inputField.value);
        }
    });

    // Wire up quick-question suggestion chips
    if (suggestionsContainer) {
        suggestionsContainer.querySelectorAll('.main-suggestion-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const question = (btn.textContent || '').trim();
                if (question) handleUserMessage(question);
            });
        });
    }

    // Escape HTML so model output can't inject markup.
    function escapeHtml(s: string): string {
        return s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // Inline markdown: **bold**, *italic*, and "quoted phrases" → highlighted.
    function formatInline(s: string): string {
        return s
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
            // straight and curly double quotes → highlighted quote
            .replace(/[“"]([^”"\n]+)[”"]/g, '<strong class="hl-quote">“$1”</strong>');
    }

    // Convert a bot message (markdown-ish) into formatted HTML blocks:
    // paragraphs, line breaks, bullet/numbered lists.
    function formatBotText(raw: string): string {
        const text = escapeHtml(raw.trim());
        const blocks = text.split(/\n{2,}/);

        return blocks.map(block => {
            const lines = block.split('\n').filter(l => l.trim() !== '');
            if (lines.length === 0) return '';

            const isBullet = lines.every(l => /^\s*[-*•]\s+/.test(l));
            const isNumbered = lines.every(l => /^\s*\d+[.)]\s+/.test(l));

            if (isBullet) {
                return '<ul>' + lines
                    .map(l => `<li>${formatInline(l.replace(/^\s*[-*•]\s+/, ''))}</li>`)
                    .join('') + '</ul>';
            }
            if (isNumbered) {
                return '<ol>' + lines
                    .map(l => `<li>${formatInline(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`)
                    .join('') + '</ol>';
            }
            return '<p>' + lines.map(formatInline).join('<br>') + '</p>';
        }).join('');
    }

    // Create a message row and return its bubble element (for live updates).
    function appendMessage(text: string, sender: 'bot' | 'user'): HTMLDivElement | null {
        if (!messagesContainer) return null;

        const row = document.createElement('div');
        row.className = `chat-row ${sender}`;
        const avatarIcon = sender === 'bot' ? 'fa-robot' : 'fa-user';

        const avatar = document.createElement('div');
        avatar.className = 'chat-row-avatar';
        avatar.innerHTML = `<i class="fa-solid ${avatarIcon}"></i>`;

        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}`;
        bubble.innerHTML = sender === 'bot' ? formatBotText(text) : escapeHtml(text);

        row.appendChild(avatar);
        row.appendChild(bubble);
        messagesContainer.appendChild(row);

        // Auto-scroll to bottom with delay to ensure render
        setTimeout(() => {
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }, 0);

        return bubble;
    }

    function showTypingIndicator(): void {
        if (!messagesContainer) return;
        const ind = document.createElement('div');
        ind.className = 'chat-typing-indicator';
        ind.id = 'main-chat-typing-indicator';
        ind.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(ind);
        
        setTimeout(() => {
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }, 0);
    }

    function removeTypingIndicator(): void {
        const ind = document.getElementById('main-chat-typing-indicator');
        if (ind) ind.remove();
    }
}

/* ==========================================================================
   6. Minigame: Memory Pairing Card Game
   ========================================================================== */
interface GameCardData {
    id: number;
    text: string;
    pairId: number;
    type: 'value' | 'explanation';
}

const GAME_CARDS_DATA: GameCardData[] = [
    { id: 1, text: "CẦN", pairId: 1, type: "value" },
    { id: 2, text: "Siêng năng, chăm chỉ, lao động có kế hoạch và năng suất cao.", pairId: 1, type: "explanation" },
    
    { id: 3, text: "KIỆM", pairId: 2, type: "value" },
    { id: 4, text: "Tiết kiệm thời gian, công sức, tiền bạc của mình và của chung.", pairId: 2, type: "explanation" },
    
    { id: 5, text: "LIÊM", pairId: 3, type: "value" },
    { id: 6, text: "Trong sạch, luôn tôn trọng của công, không tham nhũng vị kỷ.", pairId: 3, type: "explanation" },
    
    { id: 7, text: "CHÍNH", pairId: 4, type: "value" },
    { id: 8, text: "Thẳng thắn, đứng đắn, làm việc nghĩa, lánh xa việc ác xấu.", pairId: 4, type: "explanation" }
];

function initMinigame(): void {
    const grid = document.getElementById('game-grid-cards');
    const scoreVal = document.getElementById('game-score-val');
    const statusMsg = document.getElementById('game-status-msg');
    const resetBtn = document.getElementById('game-reset-btn');
    const successPanel = document.getElementById('game-success-panel');
    const successReplayBtn = document.getElementById('game-success-replay-btn');

    if (!grid || !scoreVal || !statusMsg || !resetBtn || !successPanel || !successReplayBtn) return;

    let flippedCards: HTMLDivElement[] = [];
    let matchedCount = 0;
    let isBusy = false;

    function shuffle<T>(array: T[]): T[] {
        let currentIndex = array.length, temp, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temp = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temp;
        }
        return array;
    }

    function setupGame(): void {
        if (!grid || !scoreVal || !statusMsg || !successPanel) return;
        grid.innerHTML = '';
        flippedCards = [];
        matchedCount = 0;
        isBusy = false;
        scoreVal.textContent = '0';
        statusMsg.textContent = 'Hãy chọn một thẻ bài để bắt đầu!';
        successPanel.classList.remove('active');

        const gameCards = shuffle([...GAME_CARDS_DATA]);

        gameCards.forEach(c => {
            const cardEl = document.createElement('div');
            cardEl.className = 'game-card';
            cardEl.setAttribute('data-pair-id', c.pairId.toString());
            cardEl.setAttribute('data-id', c.id.toString());
            
            cardEl.innerHTML = `
                <div class="game-card-front"><i class="fa-solid fa-lotus"></i></div>
                <div class="game-card-back">
                    <span class="card-type-label">${c.type === 'value' ? 'Chuẩn mực' : 'Giải nghĩa'}</span>
                    <span class="card-value" style="font-size: ${c.type === 'value' ? '1.5rem' : '0.82rem'}">${c.text}</span>
                </div>
            `;
            
            cardEl.addEventListener('click', () => handleCardClick(cardEl));
            grid.appendChild(cardEl);
        });
    }

    function handleCardClick(card: HTMLDivElement): void {
        if (isBusy || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        card.classList.add('flipped');
        flippedCards.push(card);

        if (statusMsg) statusMsg.textContent = 'Đang tìm thẻ ghép cặp tương ứng...';

        if (flippedCards.length === 2) {
            isBusy = true;
            checkMatch();
        }
    }

    function checkMatch(): void {
        const card1 = flippedCards[0];
        const card2 = flippedCards[1];
        
        const pairId1 = card1.getAttribute('data-pair-id');
        const pairId2 = card2.getAttribute('data-pair-id');
        
        const id1 = card1.getAttribute('data-id');
        const id2 = card2.getAttribute('data-id');

        if (pairId1 === pairId2 && id1 !== id2) {
            setTimeout(() => {
                card1.classList.add('matched');
                card2.classList.add('matched');
                flippedCards = [];
                matchedCount++;
                if (scoreVal) scoreVal.textContent = matchedCount.toString();
                if (statusMsg) statusMsg.textContent = 'Chính xác! Cặp thẻ đã được ghép.';
                isBusy = false;

                if (matchedCount === GAME_CARDS_DATA.length / 2) {
                    winGame();
                }
            }, 600);
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                if (statusMsg) statusMsg.textContent = 'Chưa đúng rồi! Hãy thử cặp thẻ khác.';
                isBusy = false;
            }, 1200);
        }
    }

    function winGame(): void {
        if (statusMsg) statusMsg.textContent = 'Tuyệt vời! Bạn đã hoàn thành trò chơi.';
        setTimeout(() => {
            if (successPanel) successPanel.classList.add('active');
        }, 800);
    }

    resetBtn.addEventListener('click', setupGame);
    successReplayBtn.addEventListener('click', setupGame);

    setupGame();
}

/* ==========================================================================
   7. Scroll triggered Viewport Animations
   ========================================================================== */
function initScrollAnimations(): void {
    const animElements = document.querySelectorAll<HTMLElement>('.animate-on-scroll');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   8. Landing Page Hero Carousel Controller
   ========================================================================== */
function initHeroCarousel(): void {
    const container = document.getElementById('hero-carousel');
    const slides = document.querySelectorAll<HTMLElement>('#hero-carousel .carousel-slide');
    const prevBtn = document.getElementById('hero-carousel-prev');
    const nextBtn = document.getElementById('hero-carousel-next');
    const dots = document.querySelectorAll<HTMLButtonElement>('#hero-carousel .carousel-dot');
    
    if (!container || slides.length === 0) return;
    
    let currentSlide = 0;
    let autoPlayTimer: number | null = null;
    const autoPlayInterval = 6000; // 6 seconds
    
    function showSlide(index: number): void {
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;
        
        currentSlide = index;
        
        // Update slides active state
        slides.forEach((slide, idx) => {
            if (idx === currentSlide) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        // Update indicators active state
        dots.forEach((dot, idx) => {
            if (idx === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    function nextSlide(): void {
        showSlide(currentSlide + 1);
    }
    
    function prevSlide(): void {
        showSlide(currentSlide - 1);
    }
    
    function startAutoPlay(): void {
        stopAutoPlay();
        autoPlayTimer = window.setInterval(nextSlide, autoPlayInterval);
    }
    
    function stopAutoPlay(): void {
        if (autoPlayTimer !== null) {
            window.clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoPlay(); // Reset auto-play timer
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoPlay(); // Reset auto-play timer
        });
    }
    
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            showSlide(idx);
            startAutoPlay(); // Reset auto-play timer
        });
    });
    
    // Auto-play control: Pause on mouse enter, resume on mouse leave
    container.addEventListener('mouseenter', stopAutoPlay);
    container.addEventListener('mouseleave', startAutoPlay);
    
    // Initialize first slide and start timer
    showSlide(0);
    startAutoPlay();
}

