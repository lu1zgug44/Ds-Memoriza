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
        // cria o array com pares e embaralha
        let cardImages = [...this.images, ...this.images];
        cardImages = this.shuffleArray(cardImages);
        
        // cada carta tem seu índice (index) no array; não usamos id separado
        this.cards = cardImages.map((image) => ({
            image,
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
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            // usamos data-index (índice atual no array this.cards)
            cardElement.dataset.index = index;
            
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
                const dataIndex = parseInt(card.dataset.index, 10);
                if (Number.isNaN(dataIndex)) return;
                if (show) {
                    card.classList.add('flipped');
                    this.cards[dataIndex].flipped = true;
                } else {
                    card.classList.remove('flipped');
                    this.cards[dataIndex].flipped = false;
                }
            }, index * 50);
        });
    }
    
    // agora usamos delegação de evento: recebe o data-index da carta clicada
    handleCardClickByIndex(dataIndex) {
        // proteção: índice válido
        if (dataIndex == null) return;
        const index = parseInt(dataIndex, 10);
        if (Number.isNaN(index) || index < 0 || index >= this.cards.length) return;
        
        if (this.animationInProgress || !this.gameStarted) {
            return;
        }
        
        const card = this.cards[index];
        
        if (!card || card.flipped || card.matched || this.flippedCards.length === 2) {
            return;
        }
        
        // inicia o timer no primeiro movimento (quando ainda não houve movimentos)
        if (this.moves === 0 && this.flippedCards.length === 0 && !this.gameStarted) {
            // mas normalmente gameStarted já será true
            this.startTimer();
        }
        if (this.moves === 0 && this.flippedCards.length === 0 && this.gameStarted && !this.timerInterval) {
            this.startTimer();
        }
        
        // vira a carta
        card.flipped = true;
        this.flippedCards.push({ ...card, index }); // guarda também o índice
        this.renderBoard();
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateDisplay();
            // bloqueia cliques curtos durante verificação
            this.animationInProgress = true;
            setTimeout(() => {
                this.checkForMatch();
            }, 250); // pequeno delay para renderizar a segunda face antes de checar
        }
    }
    
    checkForMatch() {
        const [c1, c2] = this.flippedCards;
        if (!c1 || !c2) {
            this.animationInProgress = false;
            return;
        }
        
        const card1 = this.cards[c1.index];
        const card2 = this.cards[c2.index];
        
        if (card1.image === card2.image) {
            card1.matched = true;
            card2.matched = true;
            this.matches++;
            
            this.animateMatch(c1.index, c2.index);
            
            this.flippedCards = [];
            this.renderBoard();
            this.animationInProgress = false;
            
            if (this.matches === this.totalPairs) {
                setTimeout(() => this.endGame(), 500);
            } else {
                this.showMessage('Parabéns! Combinação encontrada!');
            }
        } else {
            // anima mismatch e depois desvira
            this.animateMismatch(c1.index, c2.index);
        }
    }
    
    animateMatch(index1, index2) {
        const card1 = document.querySelector(`.card[data-index="${index1}"]`);
        const card2 = document.querySelector(`.card[data-index="${index2}"]`);
        
        if (card1 && card2) {
            card1.style.animation = 'pulse 0.5s ease';
            card2.style.animation = 'pulse 0.5s ease';
            
            setTimeout(() => {
                card1.style.animation = '';
                card2.style.animation = '';
            }, 500);
        }
    }
    
    animateMismatch(index1, index2) {
        const card1 = document.querySelector(`.card[data-index="${index1}"]`);
        const card2 = document.querySelector(`.card[data-index="${index2}"]`);
        
        if (card1 && card2) {
            card1.style.animation = 'shake 0.5s ease';
            card2.style.animation = 'shake 0.5s ease';
            
            setTimeout(() => {
                card1.style.animation = '';
                card2.style.animation = '';
                
                // desvira as cartas no modelo de dados
                this.cards[index1].flipped = false;
                this.cards[index2].flipped = false;
                this.flippedCards = [];
                this.renderBoard();
                this.animationInProgress = false;
            }, 500);
        } else {
            // fallback: caso algo esteja estranho, apenas resetar o estado das cartas
            this.cards[index1].flipped = false;
            this.cards[index2].flipped = false;
            this.flippedCards = [];
            this.renderBoard();
            this.animationInProgress = false;
        }
    }
    
    startTimer() {
        if (this.timerInterval) return;
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
        this.updateDisplay();
        
        this.initializeGame();
    }
    
    setupEventListeners() {
        // delegação: 1 listener no board (evita múltiplos listeners duplicados)
        const gameBoard = document.getElementById('game-board');
        gameBoard.addEventListener('click', (e) => {
            const cardEl = e.target.closest('.card');
            if (!cardEl) return;
            const dataIndex = cardEl.dataset.index;
            this.handleCardClickByIndex(dataIndex);
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });
    }
}

// Inicia o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
