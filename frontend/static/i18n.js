// Internationalization (i18n) support for the Language Translation App
const i18n = {
    // Current language
    currentLang: 'en',
    
    // Translation data
    translations: {
        en: {
            // Page title and description
            pageTitle: 'Language Translation App',
            pageDescription: 'Translate between English and Japanese using LLM',
            
            // Status messages
            checkingBackend: 'Checking backend status...',
            backendHealthy: '✅ Backend is healthy and model is loaded',
            backendUnhealthy: '⚠️ Backend is running but model not loaded',
            backendUnavailable: '❌ Backend is not available',
            
            // UI elements
            inputText: 'Input Text',
            translation: 'Translation',
            enterTextPlaceholder: 'Enter text to translate...',
            translationWillAppear: 'Translation will appear here...',
            
            // Buttons
            translateLocal: 'Translate on Local LLM',
            translating: 'Translating...',
            googleTranslate: 'Google Translate',
            
            // Dropdown options
            enToJa: 'English → Japanese',
            jaToEn: 'Japanese → English',
            
            // Messages
            pleaseEnterText: 'Please enter some text to translate.',
            processingTime: '⏱️ Processing time:',
            seconds: 'seconds',
            error: 'Error:',
            
            // Language switcher
            language: 'Language',
            english: 'English',
            japanese: 'Japanese',
            
            // Notifications
            urlUpdated: 'URL updated with language preference'
        },
        ja: {
            // Page title and description
            pageTitle: '言語翻訳アプリ',
            pageDescription: 'LLMを使用した日英翻訳サービス',
            
            // Status messages
            checkingBackend: 'バックエンドの状態を確認中...',
            backendHealthy: '✅ バックエンドは正常でモデルが読み込まれています',
            backendUnhealthy: '⚠️ バックエンドは動作中ですがモデルが読み込まれていません',
            backendUnavailable: '❌ バックエンドが利用できません',
            
            // UI elements
            inputText: '入力テキスト',
            translation: '翻訳',
            enterTextPlaceholder: '翻訳するテキストを入力してください...',
            translationWillAppear: '翻訳結果がここに表示されます...',
            
            // Buttons
            translateLocal: 'ローカルLLMで翻訳',
            translating: '翻訳中...',
            googleTranslate: 'Google翻訳',
            
            // Dropdown options
            enToJa: '英語 → 日本語',
            jaToEn: '日本語 → 英語',
            
            // Messages
            pleaseEnterText: '翻訳するテキストを入力してください。',
            processingTime: '⏱️ 処理時間:',
            seconds: '秒',
            error: 'エラー:',
            
            // Language switcher
            language: '言語',
            english: 'English',
            japanese: '日本語',
            
            // Notifications
            urlUpdated: 'URLが言語設定で更新されました'
        }
    },
    
    // Initialize i18n
    init() {
        // First check for query string parameter
        const urlParams = new URLSearchParams(window.location.search);
        const queryLang = urlParams.get('lang');
        
        if (queryLang && this.translations[queryLang]) {
            this.currentLang = queryLang;
            // Save the language preference from query string
            localStorage.setItem('appLanguage', queryLang);
        } else {
            // Try to get saved language preference
            const savedLang = localStorage.getItem('appLanguage');
            if (savedLang && this.translations[savedLang]) {
                this.currentLang = savedLang;
            } else {
                // Default to browser language or English
                const browserLang = navigator.language.split('-')[0];
                this.currentLang = this.translations[browserLang] ? browserLang : 'en';
            }
        }
        
        this.updatePage();
    },
    
    // Change language
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('appLanguage', lang);
            
            // Update URL with language parameter
            this.updateURL(lang);
            
            this.updatePage();
        }
    },
    
    // Get translation for a key
    t(key) {
        return this.translations[this.currentLang][key] || this.translations['en'][key] || key;
    },
    
    // Update all page elements
    updatePage() {
        // Update page title
        document.title = this.t('pageTitle');
        
        // Update main heading
        const h1 = document.querySelector('h1');
        if (h1) h1.textContent = this.t('pageTitle');
        
        // Update description
        const desc = document.querySelector('p');
        if (desc) desc.textContent = this.t('pageDescription');
        
        // Update input section heading
        const inputHeading = document.querySelector('.input-section h3');
        if (inputHeading) inputHeading.textContent = this.t('inputText');
        
        // Update output section heading
        const outputHeading = document.querySelector('.output-section h3');
        if (outputHeading) outputHeading.textContent = this.t('translation');
        
        // Update textarea placeholder
        const textarea = document.getElementById('input-text');
        if (textarea) textarea.placeholder = this.t('enterTextPlaceholder');
        
        // Update dropdown options
        const directionSelect = document.getElementById('direction');
        if (directionSelect) {
            directionSelect.options[0].text = this.t('enToJa');
            directionSelect.options[1].text = this.t('jaToEn');
        }
        
        // Update buttons
        const translateBtn = document.getElementById('translate-btn');
        if (translateBtn && !translateBtn.disabled) {
            translateBtn.textContent = this.t('translateLocal');
        }
        
        const googleBtn = document.getElementById('google-btn');
        if (googleBtn) googleBtn.textContent = this.t('googleTranslate');
        
        // Update result area if it shows default message
        const resultDiv = document.getElementById('result');
        if (resultDiv && resultDiv.querySelector('.loading')) {
            resultDiv.innerHTML = `<div class="loading">${this.t('translationWillAppear')}</div>`;
        }
        
        // Update initial status message if it's still showing the default
        const statusDiv = document.getElementById('status');
        if (statusDiv && statusDiv.textContent === 'Checking backend status...') {
            statusDiv.textContent = this.t('checkingBackend');
        }
        
        // Update status text based on current status class
        this.updateStatusText();
        
        // Update language switcher
        this.updateLanguageSwitcher();
    },
    
    // Update status text based on current status class
    updateStatusText() {
        const statusDiv = document.getElementById('status');
        if (statusDiv && typeof backendStatus !== 'undefined') {
            switch (backendStatus) {
                case 'healthy':
                    statusDiv.textContent = this.t('backendHealthy');
                    break;
                case 'unhealthy':
                    statusDiv.textContent = this.t('backendUnhealthy');
                    break;
                case 'unavailable':
                    statusDiv.textContent = this.t('backendUnavailable');
                    break;
                case 'checking':
                default:
                    statusDiv.textContent = this.t('checkingBackend');
                    break;
            }
        }
    },
    
    // Update language switcher
    updateLanguageSwitcher() {
        const switcherContainer = document.getElementById('language-switcher-container');
        if (switcherContainer) {
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                const newHTML = this.createLanguageSwitcher();
                switcherContainer.innerHTML = newHTML;
            }, 0);
        }
    },
    
    // Update URL with language parameter
    updateURL(lang) {
        const url = new URL(window.location);
        if (lang === 'en') {
            // Remove lang parameter for English (default)
            url.searchParams.delete('lang');
        } else {
            // Add or update lang parameter
            url.searchParams.set('lang', lang);
        }
        
        // Update URL without reloading the page
        window.history.replaceState({}, '', url);
        
        // Show notification
        this.showURLNotification();
    },
    
    // Show URL update notification
    showURLNotification() {
        const notification = document.getElementById('url-notification');
        if (notification) {
            notification.textContent = this.t('urlUpdated');
            notification.classList.add('show');
            
            // Hide notification after 3 seconds
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    },
    
    // Create language switcher HTML
    createLanguageSwitcher() {
        return `
            <div class="language-switcher">
                <label for="language-select">${this.t('language')}:</label>
                <select id="language-select" onchange="i18n.setLanguage(this.value)">
                    <option value="en" ${this.currentLang === 'en' ? 'selected' : ''}>${this.t('english')}</option>
                    <option value="ja" ${this.currentLang === 'ja' ? 'selected' : ''}>${this.t('japanese')}</option>
                </select>
            </div>
        `;
    }
};

// Export for global use
window.i18n = i18n; 
