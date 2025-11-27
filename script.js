class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.moves = 0;
        this.matches = 0;
        this.gameStarted = false;
        this.timer = 0;
        this.timerInterval = null;
        this.animationInProgress = false;
        
        // URLs das imagens - substitua pelas suas imagens
        this.images = [
            'img1.jpg',
            'img2.jpg', 
            'img3.jpg',
            'img4.jpg',
            'img5.jpg',
            'img6.jpg',
            'img7.jpg',
            'img8.jpg'
        ];
        
        // Opção alternativa: usar imagens da web
        /*
        this.images = [
            'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1514984879728-be0aff75a6e8?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1555169062-013468b47731?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=200&h=200&fit=crop'
        ];
        */
        
        this.totalPairs = 8;
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.generateCards();
        this.renderBoard();
        this.updateDisplay();
        this.startCardAnimation();
    }
    
    generateCards() {
        let cardImages = [...this.images, ...this.images];
        cardImages = this.shuffleArray(cardImages);
        
        this.cards = cardImages.map((image, index) => ({
            id: index,
            image: image,
            flipped: false,
            matched: false
        }));
    }
    
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        this.cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.id = card.id;
            
            if (card.flipped || card.matched) {
                cardElement.classList.add('flipped');
            }
            if (card.matched) {
                cardElement.classList.add('matched');
            }
            
            cardElement.innerHTML = `
                <div class="back">?</div>
                <div class="front">
                    <img src="${card.image}" alt="Card image" class="card-image">
                </div>
            `;
            
            cardElement.addEventListener('click', () => this.handleCardClick(card.id));
            gameBoard.appendChild(cardElement);
        });
    }
    
    startCardAnimation() {
        this.animationInProgress = true;
        const cards = document.querySelectorAll('.card');
        
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0) rotate(180deg)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'scale(1) rotate(0deg)';
            }, index * 100);
        });
        
        setTimeout(() => {
            this.flipAllCards(true);
            
            setTimeout(() => {
                this.flipAllCards(false);
                this.animationInProgress = false;
                this.gameStarted = true;
                this.showMessage('O Jogo começou! Encontre os pares!');
            }, 2000);
        }, cards.length * 100 + 500);
    }
    
    flipAllCards(show) {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach((card, index) => {
            setTimeout(() => {
                const cardId = parseInt(card.dataset.id);
                if (show) {
                    card.classList.add('flipped');
                    this.cards[cardId].flipped = true;
                } else {
                    card.classList.remove('flipped');
                    this.cards[cardId].flipped = false;
                }
            }, index * 50);
        });
    }
    
    handleCardClick(cardId) {
        if (this.animationInProgress || !this.gameStarted) {
            return;
        }
        
        const card = this.cards[cardId];
        
        if (card.flipped || card.matched || this.flippedCards.length === 2) {
            return;
        }
        
        if (this.moves === 0 && this.flippedCards.length === 0) {
            this.startTimer();
        }
        
        card.flipped = true;
        this.flippedCards.push(card);
        this.renderBoard();
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateDisplay();
            this.checkForMatch();
        }
    }
    
    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.image === card2.image) {
            card1.matched = true;
            card2.matched = true;
            this.matches++;
            
            this.animateMatch(card1.id, card2.id);
            
            this.flippedCards = [];
            
            if (this.matches === this.totalPairs) {
                setTimeout(() => this.endGame(), 500);
            } else {
                this.showMessage('Parabéns! Combinação encontrada!');
            }
        } else {
            setTimeout(() => {
                this.animateMismatch(card1.id, card2.id);
            }, 1000);
        }
    }
    
    animateMatch(cardId1, cardId2) {
        const card1 = document.querySelector(`.card[data-id="${cardId1}"]`);
        const card2 = document.querySelector(`.card[data-id="${cardId2}"]`);
        
        if (card1 && card2) {
            card1.style.animation = 'pulse 0.5s ease';
            card2.style.animation = 'pulse 0.5s ease';
            
            setTimeout(() => {
                card1.style.animation = '';
                card2.style.animation = '';
            }, 500);
        }
    }
    
    animateMismatch(cardId1, cardId2) {
        const card1 = document.querySelector(`.card[data-id="${cardId1}"]`);
        const card2 = document.querySelector(`.card[data-id="${cardId2}"]`);
        
        if (card1 && card2) {
            card1.style.animation = 'shake 0.5s ease';
            card2.style.animation = 'shake 0.5s ease';
            
            setTimeout(() => {
                card1.style.animation = '';
                card2.style.animation = '';
                
                this.cards[cardId1].flipped = false;
                this.cards[cardId2].flipped = false;
                this.flippedCards = [];
                this.renderBoard();
            }, 500);
        }
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateDisplay();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateDisplay() {
        document.getElementById('moves-count').textContent = this.moves;
        document.getElementById('timer').textContent = this.timer;
    }
    
    showMessage(text) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.classList.add('show');
        
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 2000);
    }
    
    endGame() {
        this.stopTimer();
        this.gameStarted = false;
        this.animateWin();
        this.showMessage(`Parabéns! Você venceu com ${this.moves} movimentos e um tempo de ${this.timer} segundos!`);
    }
    
    animateWin() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = 'bounce 0.6s ease';
                
                setTimeout(() => {
                    card.style.animation = '';
                }, 600);
            }, index * 100);
        });
    }
    
    resetGame() {
        this.stopTimer();
        this.flippedCards = [];
        this.moves = 0;
        this.matches = 0;
        this.gameStarted = false;
        this.animationInProgress = false;
        this.timer = 0;
        
        this.initializeGame();
    }
    
    setupEventListeners() {
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });
    }
}

// Inicia o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});