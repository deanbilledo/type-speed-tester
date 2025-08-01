// Type Speed Tester - Advanced JavaScript Implementation
class TypeSpeedTester {
    constructor() {
        this.currentText = '';
        this.currentIndex = 0;
        this.startTime = null;
        this.endTime = null;
        this.isTestActive = false;
        this.timer = null;
        this.duration = 30;
        this.timeRemaining = 30;
        this.errors = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        this.wpmHistory = [];
        this.settings = this.loadSettings();
        
        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
        this.applySettings();
        this.loadNewText();
    }

    initializeElements() {
        // Configuration elements
        this.testDurationSelect = document.getElementById('testDuration');
        this.testDifficultySelect = document.getElementById('testDifficulty');
        this.testCategorySelect = document.getElementById('testCategory');
        
        // Stats elements
        this.currentWpmElement = document.getElementById('currentWpm');
        this.currentCpmElement = document.getElementById('currentCpm');
        this.currentAccuracyElement = document.getElementById('currentAccuracy');
        this.timeRemainingElement = document.getElementById('timeRemaining');
        
        // Typing elements
        this.textDisplayElement = document.getElementById('textDisplay');
        this.textContentElement = document.getElementById('textContent');
        this.typingInput = document.getElementById('typingInput');
        this.typingContainer = document.querySelector('.typing-container');
        
        // Control elements
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.newTextBtn = document.getElementById('newTextBtn');
        
        // Modal elements
        this.resultsModal = document.getElementById('resultsModal');
        this.settingsModal = document.getElementById('settingsModal');
        this.modalClose = document.getElementById('modalClose');
        this.settingsModalClose = document.getElementById('settingsModalClose');
        
        // Theme and settings
        this.themeToggle = document.getElementById('themeToggle');
        this.settingsBtn = document.getElementById('settingsBtn');
        
        // History
        this.historyList = document.getElementById('historyList');
    }

    bindEvents() {
        // Control buttons
        this.startBtn.addEventListener('click', () => this.startTest());
        this.resetBtn.addEventListener('click', () => this.resetTest());
        this.newTextBtn.addEventListener('click', () => this.loadNewText());
        
        // Configuration changes
        this.testDurationSelect.addEventListener('change', () => {
            this.duration = parseInt(this.testDurationSelect.value);
            this.timeRemaining = this.duration;
            this.updateTimeDisplay();
        });
        
        this.testDifficultySelect.addEventListener('change', () => this.loadNewText());
        this.testCategorySelect.addEventListener('change', () => this.loadNewText());
        
        // Typing input
        this.typingInput.addEventListener('input', (e) => this.handleTyping(e));
        this.typingInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.typingInput.addEventListener('focus', () => this.typingContainer.classList.add('active'));
        this.typingInput.addEventListener('blur', () => this.typingContainer.classList.remove('active'));
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Settings
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        
        // Modal events
        this.modalClose.addEventListener('click', () => this.closeModal('results'));
        this.settingsModalClose.addEventListener('click', () => this.closeModal('settings'));
        
        // Results modal buttons
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.closeModal('results');
            this.resetTest();
        });
        
        document.getElementById('shareBtn').addEventListener('click', () => this.shareResults());
        
        // Settings modal buttons
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        document.getElementById('resetSettings').addEventListener('click', () => this.resetSettings());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal('results');
                this.closeModal('settings');
            }
            if (e.ctrlKey && e.key === 'Enter' && !this.isTestActive) {
                this.startTest();
            }
        });
        
        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target === this.resultsModal) this.closeModal('results');
            if (e.target === this.settingsModal) this.closeModal('settings');
        });
    }

    loadNewText() {
        const difficulty = this.testDifficultySelect.value;
        const category = this.testCategorySelect.value;
        this.currentText = this.generateText(difficulty, category);
        this.renderText();
        this.resetTest();
    }

    generateText(difficulty, category) {
        const texts = this.getTexts()[category][difficulty];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    getTexts() {
        return {
            quotes: {
                easy: [
                    "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
                    "Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish.",
                    "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma.",
                    "The future belongs to those who believe in the beauty of their dreams. Dream big and work hard.",
                    "Success is not final, failure is not fatal: it is the courage to continue that counts most."
                ],
                medium: [
                    "The pessimist sees difficulty in every opportunity. The optimist sees opportunity in every difficulty. Choose your perspective wisely.",
                    "It does not matter how slowly you go as long as you do not stop. Persistence is the key to achievement in life.",
                    "Everything you've ever wanted is on the other side of fear. Face your fears and embrace the unknown journey ahead.",
                    "The way to get started is to quit talking and begin doing. Action is the foundational key to all success in life.",
                    "Life is what happens to you while you're busy making other plans. Be present in each moment you experience."
                ],
                hard: [
                    "The greatest revolutionary is not he who fights with weapons, but he who transforms the consciousness of humanity through wisdom and compassion.",
                    "In the midst of winter, I found there was, within me, an invincible summer. This discovery has made all the difference in my perspective.",
                    "We are what we repeatedly do. Excellence, then, is not an act, but a habit cultivated through consistent practice and dedication.",
                    "The unexamined life is not worth living, for it lacks the depth and reflection necessary for true personal growth and understanding.",
                    "Yesterday is history, tomorrow is a mystery, today is a gift of God, which is why we call it the present moment."
                ],
                expert: [
                    "The most incomprehensible thing about the universe is that it is comprehensible; yet the deeper we delve into its mysteries, the more questions arise.",
                    "I have learned throughout my life as a composer chiefly through my mistakes and pursuits of false assumptions, not by my exposure to founts of wisdom.",
                    "The real question is not whether machines think but whether men do. The mystery which surrounds a thinking machine already surrounds a thinking man.",
                    "In physics, you don't have to go around making trouble for yourself; nature does it for you with sufficient complexity and unpredictability.",
                    "The important thing is not to stop questioning. Curiosity has its own reason for existing beyond mere intellectual satisfaction or practical application."
                ]
            },
            programming: {
                easy: [
                    "function hello() { return 'Hello World'; } console.log(hello());",
                    "const arr = [1, 2, 3]; const sum = arr.reduce((a, b) => a + b, 0);",
                    "if (user.isActive) { user.lastLogin = new Date(); } else { user.status = 'inactive'; }",
                    "class User { constructor(name) { this.name = name; } getName() { return this.name; } }",
                    "const promise = fetch('/api/data').then(response => response.json());"
                ],
                medium: [
                    "const debounce = (func, delay) => { let timeoutId; return (...args) => { clearTimeout(timeoutId); timeoutId = setTimeout(() => func.apply(this, args), delay); }; };",
                    "function quickSort(arr) { if (arr.length <= 1) return arr; const pivot = arr[0]; const less = arr.slice(1).filter(x => x <= pivot); const greater = arr.slice(1).filter(x => x > pivot); return [...quickSort(less), pivot, ...quickSort(greater)]; }",
                    "class EventEmitter { constructor() { this.events = {}; } on(event, callback) { if (!this.events[event]) this.events[event] = []; this.events[event].push(callback); } emit(event, data) { if (this.events[event]) this.events[event].forEach(callback => callback(data)); } }",
                    "const memoize = (fn) => { const cache = new Map(); return (...args) => { const key = JSON.stringify(args); if (cache.has(key)) return cache.get(key); const result = fn(...args); cache.set(key, result); return result; }; };",
                    "async function* asyncGenerator() { for (let i = 0; i < 10; i++) { await new Promise(resolve => setTimeout(resolve, 100)); yield i; } } for await (const value of asyncGenerator()) { console.log(value); }"
                ],
                hard: [
                    "const createProxy = (target) => new Proxy(target, { get(obj, prop) { console.log(`Accessing ${prop}`); return typeof obj[prop] === 'function' ? obj[prop].bind(obj) : obj[prop]; }, set(obj, prop, value) { console.log(`Setting ${prop} to ${value}`); obj[prop] = value; return true; } });",
                    "function* fibonacciGenerator() { let [a, b] = [0, 1]; while (true) { yield a; [a, b] = [b, a + b]; } } const fib = fibonacciGenerator(); const first10Fibs = Array.from({ length: 10 }, () => fib.next().value);",
                    "const curry = (fn) => (...args) => args.length >= fn.length ? fn(...args) : curry(fn.bind(null, ...args)); const add = curry((a, b, c) => a + b + c); const addFive = add(5); const addFiveAndThree = addFive(3);",
                    "class Observable { constructor(subscriber) { this.subscriber = subscriber; } subscribe(observer) { return this.subscriber(observer); } static fromEvent(element, event) { return new Observable(observer => { const handler = e => observer.next(e); element.addEventListener(event, handler); return () => element.removeEventListener(event, handler); }); } }",
                    "const trampoline = (fn) => (...args) => { let result = fn(...args); while (typeof result === 'function') { result = result(); } return result; }; const factorial = trampoline((n, acc = 1) => n <= 1 ? acc : () => factorial(n - 1, n * acc));"
                ],
                expert: [
                    "const createStateMachine = (states, initialState) => { let currentState = initialState; const transitions = {}; const machine = { state: () => currentState, transition: (event) => { const transition = transitions[currentState]?.[event]; if (transition) { currentState = transition.target; transition.action?.(); } return machine; }, addTransition: (from, event, to, action) => { if (!transitions[from]) transitions[from] = {}; transitions[from][event] = { target: to, action }; return machine; } }; return machine; };",
                    "const createAsyncPool = (poolLimit) => { const pool = []; const execute = async (promise, resolve, reject) => { pool.push(promise); const clean = () => pool.splice(pool.indexOf(promise), 1); promise.then(clean, clean); try { const result = await promise; resolve(result); } catch (error) { reject(error); } }; return (promises) => promises.map((promise, i) => new Promise((resolve, reject) => { const executeNext = () => execute(promise, resolve, reject); if (pool.length < poolLimit) executeNext(); else Promise.race(pool).then(executeNext, executeNext); })); };",
                    "const createLazySequence = function* (iterable) { const iterator = iterable[Symbol.iterator](); const cache = []; let done = false; let index = 0; while (true) { if (index < cache.length) { yield cache[index++]; } else if (!done) { const { value, done: iteratorDone } = iterator.next(); if (iteratorDone) { done = true; return; } cache.push(value); yield value; index++; } else { return; } } };",
                    "const createMonad = (value) => ({ map: (fn) => createMonad(fn(value)), flatMap: (fn) => fn(value), filter: (predicate) => predicate(value) ? createMonad(value) : createMonad(null), getValue: () => value, chain: function(fn) { return this.flatMap(fn); }, ap: function(monadWithFn) { return monadWithFn.map(fn => fn(value)); }, fold: (onEmpty, onValue) => value === null ? onEmpty() : onValue(value) });",
                    "const createReactiveStream = () => { const observers = new Set(); const operators = []; let isCompleted = false; const stream = { subscribe: (observer) => { observers.add(observer); return () => observers.delete(observer); }, next: (value) => { if (isCompleted) return; const processedValue = operators.reduce((acc, operator) => operator(acc), value); observers.forEach(observer => observer.next?.(processedValue)); }, complete: () => { isCompleted = true; observers.forEach(observer => observer.complete?.()); }, pipe: (...ops) => { operators.push(...ops); return stream; } }; return stream; };"
                ]
            },
            literature: {
                easy: [
                    "It was the best of times, it was the worst of times. In that simple phrase lies the duality of human experience.",
                    "To be or not to be, that is the question. Whether it is nobler in the mind to suffer the slings and arrows.",
                    "Call me Ishmael. Some years ago, having little or no money in my purse, I thought I would sail about.",
                    "It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife.",
                    "All happy families are alike; each unhappy family is unhappy in its own way and for its own reasons."
                ],
                medium: [
                    "In the beginning was the Word, and the Word was with God, and the Word was God. Through literature we explore the divine nature of language.",
                    "The course of true love never did run smooth, but runs through valleys of despair and mountains of joy in equal measure.",
                    "Tomorrow, and tomorrow, and tomorrow creeps in this petty pace from day to day to the last syllable of recorded time.",
                    "It was a bright cold day in April, and the clocks were striking thirteen. The world had changed in ways both subtle and profound.",
                    "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole filled with worms and oozy smells, but a comfortable place."
                ],
                hard: [
                    "Stately, plump Buck Mulligan came from the stairhead, bearing a bowl of lather on which a mirror and a razor lay crossed, symbolizing the intersection of vanity and mortality that defines human existence.",
                    "riverrun, past Eve and Adam's, from swerve of shore to bend of bay, brings us by a commodius vicus of recirculation back to Howth Castle and Environs in an eternal cycle of renewal.",
                    "Mrs. Dalloway decided that morning she would buy the flowers herself, a simple decision that would ripple through the consciousness of all who crossed her path on this momentous day.",
                    "In those days cheap apartments were almost impossible to find in Manhattan, so I had to move to Brooklyn, where the shadows of possibility danced with the reality of compromise.",
                    "The snow began to fall as he walked through the empty streets, each flake a memory dissolving before it could fully form, leaving only the impression of something once known."
                ],
                expert: [
                    "The dialectical progression of consciousness through its various phenomenological manifestations reveals the inherent contradictions that drive the historical development of human understanding, as each moment of certainty dissolves into its opposite.",
                    "What we call the beginning is often the end, and to make an end is to make a beginning; the end is where we start from, in this eternal return to the source of all meaning and meaninglessness.",
                    "The notion that reality can be adequately represented through linear narrative structures fundamentally misapprehends the multidimensional nature of temporal experience and the simultaneous co-existence of multiple interpretative frameworks.",
                    "Language functions not merely as a transparent medium for the communication of pre-existing thoughts, but as the very condition of possibility for thought itself, constituting rather than simply expressing the boundaries of our conceptual world.",
                    "The hermeneutical circle suggests that understanding is not a linear progression from ignorance to knowledge, but rather a spiraling movement in which each new comprehension both illuminates and transforms our previous understanding."
                ]
            },
            science: {
                easy: [
                    "Water consists of two hydrogen atoms and one oxygen atom. This simple molecule is essential for all known forms of life.",
                    "The speed of light in a vacuum is approximately 299,792,458 meters per second. Nothing can travel faster than this speed.",
                    "DNA carries the genetic instructions for all living organisms. It consists of four nucleotide bases: A, T, G, and C.",
                    "Newton's first law states that an object at rest stays at rest unless acted upon by an external force.",
                    "The periodic table organizes elements by their atomic number and similar chemical properties in a systematic way."
                ],
                medium: [
                    "Photosynthesis is the process by which plants convert carbon dioxide and water into glucose using sunlight energy. This process releases oxygen as a byproduct.",
                    "Quantum mechanics describes the behavior of matter and energy at the atomic scale, where particles exhibit both wave and particle properties simultaneously.",
                    "The theory of evolution by natural selection explains how species change over time through the differential survival and reproduction of individuals.",
                    "Cellular respiration is the process by which cells break down glucose molecules to produce ATP, the primary energy currency of living organisms.",
                    "The electromagnetic spectrum encompasses all forms of electromagnetic radiation, from radio waves to gamma rays, each with different frequencies and energies."
                ],
                hard: [
                    "The Heisenberg uncertainty principle states that the position and momentum of a particle cannot both be precisely determined simultaneously, revealing fundamental limits to classical determinism.",
                    "Protein folding is governed by thermodynamic principles and kinetic pathways, where the amino acid sequence determines the three-dimensional structure through complex molecular interactions.",
                    "General relativity describes gravity not as a force but as the curvature of spacetime caused by mass and energy, fundamentally altering our understanding of the universe.",
                    "CRISPR-Cas9 technology enables precise genome editing by utilizing a programmable nuclease system originally derived from bacterial adaptive immune mechanisms.",
                    "The second law of thermodynamics states that entropy in an isolated system always increases over time, establishing the arrow of time and limits to energy conversion efficiency."
                ],
                expert: [
                    "The Standard Model of particle physics describes the fundamental particles and forces of nature through quantum field theory, encompassing the electromagnetic, weak, and strong nuclear interactions while gravity remains unincorporated.",
                    "Epigenetic modifications involve heritable changes in gene expression that do not alter the underlying DNA sequence, mediated through DNA methylation, histone modifications, and non-coding RNA regulatory mechanisms.",
                    "Chaos theory demonstrates how deterministic systems can exhibit unpredictable behavior due to sensitive dependence on initial conditions, revealing the mathematical foundations of apparent randomness in complex systems.",
                    "The holographic principle in theoretical physics proposes that all information contained in a volume of space can be encoded on its boundary, suggesting fundamental limits to information density and storage.",
                    "Synthetic biology combines engineering principles with biological systems to design and construct new biological parts, devices, and systems, or to redesign existing natural biological systems for useful purposes."
                ]
            },
            business: {
                easy: [
                    "Customer satisfaction is the key to building a successful business. Happy customers become loyal advocates for your brand.",
                    "Market research helps companies understand their target audience and make informed business decisions about products and services.",
                    "A strong brand identity differentiates your company from competitors and builds trust with potential customers.",
                    "Effective communication is essential for teamwork and productivity in any organization or business environment.",
                    "Financial planning involves budgeting, forecasting, and managing resources to achieve long-term business goals and objectives."
                ],
                medium: [
                    "Supply chain management involves coordinating the flow of goods, information, and finances from suppliers to customers to maximize efficiency and minimize costs.",
                    "Digital transformation requires organizations to adapt their business models, processes, and culture to leverage emerging technologies and changing market conditions.",
                    "Strategic planning involves analyzing market trends, competitive landscape, and internal capabilities to develop long-term business objectives and action plans.",
                    "Performance metrics and key performance indicators help organizations measure progress toward goals and identify areas for improvement and optimization.",
                    "Change management processes help organizations navigate transitions, overcome resistance, and successfully implement new strategies, technologies, or operational procedures."
                ],
                hard: [
                    "Agile methodology emphasizes iterative development, customer collaboration, and adaptive planning to deliver value quickly while responding to changing requirements and market conditions.",
                    "Mergers and acquisitions require careful due diligence, cultural integration planning, and strategic alignment to realize synergies and create shareholder value.",
                    "Data analytics and business intelligence systems enable organizations to extract actionable insights from large datasets to inform decision-making and competitive strategy.",
                    "Corporate governance frameworks establish policies, procedures, and oversight mechanisms to ensure accountability, transparency, and ethical behavior across all organizational levels.",
                    "Innovation management involves creating systematic processes for generating, evaluating, and implementing new ideas that drive competitive advantage and sustainable growth."
                ],
                expert: [
                    "Dynamic capabilities theory suggests that organizations must continuously reconfigure their resource base and operational capabilities to maintain competitive advantage in rapidly changing environments.",
                    "Behavioral economics principles reveal how cognitive biases and psychological factors influence economic decision-making, challenging traditional assumptions about rational actors in market systems.",
                    "Platform business models create value by facilitating interactions between multiple user groups, leveraging network effects and data insights to scale rapidly and capture market share.",
                    "ESG integration requires organizations to systematically incorporate environmental, social, and governance factors into strategic planning and risk management processes to ensure long-term sustainability.",
                    "Organizational ambidexterity refers to the ability to simultaneously exploit existing capabilities while exploring new opportunities, balancing efficiency and innovation to thrive in complex markets."
                ]
            }
        };
    }

    renderText() {
        const chars = this.currentText.split('');
        this.textContentElement.innerHTML = chars.map((char, index) => 
            `<span class="char" data-index="${index}">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('');
        this.currentIndex = 0;
    }

    startTest() {
        this.isTestActive = true;
        this.startTime = Date.now();
        this.timeRemaining = this.duration;
        this.typingInput.disabled = false;
        this.typingInput.focus();
        this.typingInput.value = '';
        
        this.startBtn.style.display = 'none';
        this.resetBtn.style.display = 'inline-flex';
        this.newTextBtn.style.display = 'inline-flex';
        
        this.resetStats();
        this.startTimer();
        this.playSound('start');
    }

    resetTest() {
        this.isTestActive = false;
        this.typingInput.disabled = true;
        this.typingInput.value = '';
        this.currentIndex = 0;
        this.timeRemaining = this.duration;
        
        this.startBtn.style.display = 'inline-flex';
        this.resetBtn.style.display = 'none';
        this.newTextBtn.style.display = 'none';
        
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.resetStats();
        this.renderText();
    }

    resetStats() {
        this.errors = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        this.wpmHistory = [];
        this.updateStats();
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimeDisplay();
            
            if (this.timeRemaining <= 0) {
                this.endTest();
            }
        }, 1000);
    }

    updateTimeDisplay() {
        this.timeRemainingElement.textContent = this.timeRemaining;
    }

    handleTyping(e) {
        if (!this.isTestActive) return;
        
        const inputValue = this.typingInput.value;
        const currentChar = this.currentText[this.currentIndex];
        const typedChar = inputValue[inputValue.length - 1];
        
        this.updateCharacterDisplay(inputValue);
        this.updateStats();
        
        // Auto-scroll text display
        this.scrollToCurrentChar();
        
        // Check if test is complete
        if (inputValue.length === this.currentText.length) {
            this.endTest();
        }
    }

    updateCharacterDisplay(inputValue) {
        const chars = this.textContentElement.querySelectorAll('.char');
        
        chars.forEach((char, index) => {
            char.classList.remove('correct', 'incorrect', 'current');
            
            if (index < inputValue.length) {
                if (inputValue[index] === this.currentText[index]) {
                    char.classList.add('correct');
                    if (index === inputValue.length - 1) {
                        this.correctChars++;
                        this.playSound('correct');
                    }
                } else {
                    char.classList.add('incorrect');
                    if (index === inputValue.length - 1) {
                        this.errors++;
                        this.playSound('error');
                    }
                }
            } else if (index === inputValue.length) {
                char.classList.add('current');
            }
        });
        
        this.currentIndex = inputValue.length;
        this.totalChars = inputValue.length;
    }

    scrollToCurrentChar() {
        const currentChar = this.textContentElement.querySelector('.char.current');
        if (currentChar) {
            currentChar.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
        }
    }

    updateStats() {
        const timeElapsed = this.isTestActive ? (Date.now() - this.startTime) / 1000 : 0;
        const wordsTyped = this.correctChars / 5;
        const minutes = timeElapsed / 60;
        
        const wpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
        const cpm = timeElapsed > 0 ? Math.round(this.correctChars / minutes) : 0;
        const accuracy = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;
        
        this.currentWpmElement.textContent = wpm;
        this.currentCpmElement.textContent = cpm;
        this.currentAccuracyElement.textContent = accuracy + '%';
        
        // Store WPM history for chart
        if (timeElapsed > 0) {
            this.wpmHistory.push({ time: timeElapsed, wpm });
        }
    }

    endTest() {
        this.isTestActive = false;
        this.endTime = Date.now();
        this.typingInput.disabled = true;
        
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.showResults();
        this.saveTestResult();
        this.playSound('complete');
    }

    showResults() {
        const timeElapsed = (this.endTime - this.startTime) / 1000;
        const wordsTyped = this.correctChars / 5;
        const minutes = timeElapsed / 60;
        
        const finalWpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
        const finalCpm = minutes > 0 ? Math.round(this.correctChars / minutes) : 0;
        const finalAccuracy = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;
        const avgWpm = this.wpmHistory.length > 0 ? 
            Math.round(this.wpmHistory.reduce((sum, entry) => sum + entry.wpm, 0) / this.wpmHistory.length) : 0;
        
        // Update results modal
        document.getElementById('finalWpm').textContent = finalWpm;
        document.getElementById('finalCpm').textContent = finalCpm;
        document.getElementById('finalAccuracy').textContent = finalAccuracy + '%';
        document.getElementById('finalErrors').textContent = this.errors;
        document.getElementById('totalChars').textContent = this.totalChars;
        document.getElementById('correctChars').textContent = this.correctChars;
        document.getElementById('testDurationResult').textContent = Math.round(timeElapsed) + 's';
        document.getElementById('avgWpm').textContent = avgWpm;
        
        this.openModal('results');
    }

    saveTestResult() {
        const result = {
            date: new Date().toISOString(),
            wpm: parseInt(document.getElementById('finalWpm').textContent),
            cpm: parseInt(document.getElementById('finalCpm').textContent),
            accuracy: parseInt(document.getElementById('finalAccuracy').textContent),
            errors: this.errors,
            duration: this.duration,
            difficulty: this.testDifficultySelect.value,
            category: this.testCategorySelect.value,
            totalChars: this.totalChars,
            correctChars: this.correctChars
        };
        
        const history = this.getHistory();
        history.unshift(result);
        
        // Keep only last 50 results
        if (history.length > 50) {
            history.splice(50);
        }
        
        localStorage.setItem('typemaster_history', JSON.stringify(history));
        this.loadHistory();
    }

    getHistory() {
        try {
            return JSON.parse(localStorage.getItem('typemaster_history')) || [];
        } catch {
            return [];
        }
    }

    loadHistory() {
        const history = this.getHistory();
        
        if (history.length === 0) {
            this.historyList.innerHTML = '<div class="no-history">No test history yet. Complete a test to see your progress!</div>';
            return;
        }
        
        this.historyList.innerHTML = history.slice(0, 10).map(result => {
            const date = new Date(result.date).toLocaleDateString();
            return `
                <div class="history-item">
                    <span class="history-date">${date}</span>
                    <span class="history-wpm">${result.wpm} WPM</span>
                    <span class="history-accuracy">${result.accuracy}%</span>
                    <span class="history-duration">${result.duration}s</span>
                    <span class="history-category">${result.category}</span>
                </div>
            `;
        }).join('');
    }

    handleKeyDown(e) {
        // Prevent certain keys from affecting the test
        if (e.key === 'Backspace' && this.isTestActive) {
            e.preventDefault();
            return;
        }
        
        if (e.key === 'Tab') {
            e.preventDefault();
        }
        
        // Handle keyboard shortcuts
        if (e.ctrlKey) {
            if (e.key === 'r') {
                e.preventDefault();
                this.resetTest();
            }
            if (e.key === 'n') {
                e.preventDefault();
                this.loadNewText();
            }
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('typemaster_theme', newTheme);
        
        const themeIcon = this.themeToggle.querySelector('.theme-icon');
        themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }

    openModal(type) {
        const modal = type === 'results' ? this.resultsModal : this.settingsModal;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(type) {
        const modal = type === 'results' ? this.resultsModal : this.settingsModal;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    openSettings() {
        // Load current settings into modal
        document.getElementById('fontSize').value = this.settings.fontSize;
        document.getElementById('fontFamily').value = this.settings.fontFamily;
        document.getElementById('soundEffects').checked = this.settings.soundEffects;
        document.getElementById('showKeyboard').checked = this.settings.showKeyboard;
        document.getElementById('highlightErrors').checked = this.settings.highlightErrors;
        
        this.openModal('settings');
    }

    saveSettings() {
        this.settings = {
            fontSize: document.getElementById('fontSize').value,
            fontFamily: document.getElementById('fontFamily').value,
            soundEffects: document.getElementById('soundEffects').checked,
            showKeyboard: document.getElementById('showKeyboard').checked,
            highlightErrors: document.getElementById('highlightErrors').checked
        };
        
        localStorage.setItem('typemaster_settings', JSON.stringify(this.settings));
        this.applySettings();
        this.closeModal('settings');
    }

    resetSettings() {
        this.settings = this.getDefaultSettings();
        localStorage.setItem('typemaster_settings', JSON.stringify(this.settings));
        this.applySettings();
        this.openSettings(); // Refresh the modal
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('typemaster_settings');
            return saved ? JSON.parse(saved) : this.getDefaultSettings();
        } catch {
            return this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            fontSize: '16',
            fontFamily: 'jetbrains',
            soundEffects: true,
            showKeyboard: false,
            highlightErrors: true
        };
    }

    applySettings() {
        // Apply font settings
        const fontSizeMap = {
            '14': '14px',
            '16': '16px',
            '18': '18px',
            '20': '20px'
        };
        
        const fontFamilyMap = {
            'inter': 'var(--font-family-primary)',
            'jetbrains': 'var(--font-family-mono)',
            'system': 'system-ui, -apple-system, sans-serif'
        };
        
        this.textDisplayElement.style.fontSize = fontSizeMap[this.settings.fontSize];
        this.typingInput.style.fontSize = fontSizeMap[this.settings.fontSize];
        this.textDisplayElement.style.fontFamily = fontFamilyMap[this.settings.fontFamily];
        this.typingInput.style.fontFamily = fontFamilyMap[this.settings.fontFamily];
        
        // Apply theme
        const savedTheme = localStorage.getItem('typemaster_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeIcon = this.themeToggle.querySelector('.theme-icon');
        themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }

    playSound(type) {
        if (!this.settings.soundEffects) return;
        
        // Create audio context for sound effects
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const frequencies = {
            start: 440,
            correct: 800,
            error: 200,
            complete: [523, 659, 784, 1047] // C major chord
        };
        
        if (type === 'complete') {
            // Play chord for completion
            frequencies.complete.forEach((freq, index) => {
                setTimeout(() => this.playTone(freq, 0.1), index * 100);
            });
        } else {
            this.playTone(frequencies[type], 0.1);
        }
    }

    playTone(frequency, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    shareResults() {
        const wpm = document.getElementById('finalWpm').textContent;
        const accuracy = document.getElementById('finalAccuracy').textContent;
        const duration = this.duration;
        
        const shareText = `🎯 Just completed a typing test on TypeMaster!\n\n` +
                         `⚡ Speed: ${wpm} WPM\n` +
                         `🎯 Accuracy: ${accuracy}\n` +
                         `⏱️ Duration: ${duration} seconds\n\n` +
                         `Try it yourself: ${window.location.href}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'TypeMaster - Typing Speed Test Results',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Results copied to clipboard!');
            });
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TypeSpeedTester();
});

// Service Worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
