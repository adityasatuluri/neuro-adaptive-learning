// Python coding question templates

import type { Question } from "./types"

export const questionTemplates: Question[] = [
  {
    id: "q1-basics-sum",
    topic: "Basics",
    difficulty: "easy",
    title: "Sum of Two Numbers",
    description: "Write a function that returns the sum of two numbers.",
    starterCode: `def sum_numbers(a, b):
    # Write your code here
    pass`,
    testCases: [
      { input: "2, 3", expectedOutput: "5" },
      { input: "10, 20", expectedOutput: "30" },
      { input: "-5, 5", expectedOutput: "0" },
    ],
    expectedOutput: "Function returns correct sum",
    hints: ["Use the + operator", "Return the result"],
  },
  {
    id: "q2-basics-even",
    topic: "Basics",
    difficulty: "easy",
    title: "Check if Even",
    description: "Write a function that checks if a number is even.",
    starterCode: `def is_even(n):
    # Write your code here
    pass`,
    testCases: [
      { input: "4", expectedOutput: "True" },
      { input: "7", expectedOutput: "False" },
      { input: "0", expectedOutput: "True" },
    ],
    expectedOutput: "Function returns True for even, False for odd",
    hints: ["Use the modulo operator %", "Check if n % 2 == 0"],
  },
  {
    id: "q3-loops-factorial",
    topic: "Loops",
    difficulty: "medium",
    title: "Calculate Factorial",
    description: "Write a function that calculates the factorial of a number.",
    starterCode: `def factorial(n):
    # Write your code here
    pass`,
    testCases: [
      { input: "5", expectedOutput: "120" },
      { input: "0", expectedOutput: "1" },
      { input: "3", expectedOutput: "6" },
    ],
    expectedOutput: "Function returns correct factorial",
    hints: ["Use a loop to multiply numbers", "Handle the base case (0! = 1)"],
  },
  {
    id: "q4-loops-reverse",
    topic: "Loops",
    difficulty: "medium",
    title: "Reverse a String",
    description: "Write a function that reverses a string.",
    starterCode: `def reverse_string(s):
    # Write your code here
    pass`,
    testCases: [
      { input: '"hello"', expectedOutput: '"olleh"' },
      { input: '"python"', expectedOutput: '"nohtyp"' },
    ],
    expectedOutput: "Function returns reversed string",
    hints: ["Use string slicing with [::-1]", "Or use a loop to build reversed string"],
  },
  {
    id: "q5-functions-palindrome",
    topic: "Functions",
    difficulty: "hard",
    title: "Check Palindrome",
    description: "Write a function that checks if a string is a palindrome.",
    starterCode: `def is_palindrome(s):
    # Write your code here
    pass`,
    testCases: [
      { input: '"racecar"', expectedOutput: "True" },
      { input: '"hello"', expectedOutput: "False" },
      { input: '"a"', expectedOutput: "True" },
    ],
    expectedOutput: "Function correctly identifies palindromes",
    hints: ["Remove spaces and convert to lowercase", "Compare string with its reverse"],
  },
  {
    id: "q6-lists-sum-list",
    topic: "Lists",
    difficulty: "hard",
    title: "Sum of List Elements",
    description: "Write a function that returns the sum of all elements in a list.",
    starterCode: `def sum_list(lst):
    # Write your code here
    pass`,
    testCases: [
      { input: "[1, 2, 3, 4]", expectedOutput: "10" },
      { input: "[10, 20, 30]", expectedOutput: "60" },
      { input: "[]", expectedOutput: "0" },
    ],
    expectedOutput: "Function returns correct sum",
    hints: ["Use a loop to iterate through the list", "Or use the built-in sum() function"],
  },
]

export const predefinedLearningPaths = [
  {
    id: "path-beginner",
    name: "Python Fundamentals",
    description: "Start with the basics of Python programming",
    topics: ["Basics", "Loops", "Functions"],
    isCustom: false,
  },
  {
    id: "path-intermediate",
    name: "Data Structures",
    description: "Learn about lists, dictionaries, and more",
    topics: ["Lists", "Dictionaries", "Functions"],
    isCustom: false,
  },
]
