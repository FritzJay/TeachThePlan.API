import * as math from 'mathjs';

const MAX_NUMBER = 12;

/* CREATE */
export const createQuestions = async (operator, number, questions, randomQuestions) => {
  let formattedQuestions = [];

  const numberOfStandardQuestions = questions - randomQuestions;

  while (formattedQuestions.length < numberOfStandardQuestions) {
    const secondNumber = formattedQuestions.length % MAX_NUMBER;
    const formattedQuestion = createFormattedQuestion(operator, number, secondNumber);
    formattedQuestions.push(formattedQuestion);
  }

  while (formattedQuestions.length < questions) {
    const randomNumberBetweenZeroAndNumber = (Math.random() * (number + 1) | 0);
    const randomNumberBetweenZeroAndMax = (Math.random() * (MAX_NUMBER + 1) | 0);
    formattedQuestions.push(createFormattedQuestion(operator, randomNumberBetweenZeroAndNumber, randomNumberBetweenZeroAndMax));
  }

  return formattedQuestions;
}

const createFormattedQuestion = (operator, firstNumber, secondNumber) => {
  const numbers = [firstNumber, secondNumber];

  if (operator === '/' && !numbers.includes(0)) {
    numbers[1] = secondNumber * firstNumber;
  }

  const shufflingWontResultInFractionsOrNegatives = !['-', '/'].includes(operator);
  if (shufflingWontResultInFractionsOrNegatives) {
    numbers.sort(() => Math.random() - 0.5);
  } else {
    numbers.sort((a, b) => b - a);
  }
  
  return {
    question: `${numbers[0]} ${operator} ${numbers[1]}`,
  }
}

/* GRADE */
export const gradeQuestion = async ({ start, end, studentAnswer, question }) => {
  const correctAnswer = math.eval(question);
  return {
    start,
    end,
    studentAnswer,
    correctAnswer: isNaN(correctAnswer) || correctAnswer === Infinity
      ? 0
      : correctAnswer
  };
}

export const createTestResults = async (questions, needed) => {
  const total = questions.length
  const correct = questions.filter((q) => isCorrect(q));
  const incorrectId = getRandomIncorrectlyAnsweredQuestion(questions);
  const quickestId = getQuickestAnsweredQuestion(correct);
  return { total, needed, correct: correct.length, incorrectId, quickestId };
}

const getRandomIncorrectlyAnsweredQuestion = (questions) => {
  const incorrectlyAnsweredQuestions = questions.filter((q) => !isCorrect(q));
  if (incorrectlyAnsweredQuestions.length > 0) {
    return getRandomQuestionId(incorrectlyAnsweredQuestions);
  } else {
    return undefined;
  }
}

const getRandomQuestionId = (questions) => {
  const answeredQuestions = questions.filter((q) => !isSkipped(q));
  if (answeredQuestions.length > 0) {
    return answeredQuestions[Math.floor(Math.random() * answeredQuestions.length)].id;
  } else {
    return questions[Math.floor(Math.random() * questions.length)].id;
  }
}

const getQuickestAnsweredQuestion = (questions) => {
  if (questions.length !== 0) {
    const quickest = questions.reduce((a, b) => {
      const aDuration = a.end - a.start;
      const bDuration = b.end - b.start;
      return aDuration < bDuration ? a : b;
    });
    return quickest.id;
  }
}

const isCorrect = (question) => {
  if (isSkipped(question)) {
    return false;
  }
  return question.correctAnswer.toString() === question.studentAnswer.toString();
}

const isSkipped = (question) => {
  return question.studentAnswer === undefined || question.studentAnswer === null;
}