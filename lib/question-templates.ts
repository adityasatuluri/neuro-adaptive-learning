import type { Question } from "./types"

export const topics: Record<string, { name: string; description: string; subtopics: string[] }> = {
  basics: {
    name: "Python Basics",
    description: "Fundamental Python concepts and syntax",
    subtopics: ["variables", "data-types", "operators", "input-output"],
  },
  "control-flow": {
    name: "Control Flow",
    description: "Conditionals and decision making",
    subtopics: ["if-else", "boolean-logic", "ternary-operators"],
  },
  loops: {
    name: "Loops",
    description: "Iteration and repetition",
    subtopics: ["for-loops", "while-loops", "loop-control", "nested-loops"],
  },
  functions: {
    name: "Functions",
    description: "Function definition and usage",
    subtopics: ["function-basics", "parameters", "return-values", "scope"],
  },
  lists: {
    name: "Lists",
    description: "Working with lists and arrays",
    subtopics: ["list-basics", "list-methods", "list-comprehension", "slicing"],
  },
  dictionaries: {
    name: "Dictionaries",
    description: "Key-value data structures",
    subtopics: ["dict-basics", "dict-methods", "nested-dicts"],
  },
  strings: {
    name: "Strings",
    description: "String manipulation and formatting",
    subtopics: ["string-basics", "string-methods", "formatting", "regex-intro"],
  },
  "file-io": {
    name: "File I/O",
    description: "Reading and writing files",
    subtopics: ["file-reading", "file-writing", "file-modes"],
  },
  oop: {
    name: "Object-Oriented Programming",
    description: "Classes, objects, and inheritance",
    subtopics: ["classes", "inheritance", "polymorphism", "encapsulation"],
  },
  "error-handling": {
    name: "Error Handling",
    description: "Exception handling and debugging",
    subtopics: ["try-except", "custom-exceptions", "debugging"],
  },
}

export const questionTemplates: Question[] = [
  // Basics - Variables and Data Types
  {
    id: "q1-basics-variables",
    topic: "basics",
    subtopic: "variables",
    difficulty: "easy",
    type: "code-writing",
    title: "Create and Assign Variables",
    description: "Create three variables: name (string), age (integer), and height (float). Assign appropriate values.",
    starterCode: `# Create and assign variables
name = 
age = 
height = `,
    testCases: [{ input: "none", expectedOutput: "Variables created successfully" }],
    expectedOutput: "Three variables with correct types",
    hints: ["Use quotes for strings", "Use integers for age", "Use decimals for height"],
    estimatedTime: 60,
    tags: ["variables", "assignment"],
  },
  {
    id: "q2-basics-arithmetic",
    topic: "basics",
    subtopic: "operators",
    difficulty: "easy",
    type: "code-writing",
    title: "Basic Arithmetic Operations",
    description:
      "Write a function that performs basic arithmetic: addition, subtraction, multiplication, and division.",
    starterCode: `def arithmetic_ops(a, b):
    # Return a tuple with (add, subtract, multiply, divide)
    pass`,
    testCases: [
      { input: "10, 5", expectedOutput: "(15, 5, 50, 2.0)" },
      { input: "20, 4", expectedOutput: "(24, 16, 80, 5.0)" },
    ],
    expectedOutput: "Tuple with four arithmetic results",
    hints: ["Use +, -, *, / operators", "Return as tuple"],
    estimatedTime: 90,
    tags: ["operators", "arithmetic"],
  },
  {
    id: "q3-basics-type-conversion",
    topic: "basics",
    subtopic: "data-types",
    difficulty: "easy",
    type: "code-writing",
    title: "Type Conversion",
    description: "Convert a string number to integer, float, and back to string.",
    starterCode: `def convert_types(num_str):
    # Convert string to int, float, and back to string
    pass`,
    testCases: [
      { input: '"42"', expectedOutput: '(42, 42.0, "42")' },
      { input: '"100"', expectedOutput: '(100, 100.0, "100")' },
    ],
    expectedOutput: "Tuple with int, float, and string",
    hints: ["Use int(), float(), str() functions"],
    estimatedTime: 75,
    tags: ["type-conversion", "data-types"],
  },

  // Control Flow - If/Else
  {
    id: "q4-control-if-else",
    topic: "control-flow",
    subtopic: "if-else",
    difficulty: "easy",
    type: "code-writing",
    title: "Simple If-Else Statement",
    description: "Write a function that returns 'positive', 'negative', or 'zero' based on input.",
    starterCode: `def check_number(n):
    # Return 'positive', 'negative', or 'zero'
    pass`,
    testCases: [
      { input: "5", expectedOutput: "positive" },
      { input: "-3", expectedOutput: "negative" },
      { input: "0", expectedOutput: "zero" },
    ],
    expectedOutput: "Correct classification of numbers",
    hints: ["Use if-elif-else", "Compare with 0"],
    estimatedTime: 90,
    tags: ["if-else", "conditionals"],
  },
  {
    id: "q5-control-grade",
    topic: "control-flow",
    subtopic: "if-else",
    difficulty: "medium",
    type: "code-writing",
    title: "Grade Calculator",
    description: "Convert a score (0-100) to a letter grade (A, B, C, D, F).",
    starterCode: `def get_grade(score):
    # A: 90-100, B: 80-89, C: 70-79, D: 60-69, F: <60
    pass`,
    testCases: [
      { input: "95", expectedOutput: "A" },
      { input: "85", expectedOutput: "B" },
      { input: "75", expectedOutput: "C" },
      { input: "65", expectedOutput: "D" },
      { input: "55", expectedOutput: "F" },
    ],
    expectedOutput: "Correct letter grade",
    hints: ["Use multiple if-elif statements", "Check ranges"],
    estimatedTime: 120,
    tags: ["if-else", "ranges"],
  },
  {
    id: "q6-control-leap-year",
    topic: "control-flow",
    subtopic: "boolean-logic",
    difficulty: "medium",
    type: "code-writing",
    title: "Leap Year Checker",
    description:
      "Determine if a year is a leap year. Leap years are divisible by 4, except for years divisible by 100 (unless also divisible by 400).",
    starterCode: `def is_leap_year(year):
    # Check if year is a leap year
    pass`,
    testCases: [
      { input: "2020", expectedOutput: "True" },
      { input: "2000", expectedOutput: "True" },
      { input: "1900", expectedOutput: "False" },
      { input: "2021", expectedOutput: "False" },
    ],
    expectedOutput: "Correct leap year determination",
    hints: ["Check divisibility with %", "Use and/or operators"],
    estimatedTime: 120,
    tags: ["boolean-logic", "conditionals"],
  },

  // Loops - For and While
  {
    id: "q7-loops-sum-range",
    topic: "loops",
    subtopic: "for-loops",
    difficulty: "easy",
    type: "code-writing",
    title: "Sum of Range",
    description: "Write a function that returns the sum of numbers from 1 to n.",
    starterCode: `def sum_range(n):
    # Return sum of 1 to n
    pass`,
    testCases: [
      { input: "5", expectedOutput: "15" },
      { input: "10", expectedOutput: "55" },
      { input: "1", expectedOutput: "1" },
    ],
    expectedOutput: "Correct sum of range",
    hints: ["Use a for loop", "Or use the formula n*(n+1)/2"],
    estimatedTime: 90,
    tags: ["for-loops", "iteration"],
  },
  {
    id: "q8-loops-multiplication-table",
    topic: "loops",
    subtopic: "for-loops",
    difficulty: "easy",
    type: "code-writing",
    title: "Multiplication Table",
    description: "Generate a multiplication table for a given number (1-10).",
    starterCode: `def multiplication_table(n):
    # Return list of n*1, n*2, ..., n*10
    pass`,
    testCases: [
      { input: "5", expectedOutput: "[5, 10, 15, 20, 25, 30, 35, 40, 45, 50]" },
      { input: "3", expectedOutput: "[3, 6, 9, 12, 15, 18, 21, 24, 27, 30]" },
    ],
    expectedOutput: "List with multiplication results",
    hints: ["Use a for loop with range(1, 11)", "Append to a list"],
    estimatedTime: 100,
    tags: ["for-loops", "lists"],
  },
  {
    id: "q9-loops-factorial",
    topic: "loops",
    subtopic: "for-loops",
    difficulty: "medium",
    type: "code-writing",
    title: "Calculate Factorial",
    description: "Write a function that calculates the factorial of a number.",
    starterCode: `def factorial(n):
    # Return n!
    pass`,
    testCases: [
      { input: "5", expectedOutput: "120" },
      { input: "0", expectedOutput: "1" },
      { input: "3", expectedOutput: "6" },
    ],
    expectedOutput: "Correct factorial value",
    hints: ["Use a loop to multiply", "Handle base case (0! = 1)"],
    estimatedTime: 100,
    tags: ["for-loops", "recursion"],
  },
  {
    id: "q10-loops-fibonacci",
    topic: "loops",
    subtopic: "for-loops",
    difficulty: "hard",
    type: "code-writing",
    title: "Fibonacci Sequence",
    description: "Generate the first n numbers in the Fibonacci sequence.",
    starterCode: `def fibonacci(n):
    # Return list of first n Fibonacci numbers
    pass`,
    testCases: [
      { input: "5", expectedOutput: "[0, 1, 1, 2, 3]" },
      { input: "8", expectedOutput: "[0, 1, 1, 2, 3, 5, 8, 13]" },
    ],
    expectedOutput: "Correct Fibonacci sequence",
    hints: ["Start with 0 and 1", "Each number is sum of previous two"],
    estimatedTime: 150,
    tags: ["for-loops", "sequences"],
  },
  {
    id: "q11-loops-while-countdown",
    topic: "loops",
    subtopic: "while-loops",
    difficulty: "easy",
    type: "code-writing",
    title: "Countdown with While Loop",
    description: "Write a function that counts down from n to 1 using a while loop.",
    starterCode: `def countdown(n):
    # Return list counting down from n to 1
    pass`,
    testCases: [
      { input: "5", expectedOutput: "[5, 4, 3, 2, 1]" },
      { input: "3", expectedOutput: "[3, 2, 1]" },
    ],
    expectedOutput: "List counting down",
    hints: ["Use while loop with condition", "Decrement n each iteration"],
    estimatedTime: 90,
    tags: ["while-loops", "iteration"],
  },

  // Functions
  {
    id: "q12-functions-greet",
    topic: "functions",
    subtopic: "function-basics",
    difficulty: "easy",
    type: "code-writing",
    title: "Simple Greeting Function",
    description: "Write a function that takes a name and returns a greeting message.",
    starterCode: `def greet(name):
    # Return greeting message
    pass`,
    testCases: [
      { input: '"Alice"', expectedOutput: '"Hello, Alice!"' },
      { input: '"Bob"', expectedOutput: '"Hello, Bob!"' },
    ],
    expectedOutput: "Greeting message with name",
    hints: ["Use string concatenation or f-strings"],
    estimatedTime: 60,
    tags: ["functions", "strings"],
  },
  {
    id: "q13-functions-max-three",
    topic: "functions",
    subtopic: "parameters",
    difficulty: "easy",
    type: "code-writing",
    title: "Find Maximum of Three Numbers",
    description: "Write a function that returns the maximum of three numbers.",
    starterCode: `def max_three(a, b, c):
    # Return the maximum value
    pass`,
    testCases: [
      { input: "3, 7, 5", expectedOutput: "7" },
      { input: "10, 2, 8", expectedOutput: "10" },
    ],
    expectedOutput: "Maximum value",
    hints: ["Use if-elif-else or max() function"],
    estimatedTime: 90,
    tags: ["functions", "conditionals"],
  },
  {
    id: "q14-functions-is-prime",
    topic: "functions",
    subtopic: "function-basics",
    difficulty: "hard",
    type: "code-writing",
    title: "Prime Number Checker",
    description: "Write a function that checks if a number is prime.",
    starterCode: `def is_prime(n):
    # Return True if prime, False otherwise
    pass`,
    testCases: [
      { input: "7", expectedOutput: "True" },
      { input: "10", expectedOutput: "False" },
      { input: "2", expectedOutput: "True" },
      { input: "1", expectedOutput: "False" },
    ],
    expectedOutput: "Correct prime determination",
    hints: ["Check divisibility from 2 to sqrt(n)", "Handle edge cases"],
    estimatedTime: 150,
    tags: ["functions", "math"],
  },
  {
    id: "q15-functions-power",
    topic: "functions",
    subtopic: "parameters",
    difficulty: "medium",
    type: "code-writing",
    title: "Power Function",
    description: "Write a function that calculates x raised to the power of n.",
    starterCode: `def power(x, n):
    # Return x^n
    pass`,
    testCases: [
      { input: "2, 3", expectedOutput: "8" },
      { input: "5, 2", expectedOutput: "25" },
      { input: "10, 0", expectedOutput: "1" },
    ],
    expectedOutput: "Correct power calculation",
    hints: ["Use ** operator or loop", "Handle n=0 case"],
    estimatedTime: 100,
    tags: ["functions", "math"],
  },

  // Lists
  {
    id: "q16-lists-reverse",
    topic: "lists",
    subtopic: "list-basics",
    difficulty: "easy",
    type: "code-writing",
    title: "Reverse a List",
    description: "Write a function that reverses a list.",
    starterCode: `def reverse_list(lst):
    # Return reversed list
    pass`,
    testCases: [
      { input: "[1, 2, 3, 4]", expectedOutput: "[4, 3, 2, 1]" },
      { input: '["a", "b", "c"]', expectedOutput: '["c", "b", "a"]' },
    ],
    expectedOutput: "Reversed list",
    hints: ["Use slicing [::-1] or reverse() method"],
    estimatedTime: 75,
    tags: ["lists", "slicing"],
  },
  {
    id: "q17-lists-sum",
    topic: "lists",
    subtopic: "list-basics",
    difficulty: "easy",
    type: "code-writing",
    title: "Sum of List Elements",
    description: "Write a function that returns the sum of all elements in a list.",
    starterCode: `def sum_list(lst):
    # Return sum of all elements
    pass`,
    testCases: [
      { input: "[1, 2, 3, 4]", expectedOutput: "10" },
      { input: "[10, 20, 30]", expectedOutput: "60" },
      { input: "[]", expectedOutput: "0" },
    ],
    expectedOutput: "Sum of elements",
    hints: ["Use sum() function or loop"],
    estimatedTime: 75,
    tags: ["lists", "iteration"],
  },
  {
    id: "q18-lists-filter-even",
    topic: "lists",
    subtopic: "list-comprehension",
    difficulty: "medium",
    type: "code-writing",
    title: "Filter Even Numbers",
    description: "Write a function that returns only even numbers from a list.",
    starterCode: `def filter_even(lst):
    # Return list of even numbers
    pass`,
    testCases: [
      { input: "[1, 2, 3, 4, 5, 6]", expectedOutput: "[2, 4, 6]" },
      { input: "[10, 15, 20, 25]", expectedOutput: "[10, 20]" },
    ],
    expectedOutput: "List with even numbers only",
    hints: ["Use list comprehension or filter()", "Check n % 2 == 0"],
    estimatedTime: 100,
    tags: ["lists", "list-comprehension"],
  },
  {
    id: "q19-lists-find-max",
    topic: "lists",
    subtopic: "list-basics",
    difficulty: "medium",
    type: "code-writing",
    title: "Find Maximum in List",
    description: "Write a function that finds the maximum value in a list without using max().",
    starterCode: `def find_max(lst):
    # Return maximum value
    pass`,
    testCases: [
      { input: "[3, 7, 2, 9, 1]", expectedOutput: "9" },
      { input: "[10, 5, 20, 15]", expectedOutput: "20" },
    ],
    expectedOutput: "Maximum value",
    hints: ["Use a loop to compare", "Track the maximum"],
    estimatedTime: 100,
    tags: ["lists", "iteration"],
  },
  {
    id: "q20-lists-remove-duplicates",
    topic: "lists",
    subtopic: "list-methods",
    difficulty: "medium",
    type: "code-writing",
    title: "Remove Duplicates",
    description: "Write a function that removes duplicate elements from a list.",
    starterCode: `def remove_duplicates(lst):
    # Return list without duplicates
    pass`,
    testCases: [
      { input: "[1, 2, 2, 3, 3, 3, 4]", expectedOutput: "[1, 2, 3, 4]" },
      { input: '["a", "b", "a", "c"]', expectedOutput: '["a", "b", "c"]' },
    ],
    expectedOutput: "List without duplicates",
    hints: ["Use set() or loop with checking"],
    estimatedTime: 100,
    tags: ["lists", "sets"],
  },

  // Strings
  {
    id: "q21-strings-reverse",
    topic: "strings",
    subtopic: "string-basics",
    difficulty: "easy",
    type: "code-writing",
    title: "Reverse a String",
    description: "Write a function that reverses a string.",
    starterCode: `def reverse_string(s):
    # Return reversed string
    pass`,
    testCases: [
      { input: '"hello"', expectedOutput: '"olleh"' },
      { input: '"python"', expectedOutput: '"nohtyp"' },
    ],
    expectedOutput: "Reversed string",
    hints: ["Use slicing [::-1]"],
    estimatedTime: 60,
    tags: ["strings", "slicing"],
  },
  {
    id: "q22-strings-palindrome",
    topic: "strings",
    subtopic: "string-basics",
    difficulty: "medium",
    type: "code-writing",
    title: "Check Palindrome",
    description: "Write a function that checks if a string is a palindrome.",
    starterCode: `def is_palindrome(s):
    # Return True if palindrome, False otherwise
    pass`,
    testCases: [
      { input: '"racecar"', expectedOutput: "True" },
      { input: '"hello"', expectedOutput: "False" },
      { input: '"a"', expectedOutput: "True" },
    ],
    expectedOutput: "Correct palindrome check",
    hints: ["Compare string with reverse", "Handle case sensitivity"],
    estimatedTime: 100,
    tags: ["strings", "comparison"],
  },
  {
    id: "q23-strings-count-vowels",
    topic: "strings",
    subtopic: "string-methods",
    difficulty: "easy",
    type: "code-writing",
    title: "Count Vowels",
    description: "Write a function that counts the number of vowels in a string.",
    starterCode: `def count_vowels(s):
    # Return count of vowels
    pass`,
    testCases: [
      { input: '"hello"', expectedOutput: "2" },
      { input: '"python"', expectedOutput: "1" },
      { input: '"aeiou"', expectedOutput: "5" },
    ],
    expectedOutput: "Count of vowels",
    hints: ["Define vowels as 'aeiouAEIOU'", "Loop through string"],
    estimatedTime: 90,
    tags: ["strings", "iteration"],
  },
  {
    id: "q24-strings-capitalize",
    topic: "strings",
    subtopic: "string-methods",
    difficulty: "easy",
    type: "code-writing",
    title: "Capitalize Words",
    description: "Write a function that capitalizes the first letter of each word.",
    starterCode: `def capitalize_words(s):
    # Return string with capitalized words
    pass`,
    testCases: [
      { input: '"hello world"', expectedOutput: '"Hello World"' },
      { input: '"python programming"', expectedOutput: '"Python Programming"' },
    ],
    expectedOutput: "Capitalized words",
    hints: ["Use title() method or split/join"],
    estimatedTime: 90,
    tags: ["strings", "formatting"],
  },

  // Dictionaries
  {
    id: "q25-dicts-create",
    topic: "dictionaries",
    subtopic: "dict-basics",
    difficulty: "easy",
    type: "code-writing",
    title: "Create and Access Dictionary",
    description: "Create a dictionary with student names and grades, then return a specific grade.",
    starterCode: `def get_grade(students, name):
    # Return grade for given student name
    pass`,
    testCases: [
      { input: '{"Alice": 90, "Bob": 85}, "Alice"', expectedOutput: "90" },
      { input: '{"Alice": 90, "Bob": 85}, "Bob"', expectedOutput: "85" },
    ],
    expectedOutput: "Correct grade value",
    hints: ["Use dictionary access with []"],
    estimatedTime: 75,
    tags: ["dictionaries", "access"],
  },
  {
    id: "q26-dicts-count-words",
    topic: "dictionaries",
    subtopic: "dict-basics",
    difficulty: "medium",
    type: "code-writing",
    title: "Count Word Frequency",
    description: "Write a function that counts the frequency of each word in a string.",
    starterCode: `def count_words(text):
    # Return dictionary with word frequencies
    pass`,
    testCases: [
      { input: '"hello world hello"', expectedOutput: '{"hello": 2, "world": 1}' },
      { input: '"a b a c a"', expectedOutput: '{"a": 3, "b": 1, "c": 1}' },
    ],
    expectedOutput: "Dictionary with word counts",
    hints: ["Split string into words", "Use dictionary to track counts"],
    estimatedTime: 120,
    tags: ["dictionaries", "iteration"],
  },

  // Error Handling
  {
    id: "q27-error-divide",
    topic: "error-handling",
    subtopic: "try-except",
    difficulty: "medium",
    type: "code-writing",
    title: "Safe Division",
    description: "Write a function that divides two numbers safely, handling division by zero.",
    starterCode: `def safe_divide(a, b):
    # Return result or error message
    pass`,
    testCases: [
      { input: "10, 2", expectedOutput: "5.0" },
      { input: "10, 0", expectedOutput: '"Error: Division by zero"' },
    ],
    expectedOutput: "Result or error message",
    hints: ["Use try-except block", "Catch ZeroDivisionError"],
    estimatedTime: 100,
    tags: ["error-handling", "exceptions"],
  },

  // OOP
  {
    id: "q28-oop-class",
    topic: "oop",
    subtopic: "classes",
    difficulty: "medium",
    type: "code-writing",
    title: "Create a Simple Class",
    description: "Create a Person class with name and age attributes, and a method to get info.",
    starterCode: `class Person:
    def __init__(self, name, age):
        # Initialize attributes
        pass
    
    def get_info(self):
        # Return info string
        pass`,
    testCases: [{ input: 'Person("Alice", 30).get_info()', expectedOutput: '"Alice is 30 years old"' }],
    expectedOutput: "Person info string",
    hints: ["Use __init__ for initialization", "Use self for attributes"],
    estimatedTime: 120,
    tags: ["oop", "classes"],
  },

  // Debugging Questions
  {
    id: "q29-debug-off-by-one",
    topic: "loops",
    subtopic: "loop-control",
    difficulty: "medium",
    type: "debugging",
    title: "Fix Off-by-One Error",
    description: "Fix the code that should sum numbers from 1 to n but has an off-by-one error.",
    starterCode: `def sum_to_n(n):
    total = 0
    for i in range(n):  # Bug: should be range(n+1)
        total += i
    return total`,
    testCases: [
      { input: "5", expectedOutput: "15" },
      { input: "10", expectedOutput: "55" },
    ],
    expectedOutput: "Correct sum",
    hints: ["Check the range", "Should include n"],
    estimatedTime: 100,
    tags: ["debugging", "loops"],
  },
  {
    id: "q30-debug-logic",
    topic: "control-flow",
    subtopic: "if-else",
    difficulty: "medium",
    type: "debugging",
    title: "Fix Logic Error",
    description: "Fix the code that should check if a number is even but has a logic error.",
    starterCode: `def is_even(n):
    if n % 2 = 0:  # Bug: should be ==
        return True
    return False`,
    testCases: [
      { input: "4", expectedOutput: "True" },
      { input: "7", expectedOutput: "False" },
    ],
    expectedOutput: "Correct even check",
    hints: ["Check comparison operator", "Should use =="],
    estimatedTime: 75,
    tags: ["debugging", "operators"],
  },

  // Output Prediction
  {
    id: "q31-output-loop",
    topic: "loops",
    subtopic: "for-loops",
    difficulty: "easy",
    type: "output-prediction",
    title: "Predict Loop Output",
    description: "What will this code output?",
    starterCode: `for i in range(3):
    print(i * 2)`,
    testCases: [{ input: "none", expectedOutput: "0\\n2\\n4" }],
    expectedOutput: "0, 2, 4 on separate lines",
    hints: ["Trace through loop iterations"],
    estimatedTime: 60,
    tags: ["loops", "output"],
  },
  {
    id: "q32-output-string",
    topic: "strings",
    subtopic: "string-basics",
    difficulty: "easy",
    type: "output-prediction",
    title: "Predict String Output",
    description: "What will this code output?",
    starterCode: `s = "hello"
print(s[1:4])`,
    testCases: [{ input: "none", expectedOutput: '"ell"' }],
    expectedOutput: "ell",
    hints: ["Remember string indexing starts at 0"],
    estimatedTime: 60,
    tags: ["strings", "slicing"],
  },

  // Code Completion
  {
    id: "q33-completion-even-filter",
    topic: "lists",
    subtopic: "list-comprehension",
    difficulty: "medium",
    type: "code-completion",
    title: "Complete Even Filter",
    description: "Complete the list comprehension to filter even numbers.",
    starterCode: `def filter_even(lst):
    return [x for x in lst if ___]`,
    testCases: [{ input: "[1, 2, 3, 4, 5, 6]", expectedOutput: "[2, 4, 6]" }],
    expectedOutput: "List with even numbers",
    hints: ["Check if x is divisible by 2"],
    estimatedTime: 75,
    tags: ["lists", "comprehension"],
  },
  {
    id: "q34-completion-square",
    topic: "lists",
    subtopic: "list-comprehension",
    difficulty: "easy",
    type: "code-completion",
    title: "Complete Square List",
    description: "Complete the list comprehension to create squares.",
    starterCode: `def squares(n):
    return [___ for i in range(n)]`,
    testCases: [{ input: "5", expectedOutput: "[0, 1, 4, 9, 16]" }],
    expectedOutput: "List of squares",
    hints: ["Square each number i"],
    estimatedTime: 60,
    tags: ["lists", "comprehension"],
  },

  // Additional Hard Problems
  {
    id: "q35-hard-gcd",
    topic: "functions",
    subtopic: "function-basics",
    difficulty: "hard",
    type: "code-writing",
    title: "Greatest Common Divisor",
    description: "Write a function to find the GCD of two numbers using Euclidean algorithm.",
    starterCode: `def gcd(a, b):
    # Return greatest common divisor
    pass`,
    testCases: [
      { input: "48, 18", expectedOutput: "6" },
      { input: "100, 50", expectedOutput: "50" },
    ],
    expectedOutput: "Correct GCD",
    hints: ["Use Euclidean algorithm", "While b != 0: a, b = b, a % b"],
    estimatedTime: 150,
    tags: ["functions", "math"],
  },
  {
    id: "q36-hard-anagram",
    topic: "strings",
    subtopic: "string-methods",
    difficulty: "hard",
    type: "code-writing",
    title: "Check Anagram",
    description: "Write a function that checks if two strings are anagrams.",
    starterCode: `def is_anagram(s1, s2):
    # Return True if anagrams, False otherwise
    pass`,
    testCases: [
      { input: '"listen", "silent"', expectedOutput: "True" },
      { input: '"hello", "world"', expectedOutput: "False" },
    ],
    expectedOutput: "Correct anagram check",
    hints: ["Sort characters in both strings", "Compare sorted versions"],
    estimatedTime: 120,
    tags: ["strings", "comparison"],
  },
  {
    id: "q37-hard-merge-sorted",
    topic: "lists",
    subtopic: "list-basics",
    difficulty: "hard",
    type: "code-writing",
    title: "Merge Sorted Lists",
    description: "Write a function that merges two sorted lists into one sorted list.",
    starterCode: `def merge_sorted(lst1, lst2):
    # Return merged sorted list
    pass`,
    testCases: [
      { input: "[1, 3, 5], [2, 4, 6]", expectedOutput: "[1, 2, 3, 4, 5, 6]" },
      { input: "[1, 2], [3, 4]", expectedOutput: "[1, 2, 3, 4]" },
    ],
    expectedOutput: "Merged sorted list",
    hints: ["Use two pointers", "Compare and merge"],
    estimatedTime: 150,
    tags: ["lists", "sorting"],
  },
  {
    id: "q38-hard-matrix-transpose",
    topic: "lists",
    subtopic: "list-comprehension",
    difficulty: "hard",
    type: "code-writing",
    title: "Transpose Matrix",
    description: "Write a function that transposes a 2D matrix.",
    starterCode: `def transpose(matrix):
    # Return transposed matrix
    pass`,
    testCases: [{ input: "[[1, 2, 3], [4, 5, 6]]", expectedOutput: "[[1, 4], [2, 5], [3, 6]]" }],
    expectedOutput: "Transposed matrix",
    hints: ["Use zip() or list comprehension"],
    estimatedTime: 150,
    tags: ["lists", "matrices"],
  },
  {
    id: "q39-hard-longest-substring",
    topic: "strings",
    subtopic: "string-methods",
    difficulty: "hard",
    type: "code-writing",
    title: "Longest Substring Without Repeating",
    description: "Find the longest substring without repeating characters.",
    starterCode: `def longest_substring(s):
    # Return length of longest substring
    pass`,
    testCases: [
      { input: '"abcabcbb"', expectedOutput: "3" },
      { input: '"bbbbb"', expectedOutput: "1" },
      { input: '"pwwkew"', expectedOutput: "3" },
    ],
    expectedOutput: "Length of longest substring",
    hints: ["Use sliding window", "Track character positions"],
    estimatedTime: 180,
    tags: ["strings", "algorithms"],
  },
  {
    id: "q40-hard-binary-search",
    topic: "lists",
    subtopic: "list-basics",
    difficulty: "hard",
    type: "code-writing",
    title: "Binary Search",
    description: "Implement binary search on a sorted list.",
    starterCode: `def binary_search(lst, target):
    # Return index of target or -1 if not found
    pass`,
    testCases: [
      { input: "[1, 3, 5, 7, 9], 5", expectedOutput: "2" },
      { input: "[1, 3, 5, 7, 9], 6", expectedOutput: "-1" },
    ],
    expectedOutput: "Index of target",
    hints: ["Use left and right pointers", "Divide search space in half"],
    estimatedTime: 150,
    tags: ["lists", "algorithms"],
  },
]

export const predefinedLearningPaths = [
  {
    id: "path-beginner",
    name: "Python Fundamentals",
    description: "Master the basics of Python programming",
    topics: ["basics", "control-flow", "loops"],
    isCustom: false,
    estimatedHours: 8,
  },
  {
    id: "path-intermediate",
    name: "Data Structures & Functions",
    description: "Learn about lists, dictionaries, and functions",
    topics: ["functions", "lists", "dictionaries", "strings"],
    isCustom: false,
    estimatedHours: 12,
  },
  {
    id: "path-advanced",
    name: "Advanced Python",
    description: "Explore OOP, file I/O, and error handling",
    topics: ["oop", "file-io", "error-handling"],
    isCustom: false,
    estimatedHours: 10,
  },
  {
    id: "path-complete",
    name: "Complete Python Mastery",
    description: "Comprehensive Python learning path",
    topics: [
      "basics",
      "control-flow",
      "loops",
      "functions",
      "lists",
      "dictionaries",
      "strings",
      "oop",
      "error-handling",
    ],
    isCustom: false,
    estimatedHours: 30,
  },
]
