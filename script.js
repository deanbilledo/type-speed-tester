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
        this.previousInputLength = 0; // Track previous input length for sound effects
        this.wpmHistory = [];
        this.settings = this.loadSettings();
        this.userSelectedText = false; // Track if user manually selected text
        this.isInitialLoad = true; // Track if this is the initial page load
        
        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
        this.applySettings();
        this.loadDifficultySelection(); // Load saved difficulty before loading text
        this.loadInitialRandomText(); // Load random text on startup
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
        this.newTextBtn.addEventListener('click', () => {
            // Reset user selection flag so we get random text
            this.userSelectedText = false;
            this.loadNewText();
        });
        
        // Configuration changes
        this.testDurationSelect.addEventListener('change', () => {
            this.duration = parseInt(this.testDurationSelect.value);
            this.timeRemaining = this.duration;
            this.updateTimeDisplay();
        });
        
        this.testDifficultySelect.addEventListener('change', () => {
            this.userSelectedText = true; // User specifically chose a difficulty
            this.saveDifficultySelection(); // Save the difficulty preference
            this.loadNewText();
        });
        
        this.testCategorySelect.addEventListener('change', () => {
            this.userSelectedText = true; // User specifically chose a category
            this.saveDifficultySelection(); // Save current difficulty when category changes
            this.loadNewText();
        });
        
        // Typing input - simplified
        this.typingInput.addEventListener('input', (e) => this.handleTyping(e));
        this.typingInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.typingInput.addEventListener('paste', (e) => {
            e.preventDefault(); // Prevent pasting
        });
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
        let difficulty, category;
        
        // Check if user selected specific options
        const selectedDifficulty = this.testDifficultySelect.value;
        const selectedCategory = this.testCategorySelect.value;
        
        if (this.userSelectedText && !this.isInitialLoad) {
            // User has specifically selected something, use their choice
            difficulty = selectedDifficulty;
            category = selectedCategory === 'random' ? this.getRandomCategory() : selectedCategory;
        } else {
            // Use saved difficulty preference or default to current selection
            difficulty = selectedDifficulty;
            category = selectedCategory === 'random' ? this.getRandomCategory() : selectedCategory;
        }
        
        this.currentText = this.generateText(difficulty, category);
        this.renderText();
        this.resetTest();
        
        // Mark that initial load is complete
        this.isInitialLoad = false;
    }

    getRandomCategory() {
        const categories = ['quotes', 'programming', 'literature', 'science', 'business'];
        return categories[Math.floor(Math.random() * categories.length)];
    }

    saveDifficultySelection() {
        const selectedDifficulty = this.testDifficultySelect.value;
        localStorage.setItem('typemaster_difficulty', selectedDifficulty);
    }

    loadDifficultySelection() {
        const savedDifficulty = localStorage.getItem('typemaster_difficulty');
        if (savedDifficulty) {
            this.testDifficultySelect.value = savedDifficulty;
            return savedDifficulty;
        }
        return 'easy'; // Default to easy if nothing saved
    }

    loadInitialRandomText() {
        // Load text with saved difficulty preference and random category
        const savedDifficulty = this.loadDifficultySelection();
        const randomCategory = this.getRandomCategory();
        
        // Set category dropdown to "random" to indicate random selection
        this.testCategorySelect.value = 'random';
        
        // Generate and load the text with saved difficulty
        this.currentText = this.generateText(savedDifficulty, randomCategory);
        this.renderText();
        
        // Don't call resetTest here as it would disable the input
        // Just reset the stats
        this.errors = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        this.previousInputLength = 0;
        this.currentIndex = 0;
        this.updateStats();
        
        // Mark as not user-selected since this was automatic
        this.userSelectedText = false;
    }

    generateText(difficulty, category) {
        // Both difficulty and category should now be specific values
        const texts = this.getTexts()[category][difficulty];
        const selectedText = texts[Math.floor(Math.random() * texts.length)];
        
        return selectedText;
    }

    getTexts() {
        return {
            quotes: {
                easy: [
                    "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
                    "Innovation distinguishes between a leader and a follower. Stay hungry, stay foolish.",
                    "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma.",
                    "The future belongs to those who believe in the beauty of their dreams. Dream big and work hard.",
                    "Success is not final, failure is not fatal: it is the courage to continue that counts most.",
                    "Be yourself; everyone else is already taken. You are unique and that is your power.",
                    "In the middle of difficulty lies opportunity. Every challenge is a chance to grow stronger.",
                    "The best time to plant a tree was 20 years ago. The second best time is now.",
                    "A journey of a thousand miles begins with a single step. Start where you are today.",
                    "Life is 10% what happens to you and 90% how you react to it. Choose your response wisely.",
                    "The only impossible journey is the one you never begin. Take that first step forward.",
                    "Don't watch the clock; do what it does. Keep going and never give up on your dreams.",
                    "Whether you think you can or you think you can't, you're right. Mindset determines everything.",
                    "The greatest glory in living lies not in never falling, but in rising every time we fall.",
                    "Yesterday is history, tomorrow is a mystery, but today is a gift. That's why it's called the present.",
                    "Be the change you wish to see in the world. Small actions can create big differences.",
                    "Success is walking from failure to failure with no loss of enthusiasm. Keep your passion alive.",
                    "The only person you are destined to become is the person you decide to be today.",
                    "Believe you can and you're halfway there. Confidence is the first step to achievement.",
                    "It does not matter how slowly you go as long as you do not stop moving forward."
                ],
                medium: [
                    "The pessimist sees difficulty in every opportunity. The optimist sees opportunity in every difficulty. Choose your perspective wisely.",
                    "It does not matter how slowly you go as long as you do not stop. Persistence is the key to achievement in life.",
                    "Everything you've ever wanted is on the other side of fear. Face your fears and embrace the unknown journey ahead.",
                    "The way to get started is to quit talking and begin doing. Action is the foundational key to all success in life.",
                    "Life is what happens to you while you're busy making other plans. Be present in each moment you experience.",
                    "Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference in my journey.",
                    "The measure of intelligence is the ability to change when circumstances demand adaptation and growth from within.",
                    "I have not failed. I've just found 10,000 ways that won't work. Failure is simply a stepping stone to success.",
                    "The only way to make sense out of change is to plunge into it, move with it, and join the dance of life.",
                    "What lies behind us and what lies before us are tiny matters compared to what lies within our hearts and minds.",
                    "If you want to live a happy life, tie it to a goal, not to people or things that may disappoint you.",
                    "The difference between ordinary and extraordinary is that little extra effort you put into everything you do.",
                    "You miss 100% of the shots you don't take. Opportunity requires action and courage to pursue your dreams.",
                    "The future depends on what you do today, not on what you plan to do tomorrow or next week.",
                    "Don't be afraid to give up the good to go for the great. Sometimes settling is the enemy of excellence.",
                    "Success is not the key to happiness. Happiness is the key to success in all areas of your life.",
                    "The only limit to our realization of tomorrow will be our doubts of today. Believe in your potential.",
                    "Character cannot be developed in ease and quiet. Only through experience of trial and suffering can the soul be strengthened.",
                    "If you look at what you have in life, you'll always have more. Gratitude is the foundation of abundance.",
                    "The secret of getting ahead is getting started. Every expert was once a beginner who refused to give up."
                ],
                hard: [
                    "The greatest revolutionary is not he who fights with weapons, but he who transforms the consciousness of humanity through wisdom and compassion.",
                    "In the midst of winter, I found there was, within me, an invincible summer. This discovery has made all the difference in my perspective.",
                    "We are what we repeatedly do. Excellence, then, is not an act, but a habit cultivated through consistent practice and dedication.",
                    "The unexamined life is not worth living, for it lacks the depth and reflection necessary for true personal growth and understanding.",
                    "Yesterday is history, tomorrow is a mystery, today is a gift of God, which is why we call it the present moment.",
                    "I think, therefore I am. This fundamental principle of existence establishes the foundation upon which all knowledge must be built.",
                    "The paradox of education is precisely this - that as one begins to become conscious, one begins to examine the society in which they live.",
                    "In the depth of winter, I finally learned that there was in me an invincible summer, capable of weathering any storm life brings.",
                    "The most beautiful thing we can experience is the mysterious. It is the source of all true art and all genuine scientific discovery.",
                    "What is essential is invisible to the eye. One sees clearly only with the heart, for the most important things cannot be seen.",
                    "The privilege of a lifetime is to become who you truly are, beyond the masks and roles that society expects you to play.",
                    "Between stimulus and response there is a space. In that space is our power to choose our response, and in our response lies our growth.",
                    "The cave you fear to enter holds the treasure you seek. Our greatest fears often guard our most profound opportunities for transformation.",
                    "We can easily forgive a child who is afraid of the dark; the real tragedy of life is when adults are afraid of the light.",
                    "The individual has always had to struggle not to be overwhelmed by the tribe. To be your own person is a hard battle to fight.",
                    "Man's search for meaning is the primary motivation in his life, not the pursuit of pleasure or the avoidance of pain alone.",
                    "The world as we have created it is a process of our thinking. It cannot be changed without changing our way of thinking first.",
                    "Those who cannot remember the past are condemned to repeat it, while those who understand history can shape a better future.",
                    "The only true wisdom is in knowing you know nothing. This intellectual humility opens the door to infinite learning and growth.",
                    "Freedom is not worth having if it does not include the freedom to make mistakes and learn from the consequences of our choices."
                ],
                expert: [
                    "The most incomprehensible thing about the universe is that it is comprehensible; yet the deeper we delve into its mysteries, the more questions arise.",
                    "I have learned throughout my life as a composer chiefly through my mistakes and pursuits of false assumptions, not by my exposure to founts of wisdom.",
                    "The real question is not whether machines think but whether men do. The mystery which surrounds a thinking machine already surrounds a thinking man.",
                    "In physics, you don't have to go around making trouble for yourself; nature does it for you with sufficient complexity and unpredictability.",
                    "The important thing is not to stop questioning. Curiosity has its own reason for existing beyond mere intellectual satisfaction or practical application.",
                    "The dialectical progression of consciousness through its phenomenological manifestations reveals the inherent contradictions driving historical development of understanding.",
                    "What we call the beginning is often the end, and to make an end is to make a beginning; the end is where we start from in this eternal return.",
                    "The notion that reality can be adequately represented through linear narrative structures fundamentally misapprehends the multidimensional nature of temporal experience.",
                    "Language functions not merely as a transparent medium for communication, but as the very condition of possibility for thought itself, constituting conceptual boundaries.",
                    "The hermeneutical circle suggests that understanding is not linear progression from ignorance to knowledge, but spiraling movement transforming previous comprehension.",
                    "Consciousness is not a thing but a process, not a noun but a verb, not a substance but a stream of interrelated experiences flowing through time.",
                    "The existential predicament of modern humanity lies in the tension between our need for meaning and the apparent meaninglessness of an indifferent universe.",
                    "Phenomenology attempts to describe the structures of experience as they present themselves to consciousness, without recourse to theories about their causal explanation.",
                    "The postmodern condition is characterized by incredulity toward metanarratives, skepticism about universal truths, and embrace of plurality and difference.",
                    "Deconstruction reveals the instability of meaning in texts, showing how every attempt at fixed interpretation inevitably contains the seeds of its own undoing.",
                    "The problem of consciousness in cognitive science involves explaining how subjective, qualitative experiences arise from objective, quantitative neural processes.",
                    "Quantum mechanics demonstrates that the act of observation fundamentally alters the system being observed, challenging classical notions of objective reality.",
                    "The anthropological concept of culture as symbolic systems mediating human experience reveals the constructed nature of social reality and meaning-making.",
                    "Ethical responsibility extends beyond individual actions to encompass our complicity in systemic structures that perpetuate inequality and environmental destruction.",
                    "The technological mediation of human experience raises profound questions about authenticity, agency, and what it means to be human in the digital age."
                ]
            },
            programming: {
                easy: [
                    "function hello() { return 'Hello World'; } console.log(hello());",
                    "const arr = [1, 2, 3]; const sum = arr.reduce((a, b) => a + b, 0);",
                    "if (user.isActive) { user.lastLogin = new Date(); } else { user.status = 'inactive'; }",
                    "class User { constructor(name) { this.name = name; } getName() { return this.name; } }",
                    "const promise = fetch('/api/data').then(response => response.json());",
                    "let count = 0; function increment() { count++; return count; }",
                    "const numbers = [1, 2, 3, 4, 5]; const doubled = numbers.map(n => n * 2);",
                    "for (let i = 0; i < 10; i++) { console.log('Number:', i); }",
                    "const person = { name: 'John', age: 30, city: 'New York' };",
                    "function add(a, b) { return a + b; } const result = add(5, 3);",
                    "const fruits = ['apple', 'banana', 'orange']; fruits.push('grape');",
                    "if (username && password) { login(username, password); }",
                    "const isEven = num => num % 2 === 0; console.log(isEven(4));",
                    "try { JSON.parse(data); } catch (error) { console.error(error); }",
                    "const button = document.getElementById('submit'); button.onclick = handleClick;",
                    "let total = 0; for (const item of items) { total += item.price; }",
                    "const greeting = name => `Hello, ${name}!`; console.log(greeting('World'));",
                    "const users = []; users.push({ id: 1, name: 'Alice' });",
                    "function square(x) { return x * x; } const squares = [1,2,3].map(square);",
                    "const config = { apiUrl: 'https://api.example.com', timeout: 5000 };"
                ],
                medium: [
                    "const debounce = (func, delay) => { let timeoutId; return (...args) => { clearTimeout(timeoutId); timeoutId = setTimeout(() => func.apply(this, args), delay); }; };",
                    "function quickSort(arr) { if (arr.length <= 1) return arr; const pivot = arr[0]; const less = arr.slice(1).filter(x => x <= pivot); const greater = arr.slice(1).filter(x => x > pivot); return [...quickSort(less), pivot, ...quickSort(greater)]; }",
                    "class EventEmitter { constructor() { this.events = {}; } on(event, callback) { if (!this.events[event]) this.events[event] = []; this.events[event].push(callback); } emit(event, data) { if (this.events[event]) this.events[event].forEach(callback => callback(data)); } }",
                    "const memoize = (fn) => { const cache = new Map(); return (...args) => { const key = JSON.stringify(args); if (cache.has(key)) return cache.get(key); const result = fn(...args); cache.set(key, result); return result; }; };",
                    "async function* asyncGenerator() { for (let i = 0; i < 10; i++) { await new Promise(resolve => setTimeout(resolve, 100)); yield i; } } for await (const value of asyncGenerator()) { console.log(value); }",
                    "const throttle = (func, limit) => { let inThrottle; return function() { const args = arguments; const context = this; if (!inThrottle) { func.apply(context, args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } }; };",
                    "class BinarySearchTree { constructor() { this.root = null; } insert(value) { this.root = this.insertNode(this.root, value); } insertNode(node, value) { if (!node) return { value, left: null, right: null }; if (value < node.value) node.left = this.insertNode(node.left, value); else node.right = this.insertNode(node.right, value); return node; } }",
                    "const deepClone = (obj) => { if (obj === null || typeof obj !== 'object') return obj; if (obj instanceof Date) return new Date(obj.getTime()); if (obj instanceof Array) return obj.map(item => deepClone(item)); const clonedObj = {}; for (const key in obj) clonedObj[key] = deepClone(obj[key]); return clonedObj; };",
                    "function* fibonacci() { let [prev, curr] = [0, 1]; while (true) { yield prev; [prev, curr] = [curr, prev + curr]; } } const fib = fibonacci(); const first10 = Array.from({ length: 10 }, () => fib.next().value);",
                    "const promiseAll = (promises) => { return new Promise((resolve, reject) => { const results = []; let completed = 0; promises.forEach((promise, index) => { Promise.resolve(promise).then(value => { results[index] = value; completed++; if (completed === promises.length) resolve(results); }).catch(reject); }); }); };",
                    "class Stack { constructor() { this.items = []; } push(element) { this.items.push(element); } pop() { return this.items.length ? this.items.pop() : null; } peek() { return this.items.length ? this.items[this.items.length - 1] : null; } isEmpty() { return this.items.length === 0; } size() { return this.items.length; } }",
                    "const pipe = (...functions) => (value) => functions.reduce((acc, fn) => fn(acc), value); const addOne = x => x + 1; const double = x => x * 2; const square = x => x * x; const result = pipe(addOne, double, square)(3);",
                    "async function retryAsync(fn, maxRetries = 3, delay = 1000) { for (let i = 0; i <= maxRetries; i++) { try { return await fn(); } catch (error) { if (i === maxRetries) throw error; await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); } } }",
                    "const createStore = (reducer, initialState) => { let state = initialState; const listeners = []; return { getState: () => state, dispatch: (action) => { state = reducer(state, action); listeners.forEach(listener => listener()); }, subscribe: (listener) => { listeners.push(listener); return () => listeners.splice(listeners.indexOf(listener), 1); } }; };",
                    "function mergeSort(arr) { if (arr.length <= 1) return arr; const mid = Math.floor(arr.length / 2); const left = mergeSort(arr.slice(0, mid)); const right = mergeSort(arr.slice(mid)); return merge(left, right); } function merge(left, right) { const result = []; let i = 0, j = 0; while (i < left.length && j < right.length) { if (left[i] <= right[j]) result.push(left[i++]); else result.push(right[j++]); } return result.concat(left.slice(i)).concat(right.slice(j)); }",
                    "const observer = { subscribers: [], subscribe(fn) { this.subscribers.push(fn); }, unsubscribe(fn) { this.subscribers = this.subscribers.filter(sub => sub !== fn); }, notify(data) { this.subscribers.forEach(fn => fn(data)); } };",
                    "class LinkedList { constructor() { this.head = null; this.size = 0; } add(element) { const node = { element, next: null }; if (!this.head) this.head = node; else { let current = this.head; while (current.next) current = current.next; current.next = node; } this.size++; } }",
                    "const compose = (...functions) => (value) => functions.reduceRight((acc, fn) => fn(acc), value); const multiply = x => y => x * y; const add = x => y => x + y; const multiplyBy2 = multiply(2); const add3 = add(3); const composed = compose(multiplyBy2, add3);",
                    "async function parallel(tasks, concurrencyLimit = 5) { const results = []; const executing = []; for (const [index, task] of tasks.entries()) { const promise = Promise.resolve().then(() => task()).then(result => results[index] = result); executing.push(promise); if (executing.length >= concurrencyLimit) { await Promise.race(executing); executing.splice(executing.findIndex(p => p === promise), 1); } } await Promise.all(executing); return results; }",
                    "const scheduler = { tasks: [], add(task, delay) { setTimeout(() => { this.tasks.push(task); this.run(); }, delay); }, run() { while (this.tasks.length > 0) { const task = this.tasks.shift(); try { task(); } catch (error) { console.error('Task failed:', error); } } } };"
                ],
                hard: [
                    "const createProxy = (target) => new Proxy(target, { get(obj, prop) { console.log(`Accessing ${prop}`); return typeof obj[prop] === 'function' ? obj[prop].bind(obj) : obj[prop]; }, set(obj, prop, value) { console.log(`Setting ${prop} to ${value}`); obj[prop] = value; return true; } });",
                    "function* fibonacciGenerator() { let [a, b] = [0, 1]; while (true) { yield a; [a, b] = [b, a + b]; } } const fib = fibonacciGenerator(); const first10Fibs = Array.from({ length: 10 }, () => fib.next().value);",
                    "const curry = (fn) => (...args) => args.length >= fn.length ? fn(...args) : curry(fn.bind(null, ...args)); const add = curry((a, b, c) => a + b + c); const addFive = add(5); const addFiveAndThree = addFive(3);",
                    "class Observable { constructor(subscriber) { this.subscriber = subscriber; } subscribe(observer) { return this.subscriber(observer); } static fromEvent(element, event) { return new Observable(observer => { const handler = e => observer.next(e); element.addEventListener(event, handler); return () => element.removeEventListener(event, handler); }); } }",
                    "const trampoline = (fn) => (...args) => { let result = fn(...args); while (typeof result === 'function') { result = result(); } return result; }; const factorial = trampoline((n, acc = 1) => n <= 1 ? acc : () => factorial(n - 1, n * acc));",
                    "class AsyncQueue { constructor(concurrency = 1) { this.concurrency = concurrency; this.running = 0; this.queue = []; } async add(task) { return new Promise((resolve, reject) => { this.queue.push({ task, resolve, reject }); this.process(); }); } async process() { if (this.running >= this.concurrency || this.queue.length === 0) return; this.running++; const { task, resolve, reject } = this.queue.shift(); try { const result = await task(); resolve(result); } catch (error) { reject(error); } finally { this.running--; this.process(); } } }",
                    "const createLens = (getter, setter) => ({ get: getter, set: setter, modify: (fn) => (obj) => setter(fn(getter(obj)))(obj) }); const propLens = (prop) => createLens(obj => obj[prop], val => obj => ({ ...obj, [prop]: val })); const nameLens = propLens('name'); const upperCaseName = nameLens.modify(name => name.toUpperCase());",
                    "function* takeWhile(predicate, iterable) { for (const item of iterable) { if (predicate(item)) yield item; else break; } } function* dropWhile(predicate, iterable) { let dropping = true; for (const item of iterable) { if (dropping && predicate(item)) continue; dropping = false; yield item; } }",
                    "const createStateMachine = (config) => { let currentState = config.initial; const machine = { getState: () => currentState, send: (event) => { const currentConfig = config.states[currentState]; const transition = currentConfig.on && currentConfig.on[event]; if (transition) { if (transition.target) currentState = transition.target; if (transition.actions) transition.actions.forEach(action => action()); } }, can: (event) => { const currentConfig = config.states[currentState]; return !!(currentConfig.on && currentConfig.on[event]); } }; return machine; };",
                    "class LazyEvaluator { constructor(generator) { this.generator = generator; this.cache = []; this.iterator = null; } *[Symbol.iterator]() { yield* this.cache; if (!this.iterator) this.iterator = this.generator(); for (const value of this.iterator) { this.cache.push(value); yield value; } } take(n) { const result = []; let count = 0; for (const value of this) { if (count >= n) break; result.push(value); count++; } return result; } }",
                    "const createMiddleware = () => { const middlewares = []; const use = (fn) => middlewares.push(fn); const execute = async (context) => { let index = 0; const next = async () => { if (index < middlewares.length) { const middleware = middlewares[index++]; await middleware(context, next); } }; await next(); }; return { use, execute }; };",
                    "function deepFreeze(obj) { Object.getOwnPropertyNames(obj).forEach(prop => { const value = obj[prop]; if (value && typeof value === 'object') deepFreeze(value); }); return Object.freeze(obj); } const immutableUpdate = (obj, path, value) => { const keys = path.split('.'); const lastKey = keys.pop(); const target = keys.reduce((acc, key) => acc[key] = { ...acc[key] }, { ...obj }); target[lastKey] = value; return obj; };",
                    "class EventBus { constructor() { this.events = new Map(); } on(event, handler) { if (!this.events.has(event)) this.events.set(event, new Set()); this.events.get(event).add(handler); return () => this.events.get(event).delete(handler); } emit(event, ...args) { if (this.events.has(event)) { this.events.get(event).forEach(handler => { try { handler(...args); } catch (error) { console.error(`Error in event handler for ${event}:`, error); } }); } } once(event, handler) { const unsubscribe = this.on(event, (...args) => { unsubscribe(); handler(...args); }); return unsubscribe; } }",
                    "const createAsyncIterator = (asyncIterable) => ({ async *[Symbol.asyncIterator]() { for await (const item of asyncIterable) yield item; }, map(fn) { return createAsyncIterator((async function*() { for await (const item of asyncIterable) yield await fn(item); })()); }, filter(predicate) { return createAsyncIterator((async function*() { for await (const item of asyncIterable) if (await predicate(item)) yield item; })()); }, take(count) { return createAsyncIterator((async function*() { let taken = 0; for await (const item of asyncIterable) { if (taken >= count) break; yield item; taken++; } })()); } });",
                    "const memoizeAsync = (fn, keyGenerator = (...args) => JSON.stringify(args)) => { const cache = new Map(); const pending = new Map(); return async (...args) => { const key = keyGenerator(...args); if (cache.has(key)) return cache.get(key); if (pending.has(key)) return pending.get(key); const promise = fn(...args).then(result => { cache.set(key, result); pending.delete(key); return result; }).catch(error => { pending.delete(key); throw error; }); pending.set(key, promise); return promise; }; };",
                    "class WorkerPool { constructor(workerScript, poolSize = navigator.hardwareConcurrency || 4) { this.workers = []; this.taskQueue = []; this.busyWorkers = new Set(); for (let i = 0; i < poolSize; i++) { const worker = new Worker(workerScript); worker.onmessage = (e) => this.handleWorkerMessage(worker, e); this.workers.push(worker); } } async execute(task) { return new Promise((resolve, reject) => { this.taskQueue.push({ task, resolve, reject }); this.assignWork(); }); } assignWork() { if (this.taskQueue.length === 0) return; const availableWorker = this.workers.find(w => !this.busyWorkers.has(w)); if (!availableWorker) return; const { task, resolve, reject } = this.taskQueue.shift(); this.busyWorkers.add(availableWorker); availableWorker.postMessage(task); availableWorker.currentTask = { resolve, reject }; } }",
                    "const createTransducer = (xf) => ({ '@@transducer/init': () => xf['@@transducer/init'](), '@@transducer/result': (result) => xf['@@transducer/result'](result), '@@transducer/step': (result, input) => xf['@@transducer/step'](result, input) }); const map = (f) => (xf) => createTransducer({ '@@transducer/init': () => xf['@@transducer/init'](), '@@transducer/result': (result) => xf['@@transducer/result'](result), '@@transducer/step': (result, input) => xf['@@transducer/step'](result, f(input)) }); const filter = (predicate) => (xf) => createTransducer({ '@@transducer/init': () => xf['@@transducer/init'](), '@@transducer/result': (result) => xf['@@transducer/result'](result), '@@transducer/step': (result, input) => predicate(input) ? xf['@@transducer/step'](result, input) : result });",
                    "class ReactiveVariable { constructor(initialValue) { this.value = initialValue; this.subscribers = new Set(); this.dependencies = new Set(); } get() { if (ReactiveVariable.currentComputation) { this.dependencies.add(ReactiveVariable.currentComputation); ReactiveVariable.currentComputation.dependencies.add(this); } return this.value; } set(newValue) { if (this.value !== newValue) { this.value = newValue; this.subscribers.forEach(fn => fn(newValue)); } } subscribe(fn) { this.subscribers.add(fn); return () => this.subscribers.delete(fn); } static autorun(fn) { const computation = { dependencies: new Set(), fn }; ReactiveVariable.currentComputation = computation; fn(); ReactiveVariable.currentComputation = null; computation.dependencies.forEach(dep => dep.subscribe(() => { computation.dependencies.clear(); ReactiveVariable.currentComputation = computation; fn(); ReactiveVariable.currentComputation = null; })); } }",
                    "const createVirtualDOM = () => { const createElement = (tag, props = {}, ...children) => ({ tag, props, children: children.flat() }); const render = (vnode, container) => { if (typeof vnode === 'string' || typeof vnode === 'number') { container.appendChild(document.createTextNode(vnode)); return; } const element = document.createElement(vnode.tag); Object.entries(vnode.props).forEach(([key, value]) => { if (key.startsWith('on')) { element.addEventListener(key.slice(2).toLowerCase(), value); } else { element.setAttribute(key, value); } }); vnode.children.forEach(child => render(child, element)); container.appendChild(element); }; const diff = (oldVNode, newVNode) => { if (!oldVNode) return { type: 'CREATE', newVNode }; if (!newVNode) return { type: 'REMOVE' }; if (typeof oldVNode !== typeof newVNode || oldVNode.tag !== newVNode.tag) return { type: 'REPLACE', newVNode }; if (typeof oldVNode === 'string') return oldVNode !== newVNode ? { type: 'TEXT', newVNode } : null; const propPatches = []; const childPatches = []; return { type: 'UPDATE', propPatches, childPatches }; }; return { createElement, render, diff }; };"
                ],
                expert: [
                    "const createStateMachine = (states, initialState) => { let currentState = initialState; const transitions = {}; const machine = { state: () => currentState, transition: (event) => { const transition = transitions[currentState]?.[event]; if (transition) { currentState = transition.target; transition.action?.(); } return machine; }, addTransition: (from, event, to, action) => { if (!transitions[from]) transitions[from] = {}; transitions[from][event] = { target: to, action }; return machine; } }; return machine; };",
                    "const createAsyncPool = (poolLimit) => { const pool = []; const execute = async (promise, resolve, reject) => { pool.push(promise); const clean = () => pool.splice(pool.indexOf(promise), 1); promise.then(clean, clean); try { const result = await promise; resolve(result); } catch (error) { reject(error); } }; return (promises) => promises.map((promise, i) => new Promise((resolve, reject) => { const executeNext = () => execute(promise, resolve, reject); if (pool.length < poolLimit) executeNext(); else Promise.race(pool).then(executeNext, executeNext); })); };",
                    "const createLazySequence = function* (iterable) { const iterator = iterable[Symbol.iterator](); const cache = []; let done = false; let index = 0; while (true) { if (index < cache.length) { yield cache[index++]; } else if (!done) { const { value, done: iteratorDone } = iterator.next(); if (iteratorDone) { done = true; return; } cache.push(value); yield value; index++; } else { return; } } };",
                    "const createMonad = (value) => ({ map: (fn) => createMonad(fn(value)), flatMap: (fn) => fn(value), filter: (predicate) => predicate(value) ? createMonad(value) : createMonad(null), getValue: () => value, chain: function(fn) { return this.flatMap(fn); }, ap: function(monadWithFn) { return monadWithFn.map(fn => fn(value)); }, fold: (onEmpty, onValue) => value === null ? onEmpty() : onValue(value) });",
                    "const createReactiveStream = () => { const observers = new Set(); const operators = []; let isCompleted = false; const stream = { subscribe: (observer) => { observers.add(observer); return () => observers.delete(observer); }, next: (value) => { if (isCompleted) return; const processedValue = operators.reduce((acc, operator) => operator(acc), value); observers.forEach(observer => observer.next?.(processedValue)); }, complete: () => { isCompleted = true; observers.forEach(observer => observer.complete?.()); }, pipe: (...ops) => { operators.push(...ops); return stream; } }; return stream; };",
                    "const createContinuation = () => { const callcc = (f) => (cont) => f((value) => () => cont(value))(cont); const shift = (f) => (cont) => f((value) => () => value)(cont); const reset = (thunk) => { const result = thunk(() => (value) => value); return typeof result === 'function' ? result() : result; }; return { callcc, shift, reset }; };",
                    "const createCoroutine = function* () { let value = yield; while (true) { try { const result = yield* handleRequest(value); value = yield result; } catch (error) { value = yield* handleError(error); } } function* handleRequest(req) { console.log('Processing:', req); yield* delay(100); return { status: 'success', data: req.toUpperCase() }; } function* handleError(err) { console.error('Error:', err); yield* delay(50); return { status: 'error', message: err.message }; } function* delay(ms) { const start = Date.now(); while (Date.now() - start < ms) yield; } };",
                    "const createLinkedDataStructure = () => { const createNode = (value, next = null) => ({ value, next, [Symbol.iterator]: function* () { let current = this; while (current) { yield current.value; current = current.next; } } }); const createList = () => { let head = null; let tail = null; let size = 0; return { append(value) { const node = createNode(value); if (!head) { head = tail = node; } else { tail.next = node; tail = node; } size++; return this; }, prepend(value) { const node = createNode(value, head); head = node; if (!tail) tail = node; size++; return this; }, *[Symbol.iterator]() { yield* head || []; }, toArray() { return [...this]; }, size: () => size, head: () => head, tail: () => tail }; }; return { createNode, createList }; };",
                    "const createEffectSystem = () => { const effects = new Map(); const handlers = new Map(); const perform = (effectType, payload) => { if (!handlers.has(effectType)) throw new Error(`No handler for effect: ${effectType}`); return handlers.get(effectType)(payload); }; const handle = (effectType, handler) => { handlers.set(effectType, handler); return () => handlers.delete(effectType); }; const createEffect = (type) => (payload) => ({ type, payload, [Symbol.toStringTag]: 'Effect' }); const runEffect = async (effect) => { if (effect && effect[Symbol.toStringTag] === 'Effect') { return await perform(effect.type, effect.payload); } return effect; }; return { perform, handle, createEffect, runEffect }; };",
                    "const createMetaCircularEvaluator = () => { const evaluate = (exp, env) => { if (isAtom(exp)) return lookup(exp, env); const [operator, ...operands] = exp; switch (operator) { case 'quote': return operands[0]; case 'if': { const [test, then, else_] = operands; return evaluate(test, env) ? evaluate(then, env) : evaluate(else_, env); } case 'lambda': { const [params, body] = operands; return (...args) => { const newEnv = extendEnv(params, args, env); return evaluate(body, newEnv); }; } case 'define': { const [name, value] = operands; env[name] = evaluate(value, env); return name; } default: { const proc = evaluate(operator, env); const args = operands.map(arg => evaluate(arg, env)); return proc(...args); } } }; const isAtom = (exp) => typeof exp === 'string' || typeof exp === 'number'; const lookup = (name, env) => env[name]; const extendEnv = (params, args, env) => ({ ...env, ...Object.fromEntries(params.map((p, i) => [p, args[i]])) }); return { evaluate }; };",
                    "const createQuantumStateMachine = () => { const superposition = (states) => ({ type: 'superposition', states, measure() { const totalProbability = states.reduce((sum, s) => sum + s.probability, 0); let random = Math.random() * totalProbability; for (const state of states) { random -= state.probability; if (random <= 0) return state.value; } return states[states.length - 1].value; }, map(fn) { return superposition(states.map(s => ({ ...s, value: fn(s.value) }))); }, filter(predicate) { const filtered = states.filter(s => predicate(s.value)); const total = filtered.reduce((sum, s) => sum + s.probability, 0); return superposition(filtered.map(s => ({ ...s, probability: s.probability / total }))); } }); const entangle = (state1, state2) => ({ type: 'entangled', state1, state2, measure() { const result1 = state1.measure(); const result2 = state2.measure(); return [result1, result2]; } }); return { superposition, entangle }; };",
                    "const createTypeInferenceEngine = () => { const types = new Map(); const constraints = []; const unify = (type1, type2) => { if (type1 === type2) return type1; if (typeof type1 === 'string') return bind(type1, type2); if (typeof type2 === 'string') return bind(type2, type1); if (type1.constructor === type2.constructor) { const unified = { constructor: type1.constructor, args: [] }; for (let i = 0; i < type1.args.length; i++) { unified.args.push(unify(type1.args[i], type2.args[i])); } return unified; } throw new Error(`Cannot unify ${JSON.stringify(type1)} with ${JSON.stringify(type2)}`); }; const bind = (variable, type) => { if (occurs(variable, type)) throw new Error(`Infinite type: ${variable} occurs in ${JSON.stringify(type)}`); types.set(variable, type); return type; }; const occurs = (variable, type) => { if (typeof type === 'string') return variable === type; if (type.args) return type.args.some(arg => occurs(variable, arg)); return false; }; const infer = (expression) => { switch (expression.type) { case 'number': return 'Number'; case 'string': return 'String'; case 'variable': return types.get(expression.name) || expression.name; case 'application': { const funcType = infer(expression.func); const argType = infer(expression.arg); const resultType = generateTypeVariable(); const expectedFuncType = { constructor: 'Function', args: [argType, resultType] }; unify(funcType, expectedFuncType); return resultType; } default: throw new Error(`Unknown expression type: ${expression.type}`); } }; let typeVarCounter = 0; const generateTypeVariable = () => `T${typeVarCounter++}`; return { infer, unify, types }; };",
                    "const createDifferentialDataflow = () => { const collections = new Map(); const operators = new Map(); const createCollection = (name, data = []) => { const collection = { name, data: new Map(), subscribe: (callback) => { const callbacks = collection.callbacks || (collection.callbacks = []); callbacks.push(callback); return () => callbacks.splice(callbacks.indexOf(callback), 1); }, emit: (changes) => { changes.forEach(([key, old_val, new_val]) => { if (new_val === undefined) collection.data.delete(key); else collection.data.set(key, new_val); }); if (collection.callbacks) collection.callbacks.forEach(cb => cb(changes)); }, map: (fn) => { const result = createCollection(`${name}_mapped`); collection.subscribe(changes => { const mappedChanges = changes.map(([key, old_val, new_val]) => [key, old_val ? fn(old_val) : undefined, new_val ? fn(new_val) : undefined]); result.emit(mappedChanges); }); return result; }, filter: (predicate) => { const result = createCollection(`${name}_filtered`); collection.subscribe(changes => { const filteredChanges = changes.filter(([key, old_val, new_val]) => { const oldPasses = old_val && predicate(old_val); const newPasses = new_val && predicate(new_val); return oldPasses || newPasses; }).map(([key, old_val, new_val]) => [key, old_val && predicate(old_val) ? old_val : undefined, new_val && predicate(new_val) ? new_val : undefined]); result.emit(filteredChanges); }); return result; }, join: (other, keyFn1 = x => x, keyFn2 = x => x) => { const result = createCollection(`${name}_joined_${other.name}`); const processJoin = () => { const changes = []; collection.data.forEach((val1, key1) => { const joinKey = keyFn1(val1); other.data.forEach((val2, key2) => { if (keyFn2(val2) === joinKey) { changes.push([`${key1}_${key2}`, undefined, [val1, val2]]); } }); }); result.emit(changes); }; collection.subscribe(processJoin); other.subscribe(processJoin); return result; } }; data.forEach((item, index) => collection.data.set(index, item)); collections.set(name, collection); return collection; }; return { createCollection, collections }; };",
                    "const createActorSystem = () => { const actors = new Map(); const messageQueue = []; let isProcessing = false; const createActor = (name, behavior) => { const actor = { name, mailbox: [], behavior, send: (message) => { actor.mailbox.push(message); scheduleProcessing(); }, become: (newBehavior) => { actor.behavior = newBehavior; }, spawn: (childName, childBehavior) => createActor(`${name}/${childName}`, childBehavior), stop: () => { actors.delete(name); }, context: { self: () => actor, sender: null, spawn: (childName, childBehavior) => actor.spawn(childName, childBehavior), stop: () => actor.stop(), become: (newBehavior) => actor.become(newBehavior) } }; actors.set(name, actor); return actor; }; const scheduleProcessing = () => { if (!isProcessing) { isProcessing = true; setTimeout(processMessages, 0); } }; const processMessages = () => { let processed = 0; const maxBatch = 100; while (processed < maxBatch) { let hasWork = false; for (const actor of actors.values()) { if (actor.mailbox.length > 0) { const message = actor.mailbox.shift(); try { actor.context.sender = message.sender; actor.behavior(message.payload, actor.context); } catch (error) { console.error(`Error in actor ${actor.name}:`, error); } hasWork = true; processed++; if (processed >= maxBatch) break; } } if (!hasWork) break; } isProcessing = false; if ([...actors.values()].some(actor => actor.mailbox.length > 0)) scheduleProcessing(); }; const tell = (actorName, message, sender = null) => { const actor = actors.get(actorName); if (actor) actor.send({ payload: message, sender }); }; return { createActor, tell, actors }; };",
                    "const createGradientDescent = () => { const optimize = (costFunction, gradient, initialParams, options = {}) => { const { learningRate = 0.01, maxIterations = 1000, tolerance = 1e-6, momentum = 0.9, adaptiveLR = false } = options; let params = [...initialParams]; let prevParams = [...initialParams]; let velocity = new Array(params.length).fill(0); let prevCost = Infinity; let iteration = 0; const history = []; while (iteration < maxIterations) { const cost = costFunction(params); const grad = gradient(params); if (Math.abs(prevCost - cost) < tolerance) break; for (let i = 0; i < params.length; i++) { velocity[i] = momentum * velocity[i] - learningRate * grad[i]; params[i] += velocity[i]; } if (adaptiveLR && cost > prevCost) { learningRate *= 0.5; for (let i = 0; i < params.length; i++) { params[i] = prevParams[i]; velocity[i] = 0; } } else { prevParams = [...params]; } history.push({ iteration, cost, params: [...params], gradient: [...grad] }); prevCost = cost; iteration++; } return { params, cost: costFunction(params), iterations: iteration, converged: iteration < maxIterations, history }; }; const createAdamOptimizer = (alpha = 0.001, beta1 = 0.9, beta2 = 0.999, epsilon = 1e-8) => { let m = null; let v = null; let t = 0; return (gradient) => { if (!m) { m = new Array(gradient.length).fill(0); v = new Array(gradient.length).fill(0); } t++; const update = new Array(gradient.length); for (let i = 0; i < gradient.length; i++) { m[i] = beta1 * m[i] + (1 - beta1) * gradient[i]; v[i] = beta2 * v[i] + (1 - beta2) * gradient[i] * gradient[i]; const mHat = m[i] / (1 - Math.pow(beta1, t)); const vHat = v[i] / (1 - Math.pow(beta2, t)); update[i] = -alpha * mHat / (Math.sqrt(vHat) + epsilon); } return update; }; }; return { optimize, createAdamOptimizer }; };"
                ]
            },
            literature: {
                easy: [
                    "It was the best of times, it was the worst of times. In that simple phrase lies the duality of human experience.",
                    "To be or not to be, that is the question. Whether it is nobler in the mind to suffer the slings and arrows.",
                    "Call me Ishmael. Some years ago, having little or no money in my purse, I thought I would sail about.",
                    "It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife.",
                    "All happy families are alike; each unhappy family is unhappy in its own way and for its own reasons.",
                    "Once upon a time, in a land far away, there lived a young girl who dreamed of adventure beyond her village.",
                    "The sun was setting behind the mountains, painting the sky in shades of orange and purple that took her breath away.",
                    "He walked down the empty street, his footsteps echoing in the silence of the sleeping city around him.",
                    "She opened the letter with trembling hands, knowing that whatever it contained would change her life forever.",
                    "The old man sat by the window, watching the seasons change as he remembered days long past.",
                    "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, but a clean and comfortable one.",
                    "It was a dark and stormy night when the stranger arrived at the inn, seeking shelter from the rain.",
                    "The children ran through the fields of golden wheat, their laughter carried away by the warm summer breeze.",
                    "Every morning she would sit by the lake, feeding the ducks and thinking about her dreams and hopes.",
                    "The library was her favorite place in the world, filled with countless stories waiting to be discovered.",
                    "He picked up his pen and began to write the story that had been living in his heart for years.",
                    "The train pulled into the station with a loud whistle, bringing travelers from distant cities and foreign lands.",
                    "She looked up at the stars and wondered if someone, somewhere, was looking back at her.",
                    "The garden was in full bloom, with roses and lilies dancing gently in the evening breeze.",
                    "As the clock struck midnight, she realized that everything she thought she knew was about to change."
                ],
                medium: [
                    "In the beginning was the Word, and the Word was with God, and the Word was God. Through literature we explore the divine nature of language.",
                    "The course of true love never did run smooth, but runs through valleys of despair and mountains of joy in equal measure.",
                    "Tomorrow, and tomorrow, and tomorrow creeps in this petty pace from day to day to the last syllable of recorded time.",
                    "It was a bright cold day in April, and the clocks were striking thirteen. The world had changed in ways both subtle and profound.",
                    "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole filled with worms and oozy smells, but a comfortable place.",
                    "The past is a foreign country: they do things differently there. Memory shapes our understanding of who we are and where we belong.",
                    "We are all in the gutter, but some of us are looking at the stars. Hope persists even in the darkest circumstances.",
                    "The only way out is through. Sometimes the path forward requires walking directly into what we fear most.",
                    "She was becoming herself and daily casting aside that fictitious self which we assume like a garment with which to appear before the world.",
                    "Time moves slowly, but passes quickly. The paradox of human perception shapes our experience of every moment we live.",
                    "The heart has its reasons which reason knows nothing of. Emotion and logic exist in constant tension within the human soul.",
                    "We accept the love we think we deserve. Our self-worth determines the quality of relationships we allow into our lives.",
                    "There are years that ask questions and years that answer. Life moves in cycles of inquiry and revelation.",
                    "Not all those who wander are lost. Sometimes the journey itself is more important than the destination we seek.",
                    "The wound is the place where the Light enters you. Our deepest pain often becomes the source of our greatest wisdom.",
                    "We know what we are, but know not what we may be. Human potential remains largely unknown even to ourselves.",
                    "What is grief, if not love persisting? Loss reveals the depth and permanence of our deepest emotional connections.",
                    "The cave you fear to enter holds the treasure you seek. Our greatest challenges often conceal our most valuable opportunities.",
                    "We are what we choose to become. Identity is not fixed but constantly created through our decisions and actions.",
                    "In the depth of winter, I finally learned that within me there lay an invincible summer of hope and resilience."
                ],
                hard: [
                    "Stately, plump Buck Mulligan came from the stairhead, bearing a bowl of lather on which a mirror and a razor lay crossed, symbolizing the intersection of vanity and mortality that defines human existence.",
                    "riverrun, past Eve and Adam's, from swerve of shore to bend of bay, brings us by a commodius vicus of recirculation back to Howth Castle and Environs in an eternal cycle of renewal.",
                    "Mrs. Dalloway decided that morning she would buy the flowers herself, a simple decision that would ripple through the consciousness of all who crossed her path on this momentous day.",
                    "In those days cheap apartments were almost impossible to find in Manhattan, so I had to move to Brooklyn, where the shadows of possibility danced with the reality of compromise.",
                    "The snow began to fall as he walked through the empty streets, each flake a memory dissolving before it could fully form, leaving only the impression of something once known.",
                    "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
                    "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
                    "Happy families are all alike; every unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys' house. The wife had discovered that the husband was carrying on an intrigue with a French girl, who had been a governess in their family, and she had announced to her husband that she could not go on living in the same house with him.",
                    "In the world according to Garp, we are all terminal cases. The question is not whether we will die, but how we will live with the knowledge of our mortality pressing against every moment of our existence.",
                    "Last night I dreamt I went to Manderley again. It seemed to me I stood by the iron gate leading to the drive, and for a while I could not enter, for the way was barred to me. There was a padlock and chain upon the gate.",
                    "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.",
                    "When he was nearly forty years old, and in response to a famine in his own province, a famine in which his own wives and children died, Wang Lung took his eldest son and his youngest son and he went south to hunt for a place where they could live.",
                    "If you really want to hear about it, the first thing you'll probably want to know is where I was born, and what my lousy childhood was like, and how my parents were occupied and all before they had me, and all that David Copperfield kind of crap, but I don't feel like going into it.",
                    "Many years later, as he faced the firing squad, Colonel Aureliano Buendía was to remember that distant afternoon when his father took him to discover ice. At that time Macondo was a village of twenty adobe houses, built on the bank of a river of clear water that ran along a bed of polished stones.",
                    "There was once a boy named Milo who didn't know what to do with himself—not just sometimes, but always. When he was in school he longed to be out, and when he was out he longed to be in. On the way he thought about coming home, and coming home he thought about going.",
                    "The past is never dead. It's not even past. We live in a constant dialogue with history, where every present moment is shaped by the accumulated weight of all that came before, and every decision we make echoes forward into an unknowable future.",
                    "She walks in beauty, like the night of cloudless climes and starry skies; and all that's best of dark and bright meet in her aspect and her eyes. Thus mellowed to that tender light which heaven to gaudy day denies.",
                    "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and, by opposing, end them.",
                    "We are such stuff as dreams are made on, and our little life is rounded with a sleep. The temporary nature of human existence gives both urgency and poignancy to every moment we experience.",
                    "The woods are lovely, dark and deep, but I have promises to keep, and miles to go before I sleep, and miles to go before I sleep. Duty and desire exist in constant tension within the human heart."
                ],
                expert: [
                    "The dialectical progression of consciousness through its various phenomenological manifestations reveals the inherent contradictions that drive the historical development of human understanding, as each moment of certainty dissolves into its opposite.",
                    "What we call the beginning is often the end, and to make an end is to make a beginning; the end is where we start from, in this eternal return to the source of all meaning and meaninglessness.",
                    "The notion that reality can be adequately represented through linear narrative structures fundamentally misapprehends the multidimensional nature of temporal experience and the simultaneous co-existence of multiple interpretative frameworks.",
                    "Language functions not merely as a transparent medium for the communication of pre-existing thoughts, but as the very condition of possibility for thought itself, constituting rather than simply expressing the boundaries of our conceptual world.",
                    "The hermeneutical circle suggests that understanding is not a linear progression from ignorance to knowledge, but rather a spiraling movement in which each new comprehension both illuminates and transforms our previous understanding.",
                    "Consciousness is always consciousness of something, yet this intentionality paradoxically reveals both the object-directedness of mental states and the fundamental gap between subjective experience and objective reality that can never be fully bridged.",
                    "The postmodern condition is characterized by an incredulity toward metanarratives, a skepticism about universal truths, and an embrace of plurality, difference, and the irreducible multiplicity of perspectives that resist synthesis into coherent wholes.",
                    "Deconstruction reveals the instability of meaning within texts, demonstrating how every attempt at fixed interpretation necessarily contains within itself the seeds of its own undoing, opening infinite possibilities for alternative readings.",
                    "The death of the author signals not the elimination of authorial intention but rather the birth of the reader as the site where the multiple voices and codes that constitute any text converge without ever achieving final unity or definitive meaning.",
                    "Mimesis is not mere imitation but rather a complex process of representation that both reveals and conceals, that illuminates truth through fiction while simultaneously exposing the fictional nature of what we take to be true.",
                    "The sublime confronts us with experiences that exceed our capacity for comprehension or representation, revealing both the limits of human understanding and the inexhaustible mystery that surrounds and permeates all existence.",
                    "Différance—the play of difference and deferral that constitutes the condition of possibility for all meaning—demonstrates that presence is always already contaminated by absence, that identity depends upon what it excludes.",
                    "The Bildungsroman traces the formation of consciousness through encounters with otherness, revealing how identity emerges not as self-contained essence but as dynamic process of becoming through engagement with what lies beyond the self.",
                    "Metalepsis disrupts the boundary between diegetic levels, exposing the constructedness of narrative reality while simultaneously implicating readers in the creative process through their participation in the interpretive act.",
                    "The anxiety of influence reveals how literary creation emerges from a complex negotiation with predecessors, where originality depends paradoxically upon the very tradition it seeks to overcome or transform.",
                    "Intertextuality demonstrates that no text exists in isolation but rather emerges from and contributes to an endless web of relationships with other texts, making meaning always already social and collaborative rather than individual.",
                    "The uncanny return of the repressed in literary works reveals the persistence of unconscious forces that resist conscious control, suggesting that meaning operates according to logics that exceed rational understanding.",
                    "Allegory operates through a doubling of meaning that maintains the gap between literal and figurative significance, creating interpretive spaces where multiple meanings can coexist without being reduced to simple correspondence.",
                    "The fragment as literary form acknowledges the impossibility of totalization while preserving the desire for wholeness, creating productive tensions between completion and incompletion that generate new possibilities for meaning.",
                    "Écriture féminine challenges phallogocentric discourse by developing alternative modes of expression that resist patriarchal structures of meaning, opening linguistic spaces for previously marginalized voices and experiences."
                ]
            },
            science: {
                easy: [
                    "Water consists of two hydrogen atoms and one oxygen atom. This simple molecule is essential for all known forms of life.",
                    "The speed of light in a vacuum is approximately 299,792,458 meters per second. Nothing can travel faster than this speed.",
                    "DNA carries the genetic instructions for all living organisms. It consists of four nucleotide bases: A, T, G, and C.",
                    "Newton's first law states that an object at rest stays at rest unless acted upon by an external force.",
                    "The periodic table organizes elements by their atomic number and similar chemical properties in a systematic way.",
                    "Plants use sunlight to make food through a process called photosynthesis. This process produces oxygen as a byproduct.",
                    "The human body contains 206 bones that provide structure and protect our internal organs from injury.",
                    "Gravity is the force that pulls objects toward the center of the Earth. It gives weight to physical objects.",
                    "The heart pumps blood through the body, delivering oxygen and nutrients to cells throughout the organism.",
                    "Atoms are the basic building blocks of all matter. They consist of protons, neutrons, and electrons.",
                    "The Earth rotates on its axis once every 24 hours, creating the cycle of day and night.",
                    "Sound travels through air as vibrations at approximately 343 meters per second at room temperature.",
                    "Mammals are warm-blooded animals that produce milk to feed their young and have hair or fur.",
                    "The water cycle involves evaporation, condensation, and precipitation that moves water around our planet.",
                    "Electric current is the flow of electrons through a conductor like copper wire or metal.",
                    "The solar system contains eight planets that orbit around our central star, the Sun.",
                    "Cells are the smallest units of life and are often called the building blocks of living organisms.",
                    "Energy cannot be created or destroyed, only transformed from one form to another type.",
                    "The brain controls all body functions and allows us to think, feel, and remember experiences.",
                    "Ice forms when water reaches its freezing point of zero degrees Celsius or 32 degrees Fahrenheit."
                ],
                medium: [
                    "Photosynthesis is the process by which plants convert carbon dioxide and water into glucose using sunlight energy. This process releases oxygen as a byproduct.",
                    "Quantum mechanics describes the behavior of matter and energy at the atomic scale, where particles exhibit both wave and particle properties simultaneously.",
                    "The theory of evolution by natural selection explains how species change over time through the differential survival and reproduction of individuals.",
                    "Cellular respiration is the process by which cells break down glucose molecules to produce ATP, the primary energy currency of living organisms.",
                    "The electromagnetic spectrum encompasses all forms of electromagnetic radiation, from radio waves to gamma rays, each with different frequencies and energies.",
                    "Mitosis is the process of cell division that produces two genetically identical daughter cells from a single parent cell.",
                    "The nervous system consists of the brain, spinal cord, and peripheral nerves that transmit signals throughout the body.",
                    "Chemical bonds form when atoms share or transfer electrons, creating molecules with unique properties different from individual elements.",
                    "The circulatory system transports blood, oxygen, nutrients, and waste products throughout the human body using the heart and blood vessels.",
                    "Plate tectonics explains how the Earth's surface is divided into large pieces that move slowly over geological time periods.",
                    "Mendel's laws of inheritance describe how traits are passed from parents to offspring through genes located on chromosomes.",
                    "The carbon cycle moves carbon atoms through the atmosphere, oceans, rocks, and living organisms in complex pathways.",
                    "Enzymes are protein catalysts that speed up chemical reactions in living organisms by lowering activation energy requirements.",
                    "The immune system protects the body from harmful pathogens using specialized cells, antibodies, and chemical barriers.",
                    "Nuclear fusion in the Sun's core converts hydrogen into helium, releasing enormous amounts of energy as light and heat.",
                    "Ecosystems consist of living organisms interacting with their physical environment in complex food webs and energy flows.",
                    "The pH scale measures the acidity or alkalinity of solutions, ranging from 0 (most acidic) to 14 (most basic).",
                    "Genetic mutations introduce variations in DNA sequences that can be beneficial, harmful, or neutral to organisms.",
                    "Homeostasis is the process by which living organisms maintain stable internal conditions despite external environmental changes.",
                    "The conservation of energy states that energy cannot be created or destroyed, only converted from one form to another."
                ],
                hard: [
                    "The Heisenberg uncertainty principle states that the position and momentum of a particle cannot both be precisely determined simultaneously, revealing fundamental limits to classical determinism.",
                    "Protein folding is governed by thermodynamic principles and kinetic pathways, where the amino acid sequence determines the three-dimensional structure through complex molecular interactions.",
                    "General relativity describes gravity not as a force but as the curvature of spacetime caused by mass and energy, fundamentally altering our understanding of the universe.",
                    "CRISPR-Cas9 technology enables precise genome editing by utilizing a programmable nuclease system originally derived from bacterial adaptive immune mechanisms.",
                    "The second law of thermodynamics states that entropy in an isolated system always increases over time, establishing the arrow of time and limits to energy conversion efficiency.",
                    "Synaptic plasticity underlies learning and memory formation through activity-dependent changes in the strength of connections between neurons in neural networks.",
                    "Epigenetic modifications involve chemical changes to DNA and histones that regulate gene expression without altering the underlying genetic sequence.",
                    "Quantum entanglement creates correlations between particles that persist regardless of the distance separating them, challenging classical notions of locality.",
                    "The citric acid cycle, also known as the Krebs cycle, is a central metabolic pathway that oxidizes acetyl-CoA to generate energy for cellular processes.",
                    "Natural selection operates on phenotypic variation that has a genetic basis, leading to evolutionary changes in allele frequencies over generations.",
                    "Apoptosis is a programmed cell death mechanism that removes damaged or unnecessary cells while maintaining tissue homeostasis in multicellular organisms.",
                    "The electron transport chain uses a series of protein complexes to generate ATP through chemiosmotic coupling in mitochondria and chloroplasts.",
                    "Allosteric regulation controls enzyme activity through conformational changes induced by molecules binding to sites other than the active site.",
                    "Transcriptional regulation involves complex networks of transcription factors, enhancers, and promoters that control gene expression patterns during development.",
                    "The Hardy-Weinberg equilibrium describes the mathematical relationship between allele and genotype frequencies in populations under specific conditions.",
                    "Signal transduction pathways allow cells to detect, process, and respond to environmental stimuli through cascades of molecular interactions.",
                    "Molecular chaperones assist in protein folding by preventing misfolding and aggregation, essential for maintaining cellular protein homeostasis.",
                    "The greenhouse effect occurs when atmospheric gases absorb and re-emit infrared radiation, influencing Earth's global temperature and climate patterns.",
                    "Restriction enzymes cut DNA at specific recognition sequences, enabling molecular cloning and genetic engineering applications in biotechnology.",
                    "Neurotransmitter systems modulate synaptic transmission through specific receptors and signaling cascades that influence behavior and cognition."
                ],
                expert: [
                    "The Standard Model of particle physics describes the fundamental particles and forces of nature through quantum field theory, encompassing the electromagnetic, weak, and strong nuclear interactions while gravity remains unincorporated.",
                    "Epigenetic modifications involve heritable changes in gene expression that do not alter the underlying DNA sequence, mediated through DNA methylation, histone modifications, and non-coding RNA regulatory mechanisms.",
                    "Chaos theory demonstrates how deterministic systems can exhibit unpredictable behavior due to sensitive dependence on initial conditions, revealing the mathematical foundations of apparent randomness in complex systems.",
                    "The holographic principle in theoretical physics proposes that all information contained in a volume of space can be encoded on its boundary, suggesting fundamental limits to information density and storage.",
                    "Synthetic biology combines engineering principles with biological systems to design and construct new biological parts, devices, and systems, or to redesign existing natural biological systems for useful purposes.",
                    "The anthropic principle suggests that the fundamental constants and laws of physics appear fine-tuned for the existence of intelligent life, raising questions about multiverses and selection effects.",
                    "Quantum field theory describes particles as excitations in underlying fields that permeate spacetime, providing the theoretical framework for understanding particle interactions and virtual particles.",
                    "Crystallographic analysis using X-ray diffraction reveals the three-dimensional atomic structure of proteins, nucleic acids, and other macromolecules essential for understanding biological function.",
                    "The endosymbiotic theory proposes that eukaryotic cells evolved through the incorporation of prokaryotic organisms, explaining the origin of mitochondria and chloroplasts.",
                    "Nonlinear dynamics in biological systems can generate emergent properties such as oscillations, bistability, and pattern formation through feedback loops and cooperative interactions.",
                    "The renormalization group provides a mathematical framework for understanding how physical phenomena change with scale, revealing universal behavior in critical phase transitions.",
                    "Topological insulators represent a novel state of matter that conducts electricity on their surface while remaining insulating in their bulk, with potential applications in quantum computing.",
                    "CRISPR-Cas systems evolved as adaptive immune mechanisms in bacteria and archaea, utilizing guide RNAs to direct nuclease activity against specific DNA sequences.",
                    "The error catastrophe threshold in molecular evolution defines the maximum mutation rate that populations can sustain while maintaining genetic information integrity.",
                    "Quantum chromodynamics describes the strong nuclear force through color charge interactions between quarks and gluons, exhibiting confinement and asymptotic freedom.",
                    "Allometric scaling relationships reveal how biological and physical properties change with organism size, governed by fundamental constraints of geometry and physiology.",
                    "The fluctuation-dissipation theorem connects thermal fluctuations to the response of systems near equilibrium, providing insights into irreversible processes and transport phenomena.",
                    "Ribosomal profiling techniques enable genome-wide analysis of translation by capturing ribosome-protected mRNA fragments, revealing dynamics of protein synthesis.",
                    "Dark matter and dark energy comprise approximately 95% of the universe, yet their nature remains unknown, representing one of the greatest mysteries in cosmology.",
                    "Single-cell RNA sequencing technologies reveal cellular heterogeneity and developmental trajectories by quantifying gene expression in individual cells at unprecedented resolution."
                ]
            },
            business: {
                easy: [
                    "Customer satisfaction is the key to building a successful business. Happy customers become loyal advocates for your brand.",
                    "Market research helps companies understand their target audience and make informed business decisions about products and services.",
                    "A strong brand identity differentiates your company from competitors and builds trust with potential customers.",
                    "Effective communication is essential for teamwork and productivity in any organization or business environment.",
                    "Financial planning involves budgeting, forecasting, and managing resources to achieve long-term business goals and objectives.",
                    "Good leadership inspires teams to work together toward common goals and creates a positive work environment.",
                    "Sales teams focus on understanding customer needs and providing solutions that create value for both parties.",
                    "Marketing campaigns aim to reach target audiences through various channels and persuade them to take action.",
                    "Quality control ensures that products and services meet established standards and customer expectations consistently.",
                    "Business partnerships can provide mutual benefits through shared resources, expertise, and market access opportunities.",
                    "Employee training programs help staff develop new skills and improve their performance in current roles.",
                    "Inventory management balances having enough stock to meet demand while minimizing storage costs and waste.",
                    "Customer service representatives handle inquiries, complaints, and support requests to maintain positive relationships.",
                    "Competitive analysis helps businesses understand their position in the market relative to other companies.",
                    "Project management involves planning, organizing, and controlling resources to achieve specific goals within deadlines.",
                    "Profit margins indicate how much money a company makes after covering all costs of doing business.",
                    "Business meetings provide opportunities for teams to collaborate, share updates, and make important decisions together.",
                    "Company culture reflects the values, beliefs, and behaviors that shape how employees interact and work.",
                    "Risk management identifies potential threats to business operations and develops strategies to minimize their impact.",
                    "Performance metrics help organizations measure success and identify areas that need improvement or attention."
                ],
                medium: [
                    "Supply chain management involves coordinating the flow of goods, information, and finances from suppliers to customers to maximize efficiency and minimize costs.",
                    "Digital transformation requires organizations to adapt their business models, processes, and culture to leverage emerging technologies and changing market conditions.",
                    "Strategic planning involves analyzing market trends, competitive landscape, and internal capabilities to develop long-term business objectives and action plans.",
                    "Performance metrics and key performance indicators help organizations measure progress toward goals and identify areas for improvement and optimization.",
                    "Change management processes help organizations navigate transitions, overcome resistance, and successfully implement new strategies, technologies, or operational procedures.",
                    "Market segmentation divides potential customers into distinct groups based on demographics, behaviors, needs, and preferences to target marketing efforts effectively.",
                    "Financial analysis examines revenue, expenses, cash flow, and profitability to assess business performance and guide investment decisions.",
                    "Human resources management encompasses recruiting, training, performance evaluation, and employee development to build effective organizational capabilities.",
                    "Operations management optimizes production processes, resource allocation, and workflow efficiency to deliver products and services cost-effectively.",
                    "Customer relationship management systems track interactions, preferences, and history to improve service quality and increase retention rates.",
                    "Business process improvement identifies inefficiencies in current workflows and implements changes to reduce waste and increase productivity.",
                    "Stakeholder engagement involves communicating with investors, customers, employees, and communities to build support for business initiatives and decisions.",
                    "Revenue diversification reduces business risk by developing multiple income streams from different products, services, or market segments.",
                    "Regulatory compliance ensures that business operations adhere to applicable laws, regulations, and industry standards to avoid legal penalties.",
                    "Vendor management establishes and maintains relationships with suppliers to ensure reliable delivery of goods and services at competitive prices.",
                    "Budget planning allocates financial resources across different departments and projects to support strategic priorities and operational requirements.",
                    "Team building activities strengthen collaboration, communication, and trust among employees to improve overall organizational effectiveness.",
                    "Market research methodologies include surveys, focus groups, and data analysis to gather insights about customer preferences and market trends.",
                    "Crisis management protocols prepare organizations to respond quickly and effectively to unexpected events that could disrupt normal operations.",
                    "Performance appraisals evaluate employee contributions, provide feedback, and identify development opportunities to support career growth and organizational goals."
                ],
                hard: [
                    "Agile methodology emphasizes iterative development, customer collaboration, and adaptive planning to deliver value quickly while responding to changing requirements and market conditions.",
                    "Mergers and acquisitions require careful due diligence, cultural integration planning, and strategic alignment to realize synergies and create shareholder value.",
                    "Data analytics and business intelligence systems enable organizations to extract actionable insights from large datasets to inform decision-making and competitive strategy.",
                    "Corporate governance frameworks establish policies, procedures, and oversight mechanisms to ensure accountability, transparency, and ethical behavior across all organizational levels.",
                    "Innovation management involves creating systematic processes for generating, evaluating, and implementing new ideas that drive competitive advantage and sustainable growth.",
                    "Enterprise resource planning systems integrate core business processes including finance, human resources, manufacturing, and supply chain management into unified platforms.",
                    "Balanced scorecard methodologies translate strategic objectives into measurable performance indicators across financial, customer, internal process, and learning perspectives.",
                    "Six Sigma quality improvement programs use statistical methods and data-driven approaches to eliminate defects and reduce variability in business processes.",
                    "Value chain analysis examines each activity within an organization to identify sources of competitive advantage and opportunities for cost reduction or differentiation.",
                    "Scenario planning techniques help organizations prepare for uncertain futures by developing multiple plausible scenarios and corresponding strategic responses.",
                    "Blue ocean strategy focuses on creating uncontested market space through value innovation rather than competing in existing markets with established players.",
                    "Design thinking approaches combine empathy, creativity, and rationality to solve complex problems and develop user-centered solutions and experiences.",
                    "Lean startup methodology emphasizes rapid experimentation, validated learning, and iterative product development to reduce waste and accelerate time to market.",
                    "Portfolio management balances risk and return across multiple investments or business units to optimize overall organizational performance and growth.",
                    "Organizational development interventions address cultural, structural, and process issues to improve effectiveness and adapt to changing environmental conditions.",
                    "Customer journey mapping visualizes touchpoints and experiences throughout the entire customer lifecycle to identify optimization opportunities and pain points.",
                    "Business model innovation transforms how organizations create, deliver, and capture value through new approaches to products, services, and operations.",
                    "Predictive analytics uses historical data, statistical algorithms, and machine learning techniques to forecast future trends and business outcomes.",
                    "Corporate social responsibility initiatives integrate environmental, social, and ethical considerations into business strategies and operations to create shared value.",
                    "Knowledge management systems capture, organize, and share intellectual capital to improve decision-making, innovation, and organizational learning capabilities."
                ],
                expert: [
                    "Dynamic capabilities theory suggests that organizations must continuously reconfigure their resource base and operational capabilities to maintain competitive advantage in rapidly changing environments.",
                    "Behavioral economics principles reveal how cognitive biases and psychological factors influence economic decision-making, challenging traditional assumptions about rational actors in market systems.",
                    "Platform business models create value by facilitating interactions between multiple user groups, leveraging network effects and data insights to scale rapidly and capture market share.",
                    "ESG integration requires organizations to systematically incorporate environmental, social, and governance factors into strategic planning and risk management processes to ensure long-term sustainability.",
                    "Organizational ambidexterity refers to the ability to simultaneously exploit existing capabilities while exploring new opportunities, balancing efficiency and innovation to thrive in complex markets.",
                    "Digital ecosystems represent interconnected networks of organizations, technologies, and stakeholders that create value through collaboration, data sharing, and platform-mediated interactions.",
                    "Paradox theory in management recognizes that organizations must navigate tensions between competing demands such as efficiency versus flexibility, control versus autonomy, and short-term versus long-term objectives.",
                    "Resource-based view suggests that sustainable competitive advantage derives from valuable, rare, inimitable, and non-substitutable resources and capabilities that competitors cannot easily replicate.",
                    "Institutional theory examines how organizational structures and practices are shaped by societal expectations, regulatory requirements, and cultural norms rather than purely economic considerations.",
                    "Transaction cost economics analyzes the costs of conducting business transactions to determine optimal organizational boundaries and governance structures for different types of exchanges.",
                    "Real options valuation applies financial option pricing models to strategic investments, recognizing the value of flexibility and the ability to make future decisions based on evolving information.",
                    "Stakeholder capitalism emphasizes creating value for all stakeholders including employees, customers, suppliers, communities, and shareholders rather than prioritizing shareholder returns exclusively.",
                    "Complexity science applications in management recognize organizations as adaptive systems that exhibit emergent properties and require different approaches than traditional mechanistic models.",
                    "Absorptive capacity describes an organization's ability to recognize, assimilate, and apply external knowledge to commercial ends, influencing innovation performance and competitive positioning.",
                    "Coopetition strategies involve simultaneous cooperation and competition between firms, requiring sophisticated governance mechanisms to manage tensions and realize mutual benefits.",
                    "Institutional entrepreneurship refers to activities aimed at creating, maintaining, or disrupting institutional arrangements that govern economic and social activity within organizational fields.",
                    "Microfoundations research examines how individual-level phenomena such as cognition, behavior, and interactions aggregate to create organization-level capabilities and outcomes.",
                    "Configurational approaches recognize that multiple combinations of organizational attributes can lead to similar outcomes, challenging universal best practice assumptions in management theory.",
                    "Temporality in strategic management acknowledges that time is not merely a backdrop for organizational action but actively shapes strategic choices and their consequences.",
                    "Paradoxical leadership involves embracing contradictions and tensions rather than resolving them, enabling organizations to navigate complex environments and competing demands simultaneously."
                ]
            }
        };
    }

    renderText() {
        if (!this.currentText) {
            console.error('No current text to render!');
            return;
        }
        
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
        this.typingInput.contentEditable = 'true';
        this.typingInput.focus();
        this.typingInput.textContent = '';
        
        this.startBtn.style.display = 'none';
        this.resetBtn.style.display = 'inline-flex';
        this.newTextBtn.style.display = 'inline-flex';
        
        this.resetStats();
        this.startTimer();
        this.playSound('start');
    }

    resetTest() {
        this.isTestActive = false;
        this.typingInput.contentEditable = 'false';
        this.typingInput.textContent = '';
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
        this.previousInputLength = 0; // Reset input tracking for sound effects
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
        
        const inputValue = this.typingInput.textContent || '';
        
        // Update current index and tracking
        this.currentIndex = inputValue.length;
        this.totalChars = Math.max(this.totalChars, this.currentIndex);
        
        // Update display and stats
        this.updateCharacterDisplay(inputValue);
        this.updateStats();
        this.scrollToCurrentChar();
        
        // Check completion
        if (inputValue.length === this.currentText.length && inputValue === this.currentText) {
            this.endTest();
        }
    }

    updateCharacterDisplay(inputValue) {
        const chars = this.textContentElement.querySelectorAll('.char');
        
        // Reset all character classes
        chars.forEach((char, index) => {
            char.classList.remove('correct', 'incorrect', 'current');
            
            if (index < inputValue.length) {
                if (inputValue[index] === this.currentText[index]) {
                    char.classList.add('correct');
                } else {
                    char.classList.add('incorrect');
                }
            } else if (index === inputValue.length) {
                char.classList.add('current');
            }
        });
        
        // Calculate correct characters and errors
        this.correctChars = 0;
        this.errors = 0;
        
        for (let i = 0; i < Math.min(inputValue.length, this.currentText.length); i++) {
            if (inputValue[i] === this.currentText[i]) {
                this.correctChars++;
            } else {
                this.errors++;
            }
        }
        
        // Play sound effects for typing (only when typing forward, not backspacing)
        if (inputValue.length > this.previousInputLength) {
            const lastIndex = inputValue.length - 1;
            if (lastIndex < this.currentText.length) {
                if (inputValue[lastIndex] === this.currentText[lastIndex]) {
                    this.playSound('correct');
                } else {
                    this.playSound('error');
                }
            }
        }
        
        // Store the current length for next comparison
        this.previousInputLength = inputValue.length;
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
        const cpm = minutes > 0 ? Math.round(this.correctChars / minutes) : 0;
        
        // Calculate accuracy based on total characters attempted
        let accuracy = 100;
        if (this.totalChars > 0) {
            accuracy = Math.round((this.correctChars / this.totalChars) * 100);
        }
        
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
        this.typingInput.contentEditable = 'false';
        
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
        // Handle contenteditable specific behavior during active test
        if (this.isTestActive) {
            // Prevent Enter key to avoid line breaks
            if (e.key === 'Enter') {
                e.preventDefault();
                return;
            }
            // Prevent Tab to avoid focus issues
            if (e.key === 'Tab') {
                e.preventDefault();
                return;
            }
            // Allow backspace and all other keys for normal typing
            return;
        }
        
        // Handle keyboard shortcuts only when test is not active
        if (e.ctrlKey) {
            if (e.key === 'r') {
                e.preventDefault();
                this.resetTest();
            }
            if (e.key === 'n') {
                e.preventDefault();
                this.userSelectedText = false;
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
