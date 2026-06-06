// --- Lotus Identity Interactive Application Logic ---

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    init3DTilt();
    initTabNavigation();
    initQuiz();
    initChatbot();
    initMinigame();
    initScrollAnimations();
});

/* ==========================================================================
   1. Tab Navigation Management (SPA Architecture)
   ========================================================================== */
function initTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    const switchBtns = document.querySelectorAll('.switch-tab-btn');

    function switchTab(tabId) {
        // Remove active class from all tabs & contents
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        // Add active to targeted tab & content
        const targetTab = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
        const targetContent = document.getElementById(tabId);

        if (targetTab && targetContent) {
            targetTab.classList.add('active');
            targetContent.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-tab');
            switchTab(targetId);
        });
    });

    // In-page CTA tab switch buttons
    switchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            switchTab(targetId);
        });
    });
}

/* ==========================================================================
   2. Canvas Particle Background (Golden Lotus Seeds)
   ========================================================================== */
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height + height;
            this.size = Math.random() * 3 + 1;
            this.speedY = -(Math.random() * 0.8 + 0.2);
            this.speedX = Math.random() * 0.4 - 0.2;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = Math.random() > 0.5 ? 'hsl(38, 92%, 50%)' : 'hsl(340, 82%, 60%)';
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            if (this.y < 100) {
                this.opacity -= 0.01;
            }
            if (this.y < 0 || this.opacity <= 0) {
                this.x = Math.random() * width;
                this.y = height + Math.random() * 50;
                this.speedY = -(Math.random() * 0.8 + 0.2);
                this.speedX = Math.random() * 0.4 - 0.2;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.restore();
        }
    }

    function init() {
        particlesArray = [];
        const numberOfParticles = Math.min(50, Math.floor((width * height) / 25000));
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
            particlesArray[i].y = Math.random() * height;
        }
    }

    function animate() {
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
function init3DTilt() {
    const cards = document.querySelectorAll('[data-tilt]');
    
    if (window.matchMedia('(hover: hover)').matches) {
        cards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((centerY - y) / centerY) * 10;
                const rotateY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
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
const QUIZ_QUESTIONS = [
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

function initQuiz() {
    const questionContainer = document.getElementById('quiz-question-container');
    const prevBtn = document.getElementById('quiz-prev-btn');
    const nextBtn = document.getElementById('quiz-next-btn');
    const progressFill = document.getElementById('quiz-progress');
    const questionNumberLabel = document.getElementById('question-number');
    
    if (!questionContainer) return;

    let currentQuestionIdx = 0;
    
    const userScores = {
        culture: 5,
        ethics: 5,
        learning: 5,
        willpower: 5,
        integration: 5
    };
    
    const selectedChoices = new Array(QUIZ_QUESTIONS.length).fill(null);

    renderRadarChart(userScores);

    function displayQuestion() {
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

        const optionsElements = questionContainer.querySelectorAll('.quiz-option');
        optionsElements.forEach(optEl => {
            optEl.addEventListener('click', () => {
                const idx = parseInt(optEl.getAttribute('data-idx'));
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

function showQuizResult(scores) {
    const questionContainer = document.getElementById('quiz-question-container');
    const prevBtn = document.getElementById('quiz-prev-btn');
    const nextBtn = document.getElementById('quiz-next-btn');
    const progressFill = document.getElementById('quiz-progress');
    const questionNumberLabel = document.getElementById('question-number');

    progressFill.style.width = '100%';
    questionNumberLabel.textContent = 'Kết quả khảo sát';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';

    const avg = ((scores.culture + scores.ethics + scores.learning + scores.willpower + scores.integration) / 5).toFixed(1);
    let advice = "";
    if (avg >= 8.5) {
        advice = "Tuyệt vời! Bạn đang sở hữu một nền tảng vững chắc cả về văn hóa, đạo đức và kỹ năng tự học hội nhập. Hãy luôn giữ tinh thần chủ động này để vươn tầm thế giới một cách tự hào nhất!";
    } else if (avg >= 6.5) {
        advice = "Khá tốt! Bạn đã có nhận thức đúng đắn và chuẩn bị hành trang ổn định. Hãy rèn luyện thêm tinh thần tự học kiên trì và bản lĩnh đối đầu nghịch cảnh để tự tin hơn nữa nhé.";
    } else {
        advice = "Hãy cố gắng lên! Hành trình vươn ra thế giới đòi hỏi sự kiên trì tích lũy nội lực. Bạn cần bồi đắp thêm chiều sâu văn hóa và sự rèn luyện đạo đức tự thân để xây dựng nền móng bền vững.";
    }

    questionContainer.innerHTML = `
        <div class="quiz-result-summary" style="text-align: center; padding: 20px 0;">
            <div style="font-size: 3rem; color: var(--secondary); font-weight: 800; margin-bottom: 10px;">${avg}/10</div>
            <h4 style="font-size: 1.25rem; color: white; margin-bottom: 16px;">Điểm Chỉ Số Bản Sắc Toàn Diện</h4>
            <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px;">${advice}</p>
            <button class="btn btn-primary" onclick="window.location.reload()"><i class="fa-solid fa-rotate-left"></i> Thực Hiện Lại</button>
        </div>
    `;
}

function renderRadarChart(scores) {
    const svg = document.getElementById('radar-chart');
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
        const points = [];
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
        line.setAttribute('x1', cx);
        line.setAttribute('y1', cy);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        line.setAttribute('class', 'radar-axis');
        svg.appendChild(line);
        
        const labelDistance = maxR + 25;
        const labelX = cx + labelDistance * Math.cos(angle);
        const labelY = cy + labelDistance * Math.sin(angle) + 4;
        
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', labelX);
        label.setAttribute('y', labelY);
        label.setAttribute('class', 'radar-label');
        label.textContent = cat.name;
        svg.appendChild(label);
    });
    
    const dataPoints = [];
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
        point.setAttribute('cx', x);
        point.setAttribute('cy', y);
        point.setAttribute('r', 5);
        point.setAttribute('class', 'radar-point');
        svg.appendChild(point);
    });
}

/* ==========================================================================
   5. Standalone AI Chatbot Interface Simulator
   ========================================================================== */
const CHAT_QA_DATABASE = [
    {
        keywords: ["văn hóa", "bản sắc", "giữ bản sắc", "hòa tan", "bảo tồn"],
        response: "Giữ vững bản sắc văn hóa Việt Nam chính là chiếc neo giúp bạn không bị hòa tan khi bước vào dòng chảy toàn cầu. Hồ Chí Minh chỉ ra văn hóa là nền tảng tinh thần của xã hội. Sinh viên FPT cần lấy lòng tự tôn dân tộc và chuẩn mực văn hóa ứng xử Việt Nam làm nền móng tự tin giao tiếp thế giới."
    },
    {
        keywords: ["đạo đức", "đóng vai trò gì", "đạo đức cách mạng", "cần kiệm", "chính trực"],
        response: "Bác Hồ nhấn mạnh: 'Có tài mà không có đức là người vô dụng, có đức mà không có tài thì làm việc gì cũng khó'. Trong bối cảnh hội nhập, đạo đức đóng vai trò làm thước đo độ uy tín của cá nhân và doanh nghiệp Việt Nam trên trường quốc tế. Việc thực hành trung thực và tôn trọng cam kết là chìa khóa thành công."
    },
    {
        keywords: ["tự học", "học ngoại ngữ", "bác hồ tự học", "phát triển bản thân"],
        response: "Hành trình vươn ra thế giới của Nguyễn Ái Quốc là một tấm gương tự học vĩ đại. Bác học ngoại ngữ mọi nơi: học từ đồng nghiệp, viết chữ lên cánh tay khi làm bếp. Ngày nay, sinh viên FPT có đầy đủ công nghệ AI hỗ trợ, tinh thần tự học càng đóng vai trò định đoạt tốc độ thích nghi của bạn."
    },
    {
        keywords: ["sốc văn hóa", "áp lực", "khó khăn", "tự tin", "vấp ngã"],
        response: "Khi gặp sốc văn hóa hay áp lực hội nhập, hãy nhớ câu thơ của Bác: 'Gian nan rèn luyện mới thành công'. Xem khó khăn là thuốc thử rèn ý chí bản lĩnh. Hãy chủ động giao tiếp, chia sẻ văn hóa song phương và giữ một thái độ cởi mở để tiếp thu tri thức mới."
    }
];

function initChatbot() {
    const messagesContainer = document.getElementById('main-chat-messages');
    const inputField = document.getElementById('main-chat-input');
    const sendBtn = document.getElementById('main-chat-send-btn');
    const suggestionsContainer = document.getElementById('main-chat-suggestions');

    if (!messagesContainer) return;

    let botGreetingSent = false;

    // Trigger greeting when chat section loaded (using Mutation/Intersection or just simple tab click check)
    // To make it simple, we listen to clicks on the AI tab button
    const chatTabBtn = document.querySelector('.nav-tab[data-tab="tab-chat"]');
    if (chatTabBtn) {
        chatTabBtn.addEventListener('click', () => {
            if (!botGreetingSent) {
                sendGreeting();
            }
        });
    }

    function sendGreeting() {
        botGreetingSent = true;
        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            appendMessage("Xin chào! Tôi là **Lotus AI Mentor**. Tôi ở đây để hỗ trợ bạn định vị bản sắc và phát triển kỹ năng hội nhập quốc tế theo tư tưởng Hồ Chí Minh. Bạn có câu hỏi nào không?", "bot");
            renderSuggestions();
        }, 1000);
    }

    const suggestions = [
        { label: "Làm sao giữ bản sắc Việt?", query: "giữ bản sắc văn hóa" },
        { label: "Đạo đức đóng vai trò gì khi hội nhập?", query: "đạo đức đóng vai trò gì" },
        { label: "Bác Hồ tự học ngoại ngữ thế nào?", query: "bác hồ tự học ngoại ngữ" },
        { label: "Làm thế nào vượt qua khó khăn sốc văn hóa?", query: "khó khăn sốc văn hóa áp lực" }
    ];

    function renderSuggestions() {
        suggestionsContainer.innerHTML = '';
        suggestions.forEach(s => {
            const btn = document.createElement('button');
            btn.className = 'main-suggestion-btn';
            btn.textContent = s.label;
            btn.addEventListener('click', () => {
                handleUserMessage(s.label, s.query);
            });
            suggestionsContainer.appendChild(btn);
        });
    }

    function handleUserMessage(displayMsg, searchTerms = "") {
        if (!displayMsg.trim()) return;

        appendMessage(displayMsg, "user");
        inputField.value = '';
        
        const searchQuery = (searchTerms || displayMsg).toLowerCase();
        
        showTypingIndicator();
        
        let matchedResponse = "Câu hỏi của bạn rất hay. Thực chất, trong môn học HCM202, Bác chỉ rõ 'Hiểu mình' chính là tự giác ngộ ý thức và sửa đổi hạn chế bản thân. Đạo đức, văn hóa và ý chí tự lực cánh sinh chính là hành trang vững nhất của con người thời đại mới. Bạn có muốn đi sâu vào mục tiêu tự học ngoại ngữ hay giữ gìn văn hóa truyền thống không?";
        
        for (const item of CHAT_QA_DATABASE) {
            if (item.keywords.some(kw => searchQuery.includes(kw))) {
                matchedResponse = item.response;
                break;
            }
        }

        setTimeout(() => {
            removeTypingIndicator();
            appendMessage(matchedResponse, "bot");
        }, 1200);
    }

    sendBtn.addEventListener('click', () => {
        handleUserMessage(inputField.value);
    });

    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserMessage(inputField.value);
        }
    });

    function appendMessage(text, sender) {
        const msg = document.createElement('div');
        msg.className = `chat-bubble ${sender}`;
        const parsedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        msg.innerHTML = parsedText;
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTypingIndicator() {
        const ind = document.createElement('div');
        ind.className = 'chat-typing-indicator';
        ind.id = 'main-chat-typing-indicator';
        ind.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(ind);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeTypingIndicator() {
        const ind = document.getElementById('main-chat-typing-indicator');
        if (ind) ind.remove();
    }
}

/* ==========================================================================
   6. Minigame: Memory Pairing Card Game
   ========================================================================== */
const GAME_CARDS_DATA = [
    // Pairs: { id, text, pairId, type: 'value' | 'explanation' }
    { id: 1, text: "CẦN", pairId: 1, type: "value" },
    { id: 2, text: "Siêng năng, chăm chỉ, lao động có kế hoạch và năng suất cao.", pairId: 1, type: "explanation" },
    
    { id: 3, text: "KIỆM", pairId: 2, type: "value" },
    { id: 4, text: "Tiết kiệm thời gian, công sức, tiền bạc của mình và của chung.", pairId: 2, type: "explanation" },
    
    { id: 5, text: "LIÊM", pairId: 3, type: "value" },
    { id: 6, text: "Trong sạch, luôn tôn trọng của công, không tham nhũng vị kỷ.", pairId: 3, type: "explanation" },
    
    { id: 7, text: "CHÍNH", pairId: 4, type: "value" },
    { id: 8, text: "Thẳng thắn, đứng đắn, làm việc nghĩa, lánh xa việc ác xấu.", pairId: 4, type: "explanation" }
];

function initMinigame() {
    const grid = document.getElementById('game-grid-cards');
    const scoreVal = document.getElementById('game-score-val');
    const statusMsg = document.getElementById('game-status-msg');
    const resetBtn = document.getElementById('game-reset-btn');
    const successPanel = document.getElementById('game-success-panel');
    const successReplayBtn = document.getElementById('game-success-replay-btn');

    if (!grid) return;

    let flippedCards = [];
    let matchedCount = 0;
    let isBusy = false; // Lock flipping during mismatch check

    // Shuffle Array Helper
    function shuffle(array) {
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

    function setupGame() {
        grid.innerHTML = '';
        flippedCards = [];
        matchedCount = 0;
        isBusy = false;
        scoreVal.textContent = '0';
        statusMsg.textContent = 'Hãy chọn một thẻ bài để bắt đầu!';
        successPanel.classList.remove('active');

        // Shuffle cards
        const gameCards = shuffle([...GAME_CARDS_DATA]);

        // Generate HTML
        gameCards.forEach(c => {
            const cardEl = document.createElement('div');
            cardEl.className = 'game-card';
            cardEl.setAttribute('data-pair-id', c.pairId);
            cardEl.setAttribute('data-id', c.id);
            
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

    function handleCardClick(card) {
        // Stop if clicking already flipped or matched card, or game is busy
        if (isBusy || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        // Flip card
        card.classList.add('flipped');
        flippedCards.push(card);

        statusMsg.textContent = 'Đang tìm thẻ ghép cặp tương ứng...';

        if (flippedCards.length === 2) {
            isBusy = true;
            checkMatch();
        }
    }

    function checkMatch() {
        const card1 = flippedCards[0];
        const card2 = flippedCards[1];
        
        const pairId1 = card1.getAttribute('data-pair-id');
        const pairId2 = card2.getAttribute('data-pair-id');
        
        const id1 = card1.getAttribute('data-id');
        const id2 = card2.getAttribute('data-id');

        if (pairId1 === pairId2 && id1 !== id2) {
            // MATCH!
            setTimeout(() => {
                card1.classList.add('matched');
                card2.classList.add('matched');
                flippedCards = [];
                matchedCount++;
                scoreVal.textContent = matchedCount;
                statusMsg.textContent = 'Chính xác! Cặp thẻ đã được ghép.';
                isBusy = false;

                // Check Win
                if (matchedCount === GAME_CARDS_DATA.length / 2) {
                    winGame();
                }
            }, 600);
        } else {
            // NOT A MATCH
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                statusMsg.textContent = 'Chưa đúng rồi! Hãy thử cặp thẻ khác.';
                isBusy = false;
            }, 1200);
        }
    }

    function winGame() {
        statusMsg.textContent = 'Tuyệt vời! Bạn đã hoàn thành trò chơi.';
        setTimeout(() => {
            successPanel.classList.add('active');
        }, 800);
    }

    resetBtn.addEventListener('click', setupGame);
    successReplayBtn.addEventListener('click', setupGame);

    setupGame();
}

/* ==========================================================================
   7. Scroll triggered Viewport Animations
   ========================================================================== */
function initScrollAnimations() {
    const animElements = document.querySelectorAll('.animate-on-scroll');
    
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
