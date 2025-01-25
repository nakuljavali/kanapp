// Sample news data structure (to be replaced with actual API integration)
const sampleNews = [
    {
        english: "Karnataka Government Announces New Education Policy",
        kannada: "ಕರ್ನಾಟಕ ಸರ್ಕಾರ ಹೊಸ ಶಿಕ್ಷಣ ನೀತಿಯನ್ನು ಪ್ರಕಟಿಸಿದೆ",
        transliteration: "Karnataka sarkara hosa shikshana neetiyannu prakatiside",
        translation: "The Karnataka government has announced a new education policy"
    },
    {
        english: "Bengaluru Metro Extends Operating Hours",
        kannada: "ಬೆಂಗಳೂರು ಮೆಟ್ರೋ ಕಾರ್ಯನಿರ್ವಹಣೆ ಸಮಯವನ್ನು ವಿಸ್ತರಿಸಿದೆ",
        transliteration: "Bengaluru metro karyanirvahane samayannu vistariside",
        translation: "Bengaluru Metro has extended its operational hours"
    },
    {
        english: "Heavy Rain Expected in Coastal Karnataka",
        kannada: "ಕರಾವಳಿ ಕರ್ನಾಟಕದಲ್ಲಿ ಭಾರೀ ಮಳೆ ನಿರೀಕ್ಷೆ",
        transliteration: "Karavali Karnatakadalli bhari male nirikshe",
        translation: "Heavy rainfall is expected in coastal Karnataka"
    },
    {
        english: "New Technology Park Opens in Mysuru",
        kannada: "ಮೈಸೂರಿನಲ್ಲಿ ಹೊಸ ತಂತ್ರಜ್ಞಾನ ಉದ್ಯಾನ ಉದ್ಘಾಟನೆ",
        transliteration: "Mysoorinalli hosa tantrajnana udyana udghatane",
        translation: "New technology park inaugurated in Mysuru"
    },
    {
        english: "Karnataka Farmers Win National Award",
        kannada: "ಕರ್ನಾಟಕ ರೈತರಿಗೆ ರಾಷ್ಟ್ರೀಯ ಪ್ರಶಸ್ತಿ",
        transliteration: "Karnataka raitarige rashtriya prashasti",
        translation: "Karnataka farmers receive national award"
    }
];

// NewsAPI configuration
const NEWS_API_KEY = 'YOUR_NEWS_API_KEY'; // Replace with your actual API key
const GOOGLE_TRANSLATE_API_KEY = 'YOUR_GOOGLE_API_KEY'; // Replace with your actual API key

// Function to fetch news from NewsAPI
async function fetchNewsFromAPI() {
    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q=Karnataka&language=en&pageSize=5&apiKey=${NEWS_API_KEY}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch news');
        }
        
        return data.articles;
    } catch (error) {
        console.error('Error fetching news:', error);
        return null;
    }
}

// Function to translate text to Kannada
async function translateToKannada(text) {
    try {
        const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: 'en',
                target: 'kn',
                format: 'text'
            })
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'Translation failed');
        }
        
        return data.data.translations[0].translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        return null;
    }
}

// Function to generate transliteration
function generateTransliteration(kannadaText) {
    // This is a simplified transliteration. In a production environment,
    // you should use a proper transliteration library or API
    const transliterationMap = {
        'ಅ': 'a', 'ಆ': 'aa', 'ಇ': 'i', 'ಈ': 'ee', 'ಉ': 'u',
        'ಊ': 'oo', 'ಋ': 'ru', 'ಎ': 'e', 'ಏ': 'ae', 'ಐ': 'ai',
        'ಒ': 'o', 'ಓ': 'o', 'ಔ': 'au', 'ಂ': 'm', 'ಃ': 'h',
        // Add more mappings as needed
    };
    
    let transliteration = '';
    for (let char of kannadaText) {
        transliteration += transliterationMap[char] || char;
    }
    return transliteration;
}

// Function to process news articles
async function processNewsArticles(articles) {
    if (!articles) return [];
    
    const processedNews = [];
    for (const article of articles) {
        try {
            // Translate title to Kannada
            const kannadaTitle = await translateToKannada(article.title);
            if (!kannadaTitle) continue;
            
            processedNews.push({
                english: article.title,
                kannada: kannadaTitle,
                transliteration: generateTransliteration(kannadaTitle),
                translation: article.title, // Original English title as translation
                url: article.url,
                publishedAt: new Date(article.publishedAt).toLocaleDateString()
            });
        } catch (error) {
            console.error('Error processing article:', error);
        }
    }
    
    return processedNews;
}

// Function to display news items
function displayNews(newsItems) {
    const newsGrid = document.querySelector('.news-grid');
    if (!newsGrid) return;
    
    newsGrid.innerHTML = newsItems.map(news => `
        <div class="news-item">
            <div class="headline">${news.english}</div>
            <div class="kannada">${news.kannada}</div>
            <div class="transliteration">${news.transliteration}</div>
            <div class="translation">${news.translation}</div>
            <div class="news-meta">
                <span class="date">${news.publishedAt}</span>
                <a href="${news.url}" target="_blank" rel="noopener noreferrer" class="read-more">
                    Read More <span class="material-icons">open_in_new</span>
                </a>
            </div>
        </div>
    `).join('');
}

// Initialize news page
async function initNews() {
    const newsGrid = document.querySelector('.news-grid');
    if (!newsGrid) return;
    
    try {
        // First try to fetch from API
        const articles = await fetchNewsFromAPI();
        
        if (!articles) {
            // Fallback to sample data if API fails
            displayNews(sampleNews);
            return;
        }
        
        const processedNews = await processNewsArticles(articles);
        
        if (processedNews.length === 0) {
            newsGrid.innerHTML = `
                <div class="error-message">
                    <span class="material-icons">error_outline</span>
                    Unable to load news. Please try again later.
                </div>
            `;
            return;
        }
        
        displayNews(processedNews);
    } catch (error) {
        console.error('Error initializing news:', error);
        // Fallback to sample data
        displayNews(sampleNews);
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initNews); 