// Daily Practice functionality
window.DailyPractice = {
    getReviewDueLetters() {
        const learntLettersWrite = window.Storage.getLearntLetters('write') || [];
        const learntLettersRead = window.Storage.getLearntLetters('read') || [];
        const now = Date.now();
        
        // Helper function to check if a timestamp is from a different calendar day
        function isFromDifferentDay(timestamp) {
            if (!timestamp) return true;
            const date1 = new Date(timestamp);
            const date2 = new Date(now);
            return date1.getDate() !== date2.getDate() ||
                   date1.getMonth() !== date2.getMonth() ||
                   date1.getFullYear() !== date2.getFullYear();
        }

        // Helper function to calculate days since a timestamp
        function getDaysSince(timestamp) {
            if (!timestamp) return null;
            const date1 = new Date(timestamp);
            const date2 = new Date();
            // Set both dates to start of day for accurate day calculation
            date1.setHours(0, 0, 0, 0);
            date2.setHours(0, 0, 0, 0);
            const diffTime = date2 - date1;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // Return at least 1 if it's from a previous day
            return diffDays > 0 ? diffDays : 1;
        }
        
        // Get all letters from letters.js
        const allLetters = [];
        if (window.letters.vowels) {
            allLetters.push(...window.letters.vowels);
        }
        if (window.letters.consonants) {
            Object.values(window.letters.consonants).forEach(group => {
                allLetters.push(...group);
            });
        }
        
        // Get letters that need review
        const dueLetters = allLetters
            .map(letterObj => {
                const letter = letterObj.letter;
                const writeStats = learntLettersWrite.find(l => 
                    (typeof l === 'string' && l === letter) || 
                    (typeof l === 'object' && l.letter === letter)
                );
                const readStats = learntLettersRead.find(l => 
                    (typeof l === 'string' && l === letter) || 
                    (typeof l === 'object' && l.letter === letter)
                );
                
                // Skip if letter hasn't been learned in either mode
                if (!writeStats && !readStats) return null;
                
                // Get the most recent review/learn time
                const lastReviewedWrite = writeStats?.lastReviewed || writeStats?.learnedDate;
                const lastReviewedRead = readStats?.lastReviewed || readStats?.learnedDate;
                
                // Get the oldest review date between read and write modes
                const lastReviewed = lastReviewedWrite && lastReviewedRead ?
                    Math.min(lastReviewedWrite, lastReviewedRead) :
                    lastReviewedWrite || lastReviewedRead;
                
                // Get when the letter was first learned
                const learnedDateWrite = writeStats?.learnedDate;
                const learnedDateRead = readStats?.learnedDate;
                const learnedDate = learnedDateWrite && learnedDateRead ?
                    Math.min(learnedDateWrite, learnedDateRead) :
                    learnedDateWrite || learnedDateRead;
                
                // Calculate accuracies
                const writeAccuracy = writeStats ? 
                    window.Storage.getLetterCorrectness(letter, 'write') : 0;
                const readAccuracy = readStats ? 
                    window.Storage.getLetterCorrectness(letter, 'read') : 0;
                
                // Calculate average accuracy
                const avgAccuracy = (writeAccuracy + readAccuracy) / 2;
                
                return {
                    ...letterObj,
                    lastReviewed,
                    learnedDate,
                    writeStats,
                    readStats,
                    avgAccuracy,
                    daysSinceReview: getDaysSince(lastReviewed)
                };
            })
            .filter(letterInfo => {
                if (!letterInfo) return false;
                
                // Only include letters that have a valid learned date
                if (!letterInfo.learnedDate) return false;
                
                // Exclude letters learned today
                if (!isFromDifferentDay(letterInfo.learnedDate)) return false;
                
                // Exclude letters reviewed today
                if (letterInfo.lastReviewed && !isFromDifferentDay(letterInfo.lastReviewed)) return false;
                
                return true;
            })
            .sort((a, b) => {
                // First, sort by accuracy (ascending - less accurate first)
                if (a.avgAccuracy !== b.avgAccuracy) {
                    return a.avgAccuracy - b.avgAccuracy;
                }
                
                // Then by last reviewed time (ascending - oldest first)
                return (a.lastReviewed || 0) - (b.lastReviewed || 0);
            })
            .slice(0, 20); // Get up to 20 letters for review
            
        return dueLetters;
    },

    updateDailyReview() {
        const reviewSection = document.querySelector('.daily-review');
        const reviewCards = document.querySelector('.review-cards');
        if (!reviewCards || !reviewSection) return;
        
        const dueLetters = this.getReviewDueLetters();
        console.log('Letters due for review:', dueLetters);
        
        if (dueLetters.length === 0) {
            reviewSection.classList.add('empty');
            reviewSection.innerHTML = `
                <h2>Daily Review</h2>
                <div class="review-cards">
                    <div class="review-complete">
                        <span class="material-icons">check_circle</span>
                        <p>Daily Review Done! Come back tomorrow</p>
                    </div>
                </div>
            `;
            return;
        }
        
        // Show the section and remove empty class
        reviewSection.style.display = '';
        reviewSection.classList.remove('empty');
        
        // Create cards for each letter
        reviewCards.innerHTML = dueLetters.map(letterInfo => {
            const writeAccuracy = letterInfo.writeStats ? 
                window.Storage.getLetterCorrectness(letterInfo.letter, 'write') : 0;
            const readAccuracy = letterInfo.readStats ? 
                window.Storage.getLetterCorrectness(letterInfo.letter, 'read') : 0;
            
            // Format the last reviewed text
            let lastReviewedText = '';
            if (letterInfo.daysSinceReview !== null) {
                lastReviewedText = `Last reviewed ${letterInfo.daysSinceReview} days ago`;
            }
            
            return `
                <div class="review-card" data-letter="${letterInfo.letter}">
                    <div class="letter">${letterInfo.letter}</div>
                    <div class="transliteration">${letterInfo.transliteration || ''}</div>
                    <div class="stats">
                        <div class="accuracy write">Write: ${writeAccuracy}%</div>
                        <div class="accuracy read">Read: ${readAccuracy}%</div>
                    </div>
                    ${lastReviewedText ? `<div class="last-reviewed">${lastReviewedText}</div>` : ''}
                </div>
            `;
        }).join('');
        
        // Enable the start review button
        const startButton = document.getElementById('startReview');
        if (startButton) {
            startButton.removeAttribute('disabled');
            startButton.onclick = () => this.startDailyReview();
        }
    },

    startDailyReview() {
        const dueLetters = this.getReviewDueLetters();
        if (dueLetters.length === 0) return;
        
        // Create review items for both read and write modes
        const reviewLetters = [];
        dueLetters.forEach(letterInfo => {
            const writeAccuracy = letterInfo.writeStats ? 
                window.Storage.getLetterCorrectness(letterInfo.letter, 'write') : 0;
            const readAccuracy = letterInfo.readStats ? 
                window.Storage.getLetterCorrectness(letterInfo.letter, 'read') : 0;
            
            // Add write mode first if write accuracy is lower
            if (writeAccuracy <= readAccuracy) {
                reviewLetters.push({
                    ...letterInfo,
                    mode: 'write'
                });
                reviewLetters.push({
                    ...letterInfo,
                    mode: 'read'
                });
            } else {
                reviewLetters.push({
                    ...letterInfo,
                    mode: 'read'
                });
                reviewLetters.push({
                    ...letterInfo,
                    mode: 'write'
                });
            }
        });
        
        // Store the letters to review in localStorage
        localStorage.setItem('reviewLetters', JSON.stringify(reviewLetters));
        
        // Start with the first letter
        const firstLetter = reviewLetters[0];
        if (firstLetter.mode === 'write') {
            window.location.href = 'practice.html?mode=review';
        } else {
            window.location.href = 'read.html?mode=review';
        }
    }
}; 