// Daily Practice functionality
window.DailyPractice = {
    getReviewDueLetters() {
        const allLearntLetters = window.Storage.getLearntLetters('write');
        const now = Date.now();

        function isFromDifferentDay(timestamp) {
            if (!timestamp) return true;
            const date1 = new Date(timestamp);
            const date2 = new Date(now);
            return date1.getDate() !== date2.getDate() ||
                   date1.getMonth() !== date2.getMonth() ||
                   date1.getFullYear() !== date2.getFullYear();
        }

        const dueLetters = allLearntLetters
            .filter(letter => isFromDifferentDay(letter.lastReviewed))
            .sort((a, b) => (a.lastReviewed || 0) - (b.lastReviewed || 0))
            .slice(0, 20);

        return dueLetters;
    },

    updateDailyReview() {
        const reviewSection = document.querySelector('.daily-review');
        if (!reviewSection) return;

        const dueLetters = this.getReviewDueLetters();

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

        // If there are letters to review, show the review cards and button
        reviewSection.classList.remove('empty');
        reviewSection.innerHTML = `
            <h2>Daily Review</h2>
            <div class="review-cards"></div>
            <button id="startReview" class="primary-button">Start Review</button>
        `;

        const reviewCards = document.querySelector('.review-cards');
        const startReviewButton = document.getElementById('startReview');

        reviewCards.innerHTML = dueLetters.map(letter => {
            const writeStats = window.Storage.getLetterStats(letter.letter, 'write');
            const readStats = window.Storage.getLetterStats(letter.letter, 'read');
            const writeAccuracy = writeStats ? Math.round(writeStats.accuracy * 100) : 0;
            const readAccuracy = readStats ? Math.round(readStats.accuracy * 100) : 0;
            const lastReviewed = letter.lastReviewed;
            const daysAgo = lastReviewed ? Math.floor((Date.now() - lastReviewed) / (24 * 60 * 60 * 1000)) : 'New';
            const lastReviewedText = daysAgo === 'New' ? 'New letter' : `Last reviewed ${daysAgo} days ago`;

            return `
                <div class="review-card">
                    <div class="letter">${letter.letter}</div>
                    <div class="transliteration">${window.letters[letter.letter].transliteration}</div>
                    <div class="stats">
                        <span class="accuracy write">Write: ${writeAccuracy}%</span>
                        <span class="accuracy read">Read: ${readAccuracy}%</span>
                    </div>
                    <div class="last-reviewed">${lastReviewedText}</div>
                </div>
            `;
        }).join('');

        // Add click handler to start review button
        startReviewButton.onclick = () => this.startDailyReview();
    },

    startDailyReview() {
        const dueLetters = this.getReviewDueLetters();
        if (dueLetters.length === 0) return;

        // Create review items for both read and write modes
        const reviewItems = [];
        dueLetters.forEach(letter => {
            const writeStats = window.Storage.getLetterStats(letter.letter, 'write');
            const readStats = window.Storage.getLetterStats(letter.letter, 'read');
            const writeAccuracy = writeStats ? writeStats.accuracy : 0;
            const readAccuracy = readStats ? readStats.accuracy : 0;

            // Add write mode first if accuracy is lower, otherwise add read mode first
            if (writeAccuracy <= readAccuracy) {
                reviewItems.push({ letter: letter.letter, mode: 'write' });
                reviewItems.push({ letter: letter.letter, mode: 'read' });
            } else {
                reviewItems.push({ letter: letter.letter, mode: 'read' });
                reviewItems.push({ letter: letter.letter, mode: 'write' });
            }
        });

        // Store review items in localStorage
        localStorage.setItem('reviewLetters', JSON.stringify(reviewItems));

        // Start with the first item
        const firstItem = reviewItems[0];
        if (firstItem.mode === 'write') {
            window.location.href = `practice.html?mode=review&letter=${firstItem.letter}`;
        } else {
            window.location.href = `read.html?mode=review&letter=${firstItem.letter}`;
        }
    },

    handleReviewCompletion(letter, mode, isCorrect) {
        // Get current review list
        const reviewLetters = JSON.parse(localStorage.getItem('reviewLetters') || '[]');
        
        if (isCorrect) {
            // Remove both read and write modes of this letter from the list
            const filteredLetters = reviewLetters.filter(item => item.letter !== letter);
            localStorage.setItem('reviewLetters', JSON.stringify(filteredLetters));

            // Update last reviewed time
            const learntLetters = window.Storage.getLearntLetters('write');
            const updatedLetters = learntLetters.map(l => {
                if (l.letter === letter) {
                    return { ...l, lastReviewed: Date.now() };
                }
                return l;
            });
            window.Storage.setLearntLetters(updatedLetters, 'write');
        } else {
            // Move current mode to the end of the list
            const currentItem = reviewLetters.shift();
            if (currentItem) {
                reviewLetters.push(currentItem);
                localStorage.setItem('reviewLetters', JSON.stringify(reviewLetters));
            }
        }

        // Get updated review list
        const updatedReviewLetters = JSON.parse(localStorage.getItem('reviewLetters') || '[]');
        
        if (updatedReviewLetters.length === 0) {
            // All reviews completed
            window.location.href = 'index.html';
            return;
        }

        // Continue with next letter
        const nextItem = updatedReviewLetters[0];
        if (nextItem.mode === 'write') {
            window.location.href = `practice.html?mode=review&letter=${nextItem.letter}`;
        } else {
            window.location.href = `read.html?mode=review&letter=${nextItem.letter}`;
        }
    }
}; 