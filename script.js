// Global variables
let currentTheme = '';
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedQuestions = [];

// Theme selection from index.html
function selectTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('selectedTheme', theme);
    window.location.href = 'quiz.html';
}

// Quiz page functionality
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.endsWith('quiz.html')) {
        initializeQuizPage();
    }
});

function initializeQuizPage() {
    const theme = localStorage.getItem('selectedTheme');
    if (!theme) {
        window.location.href = 'index.html';
        return;
    }
    
    currentTheme = theme;
    document.getElementById('theme-title').textContent = 
        theme.charAt(0).toUpperCase() + theme.slice(1).replace(/([A-Z])/g, ' $1');
    
    // Load questions for the selected theme
    fetch(`themes/${theme}.json`)
        .then(response => response.json())
        .then(data => {
            questions = data;
            setupQuestionCountSelection();
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            alert('Failed to load questions. Please try again.');
        });
}

function setupQuestionCountSelection() {
    const countButtonsContainer = document.getElementById('count-buttons');
    const counts = [10, 20, 30];
    
    // Add buttons for 10, 20, 30 if there are enough questions
    counts.forEach(count => {
        if (questions.length >= count) {
            const button = document.createElement('button');
            button.textContent = count;
            button.onclick = () => startQuiz(count);
            countButtonsContainer.appendChild(button);
        }
    });
    
    // Add button for all questions
    const allButton = document.createElement('button');
    allButton.textContent = `All (${questions.length})`;
    allButton.onclick = () => startQuiz(questions.length);
    countButtonsContainer.appendChild(allButton);
}

function startQuiz(questionCount) {
    document.getElementById('question-count-selection').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    
    // Shuffle questions and select the requested number
    selectedQuestions = shuffleArray([...questions]).slice(0, questionCount);
    
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex >= selectedQuestions.length) {
        showResults();
        return;
    }
    
    const question = selectedQuestions[currentQuestionIndex];
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const explanationContainer = document.getElementById('explanation-container');
    
    // Update progress bar
    const progress = ((currentQuestionIndex) / selectedQuestions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    
    // Hide explanation and show question
    explanationContainer.style.display = 'none';
    questionText.textContent = question.question;
    
    // Clear previous options
    optionsContainer.innerHTML = '';
    
    // Shuffle options and create buttons
    const shuffledOptions = shuffleArray([...question.choices]);
    shuffledOptions.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => checkAnswer(option, question.answer);
        optionsContainer.appendChild(button);
    });
}

function checkAnswer(selectedOption, correctAnswer) {
    const options = document.querySelectorAll('#options-container button');
    const explanationContainer = document.getElementById('explanation-container');
    const explanationText = document.getElementById('explanation-text');
    const question = selectedQuestions[currentQuestionIndex];
    
    // Disable all options
    options.forEach(option => {
        option.disabled = true;
        if (option.textContent === correctAnswer) {
            option.classList.add('correct');
        } else if (option.textContent === selectedOption && selectedOption !== correctAnswer) {
            option.classList.add('incorrect');
        }
    });
    
    // Update score if correct
    if (selectedOption === correctAnswer) {
        score++;
    }
    
    // Show explanation
    explanationText.textContent = question.explanation || 'No explanation available.';
    explanationContainer.style.display = 'block';
    
    // Set up next question button
    document.getElementById('next-button').onclick = nextQuestion;
}

function nextQuestion() {
    currentQuestionIndex++;
    displayQuestion();
}

function showResults() {
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    
    document.getElementById('score').textContent = score;
    document.getElementById('total').textContent = selectedQuestions.length;
}

// Utility function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
