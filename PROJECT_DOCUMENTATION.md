# Neuro Adaptive Learning Platform
## Project Overview & Technical Documentation

### Executive Summary

**Neuro Adaptive Learning** is an intelligent Python coding education platform that personalizes the learning experience for each student through adaptive difficulty progression and spaced repetition algorithms. The system dynamically adjusts question difficulty based on student performance, generates AI-powered coding challenges, and tracks comprehensive learning analytics to optimize skill development.

---

## Core Features

### 1. **Adaptive Difficulty System**
The platform implements a sophisticated algorithm that adjusts question difficulty based on:
- **Success Rate**: Questions are escalated when accuracy reaches ≥85% with fast completion times
- **Time Performance**: Average completion time influences difficulty progression
- **Regression Logic**: Difficulty decreases if accuracy drops below 60%, ensuring students aren't overwhelmed

**Algorithm Logic:**
- Easy → Medium: 85%+ accuracy AND <5 min average time
- Medium → Hard: 85%+ accuracy AND <10 min average time  
- Hard → Medium: <60% accuracy (automatic regression)

### 2. **Spaced Repetition Learning**
Implements evidence-based learning science through:
- **Review Intervals**: Questions are scheduled for review at 1, 3, 7, 14, and 30-day intervals
- **Mastery Tracking**: System tracks review count and automatically schedules next review dates
- **Prioritized Queue**: Due-for-review questions are prioritized before new questions

### 3. **AI-Powered Question Generation**
Integrates with Groq API (LLaMA 3.1 8B) to generate unique coding challenges:
- **Difficulty-Aware Prompting**: Separate prompts for easy/medium/hard questions
- **Structured Output**: Generated questions include title, description, starter code, test cases, and hints
- **Robust JSON Parsing**: Handles various JSON formatting issues from LLM responses
- **Caching System**: Generated questions are cached and reused efficiently

### 4. **Learning Path System**
Students can select from predefined learning paths:
- **Structured Progression**: Each path contains sequential topics (e.g., Basics → Functions → Data Structures)
- **Topic Mastery Tracking**: Individual mastery scores (0-100) for each topic
- **Flexible Navigation**: Students can switch paths while maintaining progress history

### 5. **Comprehensive Analytics**
Real-time tracking of:
- **Overall Stats**: Total questions attempted, accuracy percentage, current difficulty level
- **Topic Mastery**: Per-topic accuracy, average time, and mastery level
- **Streak Tracking**: Consecutive days of activity
- **Performance Trends**: Historical data for progress visualization

---

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: React hooks + localStorage for persistence
- **Code Editor**: Custom CodeEditor component with syntax highlighting

### Backend & AI Integration
- **Server Actions**: Next.js server actions for secure API calls
- **AI Provider**: Groq API (LLaMA 3.1 8B model)
- **JSON Validation**: Zod schema validation for generated questions
- **Error Handling**: Robust parsing with fallback mechanisms

### Data Persistence
- **Client Storage**: localStorage for user profiles and progress history
- **Data Structure**: TypeScript interfaces for type safety
  - `UserProfile`: Tracks difficulty, stats, progress history, learning path
  - `Question`: Stores problem details, test cases, hints
  - `UserProgress`: Records individual attempt data with timestamps

### Key Algorithms

**Difficulty Calculation** (`calculateNextDifficulty`):
\`\`\`
1. Analyze last 10 attempts
2. Calculate success rate and average time
3. Apply difficulty transition rules
4. Return new difficulty level
\`\`\`

**Question Selection** (`selectNextQuestion`):
\`\`\`
1. Check for questions due for spaced repetition review
2. If none due, select random new question at current difficulty
3. Fallback to any untried question from current topic
\`\`\`

**Profile Update** (`updateUserProfile`):
\`\`\`
1. Record attempt in progress history
2. Update topic-specific statistics
3. Calculate new difficulty level
4. Update streak and activity tracking
5. Schedule next review date for spaced repetition
\`\`\`

---

## User Experience Flow

1. **Initialization**: User loads platform → system creates/loads profile from localStorage
2. **Question Display**: System selects next question based on adaptive algorithm
3. **Code Submission**: Student writes Python code in editor and submits
4. **Evaluation**: System validates code (basic checks) and provides feedback
5. **Progression**: On success, difficulty adjusts and next question loads; on failure, student retries
6. **Analytics**: Dashboard shows real-time progress, mastery levels, and learning statistics

---

## Key Technical Achievements

✓ **Robust AI Integration**: Handles JSON parsing edge cases from LLM responses  
✓ **Spaced Repetition**: Evidence-based learning science implementation  
✓ **Adaptive Algorithms**: Dynamic difficulty progression based on performance metrics  
✓ **Type Safety**: Full TypeScript implementation with Zod validation  
✓ **Scalable Architecture**: Modular components and reusable algorithms  
✓ **Offline-First**: localStorage persistence enables offline functionality  

---

## Future Enhancement Opportunities

- Real-time code execution with test case validation
- OAuth authentication for multi-device sync
- Leaderboards and peer comparison
- Advanced analytics dashboard with learning curve visualization
- Mobile app with offline support
- Collaborative learning features
- Integration with popular coding platforms (LeetCode, HackerRank)

---

## Conclusion

Neuro Adaptive Learning demonstrates a sophisticated approach to personalized education technology, combining adaptive algorithms, AI-powered content generation, and evidence-based learning science. The system successfully balances challenge and support to optimize student learning outcomes while maintaining engagement through progressive difficulty and achievement tracking.
