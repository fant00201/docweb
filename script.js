document.addEventListener('DOMContentLoaded', function() {
    const loaderWrapper = document.getElementById('loader-wrapper');
    const documentList = document.getElementById('document-list');
    const contentArea = document.querySelector('.content');

    const documents = [
        { 
            title: '清祀十六鼠标宏', 
            id: 'yuque-home', 
            type: 'iframe',
            url: 'https://www.yuque.com/qingsishiliu-f8x6l/qingsi16'
        },
        { 
            title: 'Deepseek对话', 
            id: 'ai-chat', 
            type: 'ai-chat' // New type for AI Chat
        }
    ];

    if (documentList) {
        documentList.innerHTML = '';
        documents.forEach(doc => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${doc.id}`; 
            link.textContent = doc.title;
            link.dataset.docId = doc.id;
            listItem.appendChild(link);
            documentList.appendChild(listItem);
        });
    }

    function displayDocumentContent(docId) {
        if (!contentArea) return;

        const doc = documents.find(d => d.id === docId);

        if (!doc) {
            contentArea.innerHTML = `<p style="color: red;">错误：找不到 ID 为 "${docId}" 的文档配置。</p>`;
            return;
        }

        contentArea.innerHTML = '';

        if (doc.type === 'iframe' && doc.url) {
            const iframe = document.createElement('iframe');
            iframe.src = doc.url;
            iframe.width = '100%';
            
            const headerHeightString = getComputedStyle(document.documentElement).getPropertyValue('--header-height').trim();
            const contentPaddingTopString = getComputedStyle(contentArea).paddingTop.trim();
            const contentPaddingBottomString = getComputedStyle(contentArea).paddingBottom.trim();

            const headerHeight = parseFloat(headerHeightString) || 60;
            const paddingTop = parseFloat(contentPaddingTopString) || 30;
            const paddingBottom = parseFloat(contentPaddingBottomString) || 30;
            
            iframe.style.height = `calc(100vh - ${headerHeight}px - ${paddingTop}px - ${paddingBottom}px)`;
            iframe.style.border = 'none';
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
            
            contentArea.appendChild(iframe);
            
            const note = document.createElement('p');
            note.style.fontSize = 'small';
            note.style.marginTop = '10px';
            note.innerHTML = '提示：如果上方内容区域空白或显示错误请手动复制链接到浏览器查看https://www.yuque.com/qingsishiliu-f8x6l/qingsi16?#';
            contentArea.appendChild(note);

        } else if (doc.type === 'ai-chat') {
            contentArea.innerHTML = `
                <div id="chat-container">
                    <div id="chat-controls">
                        <button id="new-chat-btn">新建会话</button>
                        <select id="model-selector">
                            <option value="deepseek-chat" selected>DeepSeek Chat (通用)</option>
                            <option value="deepseek-reasoner">DeepSeek Reasoner (推理)</option>
                        </select>
                    </div>
                    <div id="chat-history">
                        <div class="message-line ai-message-line">
                            <div class="avatar ai-avatar">A</div>
                            <div class="message-content">
                                <small class="model-name-display">模型: deepseek-chat (默认)</small>
                                <p class="message-text">你好！我是AI助手，有什么可以帮助您的吗？</p>
                            </div>
                        </div>
                    </div>
                    <div id="chat-input-area">
                        <input type="text" id="chat-input" placeholder="输入您的问题...">
                        <button id="chat-send-btn">发送</button>
                    </div>
                </div>
            `;
            const sendButton = document.getElementById('chat-send-btn');
            const chatInput = document.getElementById('chat-input');
            const chatHistory = document.getElementById('chat-history');
            const newChatButton = document.getElementById('new-chat-btn');
            const modelSelector = document.getElementById('model-selector'); // Get model selector

            if (newChatButton && chatHistory) {
                newChatButton.addEventListener('click', function() {
                    const defaultModel = modelSelector ? modelSelector.options[0].text.split('(')[0].trim() : "deepseek-chat";
                    chatHistory.innerHTML = `
                        <div class="message-line ai-message-line">
                            <div class="avatar ai-avatar">A</div>
                            <div class="message-content">
                                <small class="model-name-display">模型: ${defaultModel} (默认)</small>
                                <p class="message-text">你好！我是AI助手，有什么可以帮助您的吗？</p>
                            </div>
                        </div>
                    `;
                    if (chatInput) {
                        chatInput.value = ''; // Clear input field as well
                        chatInput.focus();
                    }
                });
            }

            if (sendButton && chatInput && chatHistory) {
                sendButton.addEventListener('click', function() {
                    const userMessage = chatInput.value.trim();
                    if (userMessage) {
                        // Create user message structure
                        const userMessageLine = document.createElement('div');
                        userMessageLine.classList.add('message-line', 'user-message-line');
                        userMessageLine.innerHTML = `
                            <div class="avatar user-avatar">U</div>
                            <div class="message-content">
                                <p class="message-text">${userMessage}</p>
                            </div>
                        `;
                        chatHistory.appendChild(userMessageLine);
                        chatInput.value = '';
                        chatHistory.scrollTop = chatHistory.scrollHeight;

                        // API Call for DeepSeek - Now with Streaming
                        const apiKey = "sk-6fed19e4e4bb40b598a909ea37f7c142";
                        const apiUrl = "https://api.deepseek.com/chat/completions";
                        const selectedModel = modelSelector ? modelSelector.value : "deepseek-chat";

                        // Create AI message structure upfront for streaming
                        const aiMessageLine = document.createElement('div');
                        aiMessageLine.classList.add('message-line', 'ai-message-line');
                        const aiMessageContentP = document.createElement('p');
                        aiMessageContentP.classList.add('message-text');
                        
                        aiMessageLine.innerHTML = `
                            <div class="avatar ai-avatar">A</div>
                            <div class="message-content">
                                <small class="model-name-display">模型: ${selectedModel}</small>
                            </div>
                        `;
                        aiMessageLine.querySelector('.message-content').appendChild(aiMessageContentP);
                        chatHistory.appendChild(aiMessageLine);
                        chatHistory.scrollTop = chatHistory.scrollHeight;


                        fetch(apiUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${apiKey}`
                            },
                            body: JSON.stringify({
                                model: selectedModel,
                                messages: [
                                    { role: "system", content: "You are a helpful assistant." },
                                    { role: "user", content: userMessage }
                                ],
                                stream: true // Enable streaming
                            })
                        })
                        .then(response => {
                            if (!response.ok) {
                                // Handle non-OK responses (e.g., API errors) before trying to read stream
                                return response.text().then(textData => {
                                    try {
                                        const errData = JSON.parse(textData);
                                        throw new Error(`API Error ${response.status}: ${errData.error ? (errData.error.message || JSON.stringify(errData.error)) : (response.statusText || textData)}`);
                                    } catch (e) {
                                        throw new Error(`API Error ${response.status}: ${response.statusText}. Response: ${textData.substring(0,200)}`);
                                    }
                                });
                            }
                            if (!response.body) {
                                throw new Error("ReadableStream not available.");
                            }
                            return response.body.getReader();
                        })
                        .then(reader => {
                            const decoder = new TextDecoder();
                            let buffer = '';

                            function processText({ done, value }) {
                                if (done) {
                                    // Stream finished
                                    if (aiMessageContentP.textContent.trim() === "") {
                                        aiMessageContentP.textContent = "未能获取到回复或回复为空。";
                                    }
                                    chatHistory.scrollTop = chatHistory.scrollHeight;
                                    return;
                                }

                                buffer += decoder.decode(value, { stream: true });
                                
                                // Process buffer for SSE events (data: {...}\n\n)
                                let eolIndex;
                                while ((eolIndex = buffer.indexOf('\n\n')) >= 0) {
                                    const line = buffer.substring(0, eolIndex).trim();
                                    buffer = buffer.substring(eolIndex + 2);

                                    if (line.startsWith('data: ')) {
                                        const jsonData = line.substring(6);
                                        if (jsonData.trim() === '[DONE]') {
                                            // Stream finished signal from API
                                            if (aiMessageContentP.textContent.trim() === "") {
                                               aiMessageContentP.textContent = "未能获取到回复或回复为空。";
                                            }
                                            chatHistory.scrollTop = chatHistory.scrollHeight;
                                            return reader.cancel(); // Ensure we stop reading
                                        }
                                        try {
                                            const parsed = JSON.parse(jsonData);
                                            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                                aiMessageContentP.textContent += parsed.choices[0].delta.content;
                                                chatHistory.scrollTop = chatHistory.scrollHeight;
                                            }
                                        } catch (e) {
                                            console.error('Error parsing stream JSON:', e, jsonData);
                                        }
                                    }
                                }
                                return reader.read().then(processText);
                            }
                            return reader.read().then(processText);
                        })
                        .catch(error => {
                            console.error('Streaming API Error:', error);
                            // If aiMessageContentP is already on page and empty, fill with error.
                            // Otherwise, create a new error message structure.
                            if (aiMessageContentP && aiMessageContentP.parentNode) { // Check if it's part of the DOM
                                if (aiMessageContentP.textContent.trim() === "") {
                                   aiMessageContentP.textContent = `错误: ${error.message}`;
                                   aiMessageContentP.style.color = 'red';
                                } else { // If some text already streamed, append error
                                    aiMessageContentP.textContent += `\n\n错误: ${error.message}`;
                                    aiMessageContentP.style.color = 'red'; // Or style the whole block
                                }
                            } else { // Fallback to creating a new error message line if the main one wasn't added
                                const modelForError = selectedModel || "未知模型";
                                const errorMessageLine = document.createElement('div');
                                errorMessageLine.classList.add('message-line', 'ai-message-line', 'error-message');
                                errorMessageLine.innerHTML = `
                                    <div class="avatar ai-avatar">A</div>
                                    <div class="message-content">
                                        <small class="model-name-display">尝试模型: ${modelForError}</small>
                                        <p class="message-text" style="color: red;">错误: ${error.message}</p>
                                    </div>
                                `;
                                chatHistory.appendChild(errorMessageLine);
                            }
                            chatHistory.scrollTop = chatHistory.scrollHeight;
                        });
                    }
                });
                chatInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        sendButton.click();
                    }
                });
            }

        } else {
            contentArea.innerHTML = `<p style="color: red;">错误：文档 "${doc.title}" 的类型配置不正确或缺少必要信息。</p>`;
        }
    }

    if (documentList && contentArea) {
        documentList.addEventListener('click', function(event) {
            const targetLink = event.target.closest('a');
            if (targetLink && targetLink.dataset.docId) {
                event.preventDefault();
                const docId = targetLink.dataset.docId;
                displayDocumentContent(docId);

                window.location.hash = targetLink.hash; 

                const allLinks = documentList.querySelectorAll('li a');
                allLinks.forEach(l => l.classList.remove('active'));
                targetLink.classList.add('active');

                if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                    toggleSidebar();
                }
            }
        });
    }

    function loadInitialContent() {
        let docToLoad = null;
        let activeLink = null;
        let docIdFromHash = null;

        if (window.location.hash) {
            docIdFromHash = window.location.hash.substring(1);
            const matchedDocByHash = documents.find(doc => doc.id === docIdFromHash);
            if (matchedDocByHash) {
                docToLoad = matchedDocByHash;
                activeLink = document.querySelector(`.sidebar #document-list a[href="#${docIdFromHash}"]`);
            }
        }
        
        if (!docToLoad && documents.length > 0) {
            docToLoad = documents[0];
            activeLink = document.querySelector(`.sidebar #document-list a[href="#${documents[0].id}"]`);
        }

        if (docToLoad) {
            displayDocumentContent(docToLoad.id);
            if (activeLink) {
                const allLinks = documentList.querySelectorAll('li a');
                allLinks.forEach(l => l.classList.remove('active'));
                activeLink.classList.add('active');
            }
        } else {
             contentArea.innerHTML = `<h2>欢迎来到清祀十六知识库</h2><p>请从左侧选择一篇文档开始阅读。</p>`;
        }
    }
    
    loadInitialContent();

    if (loaderWrapper) {
        setTimeout(function() {
            loaderWrapper.classList.add('hidden');
        }, 2500);
    }

    const animatedElements = document.querySelectorAll('.animated-element');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });

    const initialWelcomeHeader = contentArea.querySelector('h2');
    if (initialWelcomeHeader && !initialWelcomeHeader.classList.contains('animated-element')) {
         initialWelcomeHeader.classList.add('animated-element');
         observer.observe(initialWelcomeHeader);
    }
    const initialWelcomeParagraph = contentArea.querySelector('p');
    if (initialWelcomeParagraph && !initialWelcomeParagraph.classList.contains('animated-element')) {
        initialWelcomeParagraph.classList.add('animated-element');
        observer.observe(initialWelcomeParagraph);
    }

    const toggleButton = document.getElementById('toggle-sidebar-btn');
    const sidebar = document.querySelector('.sidebar');
    let overlay = null; 

    function createOverlay() {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.classList.add('overlay');
            document.body.appendChild(overlay);
            overlay.addEventListener('click', toggleSidebar); 
        }
    }

    function toggleSidebar() {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            sidebar.classList.toggle('open');
            if (sidebar.classList.contains('open')) {
                createOverlay();
                overlay.classList.add('active');
            } else {
                if (overlay) {
                    overlay.classList.remove('active');
                }
            }
        } else {
            sidebar.classList.toggle('collapsed');
        }
    }

    if (toggleButton && sidebar) {
        toggleButton.addEventListener('click', toggleSidebar);
    }

    window.addEventListener('resize', function() {
        const isMobile = window.innerWidth <= 768;
        if (!isMobile) { 
            sidebar.classList.remove('open'); 
            if (overlay && overlay.classList.contains('active')) {
                overlay.classList.remove('active'); 
            }
        }
    });
    document.body.style.cursor = 'auto'; 

    // Theme Toggle Functionality
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const themeTransitionOverlay = document.getElementById('theme-transition-overlay');
    let initialTheme = localStorage.getItem('theme') || 'light'; // Default to light

    function getThemeBackgroundColor(theme) {
        // Temporarily set the theme to get its background color variable value
        const htmlEl = document.documentElement;
        const originalDataTheme = htmlEl.dataset.theme;
        htmlEl.dataset.theme = theme; // Set to the theme we want to check
        const bgColor = getComputedStyle(htmlEl).getPropertyValue('--background-color').trim();
        htmlEl.dataset.theme = originalDataTheme; // Revert to original
        return bgColor;
    }

    function applyThemeSettings(theme) {
        document.documentElement.dataset.theme = theme;
        if (themeToggleButton) {
            themeToggleButton.textContent = theme === 'dark' ? '切换亮色' : '切换暗色';
        }
        localStorage.setItem('theme', theme);
    }
    
    // Apply initial theme without transition overlay
    applyThemeSettings(initialTheme);


    if (themeToggleButton && themeTransitionOverlay) {
        themeToggleButton.addEventListener('click', function() {
            const currentThemeIsDark = document.documentElement.dataset.theme === 'dark';
            const newTheme = currentThemeIsDark ? 'light' : 'dark';

            // 1. Set overlay to current theme's background and make it visible
            themeTransitionOverlay.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim();
            themeTransitionOverlay.classList.add('active');

            // 2. Wait for overlay to become opaque (CSS transition is 0.3s)
            setTimeout(function() {
                // 3. Change the actual theme
                applyThemeSettings(newTheme);

                // 4. Update overlay background to new theme's background (for fade-out)
                // This needs to happen after the theme variables have updated.
                // We can force a reflow or just rely on the next paint cycle.
                // For simplicity, let's assume variables update quickly enough.
                // A more robust way might be to get the new background color *after* setting data-theme.
                themeTransitionOverlay.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim();
                
                // 5. Start fading out the overlay
                themeTransitionOverlay.classList.remove('active');
            }, 300); // Match CSS transition duration for opacity
        });
    }
});
