// --- Lotus Identity Interactive Application Logic ---

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    init3DTilt();
    initQuiz();
    initChatbot();
    initScrollAnimations();
});

/* ==========================================================================
   1. Canvas Particle Background (Golden Lotus Seeds)
   ========================================================================== */
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Handle Resize
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Particle Object
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height + height; // Start from bottom
            this.size = Math.random() * 3 + 1; // Size 1px to 4px
            this.speedY = -(Math.random() * 0.8 + 0.2); // Upward speed
            this.speedX = Math.random() * 0.4 - 0.2; // Drifting speed
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = Math.random() > 0.5 ? 'hsl(38, 92%, 50%)' : 'hsl(340, 82%, 60%)'; // Gold or Pink
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            
            // Fade out near top
            if (this.y < 100) {
                this.opacity -= 0.01;
            }

            // Reset when invisible or off-screen
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

    // Initialize Particles Array (limited to 60 for performance)
    function init() {
        particlesArray = [];
        const numberOfParticles = Math.min(60, Math.floor((width * height) / 20000));
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
            // Pre-warm particles so they are already spread out
            particlesArray[i].y = Math.random() * height;
        }
    }

    // Animation Loop
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
   2. 3D Card Tilt Effect
   ========================================================================== */
function init3DTilt() {
    const cards = document.querySelectorAll('[data-tilt]');
    
    // Check if device supports hover
    if (window.matchMedia('(hover: hover)').matches) {
        cards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; // x coordinate within card
                const y = e.clientY - rect.top;  // y coordinate within card
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Tilt calculation (Max tilt 12 degrees)
                const rotateX = ((centerY - y) / centerY) * 12;
                const rotateY = ((x - centerX) / centerX) * 12;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });
    }
}

/* ==========================================================================
   3. Interactive Diagnostic Quiz & SVG Radar Chart
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
            { text: "Thẳng thắn trao đổi riêng với bạn để sửa đổi, hướng tới sự chính trực ('Liêm, Chính') trong học tập.", score: 10 },
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
    
    let currentQuestionIdx = 0;
    
    // Scores configuration for Radar chart
    // Categories: Culture, Ethics, Self-learning (learning), Willpower (willpower), Integration
    const userScores = {
        culture: 5,
        ethics: 5,
        learning: 5,
        willpower: 5,
        integration: 5
    };
    
    // Track selected choices
    const selectedChoices = new Array(QUIZ_QUESTIONS.length).fill(null);

    // Initial Chart Render
    renderRadarChart(userScores);

    function displayQuestion() {
        const currentQuestion = QUIZ_QUESTIONS[currentQuestionIdx];
        
        // Progress update
        const progressPercent = ((currentQuestionIdx + 1) / QUIZ_QUESTIONS.length) * 100;
        progressFill.style.width = `${progressPercent}%`;
        questionNumberLabel.textContent = `Câu hỏi ${currentQuestionIdx + 1}/${QUIZ_QUESTIONS.length}`;
        
        // Question HTML
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

        // Add Event Listeners to Options
        const optionsElements = questionContainer.querySelectorAll('.quiz-option');
        optionsElements.forEach(optEl => {
            optEl.addEventListener('click', () => {
                const idx = parseInt(optEl.getAttribute('data-idx'));
                selectedChoices[currentQuestionIdx] = idx;
                
                // Highlight option
                optionsElements.forEach(el => el.classList.remove('selected'));
                optEl.classList.add('selected');
                
                // Update score
                const category = currentQuestion.category;
                userScores[category] = currentQuestion.options[idx].score;
                
                // Update Radar Chart dynamically!
                renderRadarChart(userScores);
            });
        });

        // Prev Button state
        prevBtn.disabled = currentQuestionIdx === 0;
        
        // Next Button text
        if (currentQuestionIdx === QUIZ_QUESTIONS.length - 1) {
            nextBtn.innerHTML = `Hoàn Thành <i class="fa-solid fa-check"></i>`;
        } else {
            nextBtn.innerHTML = `Tiếp Theo <i class="fa-solid fa-chevron-right"></i>`;
        }
    }

    // Navigation triggers
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
            // Show complete summary modal or text update
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

    // Calculate average
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

// Radar Chart Rendering inside SVG
function renderRadarChart(scores) {
    const svg = document.getElementById('radar-chart');
    svg.innerHTML = ''; // Clear previous SVG contents
    
    const cx = 200;
    const cy = 200;
    const maxR = 120;
    const totalAxes = 5;
    
    // Dimensions names mapped to scores keys
    const categories = [
        { name: "Văn Hóa", key: "culture", color: "hsl(340, 82%, 60%)" },
        { name: "Đạo Đức", key: "ethics", color: "hsl(38, 92%, 50%)" },
        { name: "Tự Học", key: "learning", color: "hsl(190, 90%, 50%)" },
        { name: "Bản Lĩnh", key: "willpower", color: "hsl(145, 80%, 50%)" },
        { name: "Hội Nhập", key: "integration", color: "hsl(280, 80%, 65%)" }
    ];
    
    // 1. Draw grid circles (concentric polygons/circles)
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
    
    // 2. Draw axes lines and labels
    categories.forEach((cat, i) => {
        const angle = (i * 2 * Math.PI / totalAxes) - Math.PI / 2;
        
        // Axis line
        const endX = cx + maxR * Math.cos(angle);
        const endY = cy + maxR * Math.sin(angle);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', cx);
        line.setAttribute('y1', cy);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        line.setAttribute('class', 'radar-axis');
        svg.appendChild(line);
        
        // Label position (further out)
        const labelDistance = maxR + 25;
        const labelX = cx + labelDistance * Math.cos(angle);
        const labelY = cy + labelDistance * Math.sin(angle) + 4; // micro-adjust height
        
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', labelX);
        label.setAttribute('y', labelY);
        label.setAttribute('class', 'radar-label');
        label.textContent = cat.name;
        svg.appendChild(label);
    });
    
    // 3. Draw active data polygon
    const dataPoints = [];
    categories.forEach((cat, i) => {
        const angle = (i * 2 * Math.PI / totalAxes) - Math.PI / 2;
        const score = scores[cat.key]; // 1 to 10
        const r = (score / 10) * maxR;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        dataPoints.push(`${x},${y}`);
    });
    
    const dataPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    dataPoly.setAttribute('points', dataPoints.join(' '));
    dataPoly.setAttribute('class', 'radar-polygon');
    svg.appendChild(dataPoly);
    
    // 4. Draw dots on the vertices
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
   4. Mock AI Mentor Chatbot
   ========================================================================== */
const CHAT_QA_DATABASE = [
    {
        keywords: ["văn hóa", "bản sắc", "giữ bản sắc", "hòa tan"],
        response: "Giữ vững bản sắc văn hóa Việt Nam chính là cái 'gốc' vững chắc nhất giúp bạn không bị hòa tan khi ra thế giới. Hồ Chí Minh từng nhấn mạnh, văn hóa chính là nền tảng tinh thần của xã hội, vừa là mục tiêu vừa là động lực của sự phát triển. Hãy tự hào và lan tỏa văn hóa ẩm thực, trang phục, các truyền thống chính trực của dân tộc tới bạn bè quốc tế."
    },
    {
        keywords: ["đạo đức", "đóng vai trò gì", "đạo đức hội nhập", "làm người"],
        response: "Bác Hồ dạy: 'Có tài mà không có đức là người vô dụng, có đức mà không có tài thì làm việc gì cũng khó'. Trong hội nhập, đạo đức đóng vai trò làm thước đo giá trị uy tín cá nhân của bạn đối với cộng đồng quốc tế. Sự chính trực (Liêm, Chính), tính tôn trọng lẽ phải và tinh thần trách nhiệm chính là vũ khí mạnh nhất của bạn."
    },
    {
        keywords: ["tự học", "học ngoại ngữ", "bác hồ tự học", "phát triển kỹ năng"],
        response: "Hành trình vươn ra thế giới của Nguyễn Ái Quốc là minh chứng vĩ đại nhất của việc tự học. Người đã tự học tiếng Pháp, tiếng Anh, tiếng Trung... thông qua việc viết từ mới lên cánh tay khi làm phụ bếp, kiên trì học mọi lúc mọi nơi. Là sinh viên FPT, bạn có công nghệ số hỗ trợ, hãy tận dụng nó để tự nâng cấp năng lực mỗi ngày."
    },
    {
        keywords: ["tự tin", "giao tiếp", "sốc văn hóa", "áp lực", "khó khăn"],
        response: "Để tự tin giao tiếp quốc tế, trước hết bạn phải 'hiểu mình' - biết rõ thế mạnh và chấp nhận những điểm chưa hoàn thiện. Khi gặp áp lực hay sốc văn hóa, hãy bình tĩnh nhìn nhận khó khăn như một bài test rèn luyện bản lĩnh con người ('gian nan rèn ý chí'). Hãy mở lòng chia sẻ và không ngừng học hỏi từ xung quanh."
    }
];

function initChatbot() {
    const trigger = document.getElementById('chatbot-trigger');
    const container = document.getElementById('chatbot');
    const closeBtn = document.getElementById('chat-close-btn');
    const messagesContainer = document.getElementById('chatbot-messages');
    const inputField = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const suggestionsContainer = document.getElementById('chatbot-suggestions');
    const headerToggleBtn = document.getElementById('header-chat-btn');

    let botGreetingSent = false;

    // Toggle Chatbot Window
    function openChat() {
        container.classList.add('active');
        if (!botGreetingSent) {
            sendGreeting();
        }
    }
    
    function closeChat() {
        container.classList.remove('active');
    }

    trigger.addEventListener('click', openChat);
    headerToggleBtn.addEventListener('click', openChat);
    closeBtn.addEventListener('click', closeChat);

    // Send Default Greeting
    function sendGreeting() {
        botGreetingSent = true;
        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            appendMessage("Xin chào! Tôi là **AI Mentor** đồng hành cùng bạn trên hành trình khám phá bản thân và hội nhập toàn cầu. Bạn muốn trao đổi về chủ đề gì nào?", "bot");
            renderSuggestions();
        }, 1200);
    }

    // Suggestions Generator
    const suggestions = [
        { label: "Làm sao để giữ bản sắc văn hóa Việt?", query: "văn hóa bản sắc giữ bản sắc" },
        { label: "Đạo đức đóng vai trò gì khi hội nhập?", query: "đạo đức đóng vai trò gì" },
        { label: "Bác Hồ tự học ngoại ngữ thế nào?", query: "tự học bác hồ học ngoại ngữ" },
        { label: "Làm thế nào vượt qua sốc văn hóa?", query: "tự tin khó khăn áp lực" }
    ];

    function renderSuggestions() {
        suggestionsContainer.innerHTML = '';
        suggestions.forEach(s => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-btn';
            btn.textContent = s.label;
            btn.addEventListener('click', () => {
                handleUserMessage(s.label, s.query);
            });
            suggestionsContainer.appendChild(btn);
        });
    }

    // Send Chat Logic
    function handleUserMessage(displayMsg, searchTerms = "") {
        if (!displayMsg.trim()) return;

        appendMessage(displayMsg, "user");
        inputField.value = '';
        
        const searchQuery = (searchTerms || displayMsg).toLowerCase();
        
        showTypingIndicator();
        
        // Match response
        let matchedResponse = "Tôi hiểu ý bạn. Trong môn học HCM202, việc thấu hiểu bản thân ('Hiểu mình') chính là tiền đề then chốt. Đạo đức rèn luyện nhân cách, văn hóa đóng vai trò định hình bản sắc, giúp chúng ta hội nhập mà không hòa tan. Bạn có muốn hỏi sâu hơn về khía cạnh nào không?";
        
        for (const item of CHAT_QA_DATABASE) {
            if (item.keywords.some(kw => searchQuery.includes(kw))) {
                matchedResponse = item.response;
                break;
            }
        }

        setTimeout(() => {
            removeTypingIndicator();
            appendMessage(matchedResponse, "bot");
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1500);
    }

    sendBtn.addEventListener('click', () => {
        handleUserMessage(inputField.value);
    });

    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserMessage(inputField.value);
        }
    });

    // Helper Functions
    function appendMessage(text, sender) {
        const msg = document.createElement('div');
        msg.className = `chat-message ${sender}`;
        
        // Simple Markdown parsing for bold text
        const parsedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        msg.innerHTML = parsedText;
        
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTypingIndicator() {
        const ind = document.createElement('div');
        ind.className = 'typing-indicator';
        ind.id = 'chat-typing-indicator';
        ind.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(ind);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeTypingIndicator() {
        const ind = document.getElementById('chat-typing-indicator');
        if (ind) ind.remove();
    }
}

/* ==========================================================================
   5. Scroll triggered Viewport Animations
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
                obs.unobserve(entry.target); // Trigger animation once
            }
        });
    }, observerOptions);

    animElements.forEach(el => observer.observe(el));
}
