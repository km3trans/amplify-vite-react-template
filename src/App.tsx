import { useEffect, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from './amplify/data/resource';
import Chart from 'chart.js/auto'; // Import Chart.js

const client = generateClient<Schema>();

// Mock data for the game
const allCategories = [
  { name: 'HISTORY', questions: [
    { value: 100, question: 'Who was the first President of the United States?', answer: 'George Washington' },
    { value: 200, question: 'In what year did the Titanic sink?', answer: '1912' },
    { value: 300, question: 'The Hundred Years\' War was fought between which two countries?', answer: 'England and France' },
    { value: 400, question: 'What ancient civilization built the pyramids?', answer: 'Egyptians' },
    { value: 500, question: 'Who discovered penicillin?', answer: 'Alexander Fleming' },
    { value: 600, question: 'The Roman Empire was divided into two halves by which emperor?', answer: 'Diocletian' }
  ]},
  { name: 'SCIENCE', questions: [
    { value: 100, question: 'What is the chemical symbol for water?', answer: 'H2O' },
    { value: 200, question: 'What planet is known as the Red Planet?', answer: 'Mars' },
    { value: 300, question: 'What is the hardest natural substance on Earth?', answer: 'Diamond' },
    { value: 400, question: 'What force keeps planets in orbit around the sun?', answer: 'Gravity' },
    { value: 500, question: 'What is the process by which plants make their own food?', answer: 'Photosynthesis' },
    { value: 600, question: 'How many bones are in the adult human body?', answer: '206' }
  ]},
  { name: 'GEOGRAPHY', questions: [
    { value: 100, question: 'What is the capital of France?', answer: 'Paris' },
    { value: 200, question: 'Which is the longest river in the world?', answer: 'Nile' },
    { value: 300, question: 'What is the largest desert in the world?', answer: 'Sahara Desert' },
    { value: 400, question: 'What is the highest mountain in North America?', answer: 'Denali' },
    { value: 500, question: 'What is the smallest country in the world?', answer: 'Vatican City' },
    { value: 600, question: 'Which continent has the most countries?', answer: 'Africa' }
  ]},
  { name: 'MOVIES', questions: [
    { value: 100, question: 'What year was the first "Toy Story" movie released?', answer: '1995' },
    { value: 200, question: 'Who directed the movie "Pulp Fiction"?', answer: 'Quentin Tarantino' },
    { value: 300, question: 'What is the name of the wizarding school in Harry Potter?', answer: 'Hogwarts' },
    { value: 400, question: 'Who played the lead role in "The Matrix"?', answer: 'Keanu Reeves' },
    { value: 500, question: 'What is the highest-grossing film of all time?', answer: 'Avatar' },
    { value: 600, question: 'What movie features the line "Here\'s Johnny!"?', answer: 'The Shining' }
  ]},
  { name: 'SPORTS', questions: [
    { value: 100, question: 'How many players are on a baseball team?', answer: 'Nine' },
    { value: 200, question: 'What sport is known as the "king of sports"?', answer: 'Soccer' },
    { value: 300, question: 'How long is an Olympic swimming pool?', answer: '50 meters' },
    { value: 400, question: 'What country won the first-ever soccer World Cup?', answer: 'Uruguay' },
    { value: 500, question: 'Who is the all-time leading scorer in NBA history?', answer: 'LeBron James' },
    { value: 600, question: 'What is a "birdie" in golf?', answer: 'One stroke under par on a hole' }
  ]},
  { name: 'ANIMALS', questions: [
    { value: 100, question: 'What is the largest land animal?', answer: 'African elephant' },
    { value: 200, question: 'Which animal is known as the "king of the jungle"?', answer: 'Lion' },
    { value: 300, question: 'What do you call a group of crows?', answer: 'A murder' },
    { value: 400, question: 'Which is the tallest living animal?', answer: 'Giraffe' },
    { value: 500, question: 'How many hearts does an octopus have?', answer: 'Three' },
    { value: 600, question: 'What is the only mammal capable of true flight?', answer: 'Bat' }
  ]},
  { name: 'FOOD & DRINK', questions: [
    { value: 100, question: 'What is the main ingredient in guacamole?', answer: 'Avocado' },
    { value: 200, question: 'What is sushi traditionally wrapped in?', answer: 'Nori (seaweed)' },
    { value: 300, question: 'From what fruit is raisin made?', answer: 'Grape' },
    { value: 400, question: 'What is the most consumed manufactured drink in the world?', answer: 'Tea' },
    { value: 500, question: 'What is a popular Italian dish made with layered pasta, meat, and cheese?', answer: 'Lasagna' },
    { value: 600, question: 'In culinary terms, what is a roux?', answer: 'A mixture of fat and flour' }
  ]},
  { name: 'TECHNOLOGY', questions: [
    { value: 100, question: 'What does "URL" stand for?', answer: 'Uniform Resource Locator' },
    { value: 200, question: 'Which company developed the Android operating system?', answer: 'Google' },
    { value: 300, question: 'What is the name of the first computer virus?', answer: 'Creeper' },
    { value: 400, question: 'What does "HTML" stand for?', answer: 'HyperText Markup Language' },
    { value: 500, question: 'Who co-founded Microsoft with Bill Gates?', answer: 'Paul Allen' },
    { value: 600, question: 'What is the name of the first digital camera?', answer: 'Kodak' }
  ]},
];

function App() {
  const { user, signOut } = useAuthenticator();
  const [gameState, setGameState] = useState('login');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [flippedTiles, setFlippedTiles] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [highScores, setHighScores] = useState([]);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [categoryStats, setCategoryStats] = useState({});
  const [chartInstance, setChartInstance] = useState(null);

  // Fetch high scores from Amplify Data
  useEffect(() => {
    const sub = client.models.HighScore.observeQuery().subscribe({
      next: (data) => {
        const scores = [...data.items].sort((a, b) => (b.score || 0) - (a.score || 0));
        setHighScores(scores);
      },
      error: (error) => console.error("Error fetching high scores:", error),
    });
    return () => sub.unsubscribe();
  }, []);

  // Update chart when category stats change
  useEffect(() => {
    if (gameState === 'dashboard' && categoryStats) {
      const canvas = document.getElementById('category-chart');
      if (canvas) {
        if (chartInstance) {
          chartInstance.destroy();
        }
        const labels = Object.keys(categoryStats);
        const data = Object.values(categoryStats).map((stat) => (stat.total > 0 ? (stat.correct / stat.total) * 100 : 0));
        const newChartInstance = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Correct Answer Percentage',
              data: data,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: 'Percentage Correct',
                  color: 'white'
                },
                ticks: {
                  color: 'white'
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.2)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Category',
                  color: 'white'
                },
                ticks: {
                  color: 'white'
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.2)'
                }
              }
            },
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: 'Correct Answers by Category',
                color: 'white',
                font: {
                  size: 16
                }
              }
            }
          }
        });
        setChartInstance(newChartInstance);
      }
    }
  }, [gameState, categoryStats]);

  const handleLogin = () => {
    setGameState('selectCategories');
  };

  const handleCategorySelect = (category) => {
    if (selectedCategories.length < 4 && !selectedCategories.includes(category)) {
      setSelectedCategories([...selectedCategories, category]);
      setCategoryStats({ ...categoryStats, [category.name]: { correct: 0, total: 0 } });
    }
    if (selectedCategories.length === 3) {
      setGameState('playing');
    }
  };

  const handleTileClick = (categoryName, questionValue) => {
    const tileId = `${categoryName}-${questionValue}`;
    if (flippedTiles.includes(tileId)) return;

    const category = selectedCategories.find(c => c.name === categoryName);
    const question = category.questions.find(q => q.value === questionValue);
    
    setFlippedTiles([...flippedTiles, tileId]);
    setCurrentQuestion({ ...question, category: categoryName });
    setShowModal(true);
  };

  const handleAnswerSubmit = () => {
    const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase();
    
    let newScore = score;
    const value = round === 1 ? currentQuestion.value : currentQuestion.value * 2;
    
    const newStats = { ...categoryStats };
    if (!newStats[currentQuestion.category]) {
      newStats[currentQuestion.category] = { correct: 0, total: 0 };
    }
    newStats[currentQuestion.category].total++;
    
    if (isCorrect) {
      newScore += value;
      setMessage('Correct!');
      newStats[currentQuestion.category].correct++;
    } else {
      newScore -= value;
      setMessage(`Incorrect. The correct answer was "${currentQuestion.answer}".`);
    }

    setScore(newScore);
    setCategoryStats(newStats);
    setUserAnswer('');
    setShowModal(false);
    
    if (flippedTiles.length === 24) {
      handleRoundEnd(newScore);
    }
  };

  const handleRoundEnd = async (finalScore) => {
    if (round === 1) {
      const isQualified = finalScore > 0;
      if (isQualified) {
        setGameState('roundOver');
        setMessage(`You qualified for the next round! Your score is: $${finalScore}`);
        setRound(2);
        setSelectedCategories([]);
        setFlippedTiles([]);
      } else {
        setMessage(`Game Over! You did not qualify for the next round. Your final score is: $${finalScore}`);
        setGameState('gameOver');
      }
    } else if (round === 2) {
      setMessage(`Game Over! You have finished the game. Final score: $${finalScore}`);
      setGameState('gameOver');
      await updateHighScore(finalScore);
    }
  };

  const handlePlayAgain = () => {
    setScore(0);
    setRound(1);
    setSelectedCategories([]);
    setFlippedTiles([]);
    setCategoryStats({});
    setGameState('selectCategories');
  };

  const handleDeleteRecord = async () => {
    if (!user) return;
    try {
      const highscoreRecords = await client.models.HighScore.list({ filter: { userId: { eq: user.userId } } });
      for (const record of highscoreRecords.items) {
        await client.models.HighScore.delete({ id: record.id });
      }
      signOut();
      setMessage("Your records have been deleted.");
    } catch (error) {
      console.error("Error deleting user records:", error);
      setMessage("Failed to delete records.");
    }
  };

  const updateHighScore = async (finalScore) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];

    let totalQuestions = 0;
    let totalCorrect = 0;
    const categoryPercentages = {};

    for (const cat in categoryStats) {
      totalQuestions += categoryStats[cat].total;
      totalCorrect += categoryStats[cat].correct;
      const percentage = (categoryStats[cat].correct / categoryStats[cat].total) * 100 || 0;
      categoryPercentages[cat] = percentage;
    }

    const overallPercentage = (totalCorrect / totalQuestions) * 100 || 0;

    const scoreData = {
      userId: user.userId,
      userName: user.username,
      score: finalScore,
      date: today,
      correctPercentage: overallPercentage,
      categoryStats: JSON.stringify(categoryPercentages),
    };
    
    await client.models.HighScore.create(scoreData);
  };

  const renderGame = () => {
    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-4xl font-bold mb-4">Welcome to Trivia Showdown!</h1>
          <p>Please sign in to start the game.</p>
        </div>
      );
    }

    switch (gameState) {
      case 'selectCategories':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 relative game-background">
             <div className="relative z-10 flex flex-col items-center">
              <h1 className="text-4xl font-bold text-white mb-8 text-center">Round {round}: Select 4 Categories</h1>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {allCategories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleCategorySelect(category)}
                    className={`p-6 rounded-lg text-white font-bold text-xl shadow-lg transition-all duration-300 transform hover:scale-105
                      ${selectedCategories.includes(category) ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}
                      ${selectedCategories.length >= 4 && !selectedCategories.includes(category) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={selectedCategories.length >= 4 && !selectedCategories.includes(category)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'playing':
        return (
          <div className="flex flex-col items-center min-h-screen p-4 relative game-background">
            <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-6 text-white text-2xl font-bold">
                <span>Score: ${score}</span>
                <span>Round {round}</span>
                <span>User: {user?.username}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 w-full">
                {selectedCategories.map((category) => (
                  <div key={category.name} className="flex flex-col items-center">
                    <h2 className="text-xl font-bold text-white mb-2 p-2 bg-purple-700 rounded-md shadow-md">{category.name}</h2>
                    {category.questions.map((q) => (
                      <button
                        key={q.value}
                        onClick={() => handleTileClick(category.name, q.value)}
                        className={`w-full p-4 my-1 rounded-lg text-white font-bold text-lg transition-all duration-300 transform
                          ${flippedTiles.includes(`${category.name}-${q.value}`) ? 'bg-transparent text-gray-400 opacity-50 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-600'}
                          ${flippedTiles.includes(`${category.name}-${q.value}`) ? '' : 'hover:scale-105'}`}
                        disabled={flippedTiles.includes(`${category.name}-${q.value}`)}
                      >
                        ${q.value}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                  <div className="bg-blue-800 text-white p-8 rounded-lg shadow-xl w-full max-w-lg text-center">
                    <h3 className="text-3xl font-bold mb-4">{currentQuestion?.question}</h3>
                    <p className="mb-6 text-lg">You have 12 seconds to answer...</p>
                    <div className="bg-gray-700 h-10 w-full rounded-full flex items-center justify-center mb-4">
                      <div className="bg-red-500 h-8 rounded-full animate-pulse" style={{ width: '50%' }}></div>
                    </div>
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-full p-3 rounded-lg text-black mb-4"
                      placeholder="Type your answer here..."
                    />
                    <button onClick={handleAnswerSubmit} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg">
                      Submit Answer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'roundOver':
      case 'gameOver':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 relative game-background">
            <div className="relative z-10 flex flex-col items-center">
              <h1 className="text-4xl font-bold text-white mb-4 text-center">Game Over</h1>
              <p className="text-xl text-white mb-6 text-center">{message}</p>
              <p className="text-3xl font-bold text-yellow-400 mb-8">Final Score: ${score}</p>
              <div className="flex space-x-4">
                <button onClick={handlePlayAgain} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg">
                  Play Again
                </button>
                <button onClick={() => setGameState('dashboard')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg">
                  View Dashboard
                </button>
              </div>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="flex flex-col items-center min-h-screen p-4 relative game-background">
            <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
              <h1 className="text-4xl font-bold mb-6 text-white">High Scores Dashboard</h1>
              <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg w-full mb-6 text-white">
                <h2 className="text-2xl font-bold mb-4 text-center">Top Players</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="border-b-2 border-gray-600">
                        <th className="px-4 py-2 text-left">Rank</th>
                        <th className="px-4 py-2 text-left">User Name</th>
                        <th className="px-4 py-2 text-left">Score</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Correct %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {highScores.map((score, index) => (
                        <tr key={score.id} className="border-b border-gray-700">
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2">{score.userName}</td>
                          <td className="px-4 py-2">${score.score}</td>
                          <td className="px-4 py-2">{score.date}</td>
                          <td className="px-4 py-2">{score.correctPercentage ? score.correctPercentage.toFixed(0) : 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg w-full mb-6">
                <canvas id="category-chart"></canvas>
              </div>
              <div className="flex space-x-4">
                <button onClick={handlePlayAgain} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg">
                  Play Again
                </button>
                <button onClick={signOut} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg">
                  Logout
                </button>
                <button onClick={handleDeleteRecord} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg">
                  Delete My Record
                </button>
              </div>
              <div className="mt-4 text-sm text-gray-400">
                User ID: {user?.userId}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-screen game-background">
            <h1 className="text-4xl font-bold mb-4 text-white">Welcome to Trivia Showdown!</h1>
            <p className="text-white mb-6">Please sign in to start the game.</p>
          </div>
        );
    }
  };

  return (
    <div className="font-sans">
      {renderGame()}
    </div>
  );
}

export default App;
