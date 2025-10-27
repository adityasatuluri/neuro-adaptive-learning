# Reinforcement Learning System Testing Plan

## Overview
This document outlines the complete testing strategy for the updated reinforcement learning module that now features improved state representation, better rewards, convergence tracking, and adaptive learning.

## Test Scenarios

### Phase 1: Basic Functionality Tests (15-20 minutes)

#### Test 1.1: Initial State & Metrics Load
**Objective**: Verify system initializes correctly with default values

**Steps**:
1. Clear browser localStorage (DevTools > Application > Local Storage > Clear All)
2. Refresh the application
3. Open the Metrics Overlay (click the metrics button)
4. Verify initial values:
   - Episodes: 0
   - Exploration Rate: 30%
   - Average Reward: 0
   - States Explored: 0
   - Convergence: 0%
   - Status: "Learning" (not "Converged")
   - Exploration Level: "High"

**Expected Result**: All metrics start at baseline values, system is in exploration mode

---

#### Test 1.2: First Question Attempt
**Objective**: Verify RL system captures first interaction

**Steps**:
1. Select a topic (e.g., "Arrays")
2. Attempt a question (correct or incorrect)
3. Submit the answer
4. Open Metrics Overlay

**Verify**:
- Episodes: 1
- Exploration Rate: Still ~30% (minimal decay)
- Total Reward: Should be positive if correct (~20-30), negative if incorrect (~-10 to -15)
- Average Reward: Same as Total Reward
- States Explored: 1
- Last Update: Current timestamp

**Expected Result**: System records the interaction and updates metrics

---

### Phase 2: Learning Progression Tests (30-40 minutes)

#### Test 2.1: Consistent Success Pattern
**Objective**: Test how system rewards consistent correct answers

**Steps**:
1. Answer 10 questions correctly in a row on "easy" difficulty
2. After each 3 questions, check Metrics Overlay
3. Observe changes in:
   - Average Reward (should increase)
   - Exploration Rate (should slowly decrease)
   - Performance Trend (should show "Improving")
   - Difficulty adjustment (should suggest upgrade to medium)

**Expected Behavior**:
- Rewards accumulate positively
- System should recommend difficulty upgrade after 5-7 correct answers
- Exploration rate gradually decreases (from 30% toward 20%)
- States Explored increases

**Data to Record**:
| Questions | Avg Reward | Exploration Rate | Convergence | Difficulty |
|-----------|------------|------------------|-------------|------------|
| 0         | 0          | 30%              | 0%          | Easy       |
| 3         | ~25        | 29.8%            | <10%        | Easy       |
| 6         | ~28        | 29.6%            | <15%        | Medium?    |
| 10        | ~30        | 29.4%            | <20%        | Medium     |

---

#### Test 2.2: Inconsistent Performance Pattern
**Objective**: Test reward system with mixed results

**Steps**:
1. Start fresh session (or continue from Test 2.1)
2. Answer questions with pattern: Correct, Correct, Wrong, Correct, Wrong, Wrong, Correct...
3. Complete 15 attempts with ~60% accuracy
4. Monitor metrics every 5 questions

**Expected Behavior**:
- Average Reward: Lower than consistent success (~10-15)
- Exploration Rate: Remains higher (system exploring more)
- Performance Trend: "Stable" or "Declining"
- Convergence Score: Low (<30%)
- Difficulty: Should remain at current level or downgrade

---

#### Test 2.3: Struggling Pattern
**Objective**: Verify system adapts to poor performance

**Steps**:
1. Answer 8-10 questions incorrectly in a row
2. Check metrics after every 3 questions

**Expected Behavior**:
- Average Reward: Negative (-5 to -10)
- Performance Trend: "Declining"
- Difficulty: Should downgrade (from medium to easy, or stay at easy)
- Total Reward: Increasingly negative
- System should select "downgrade" action more frequently

---

### Phase 3: State Representation Tests (20 minutes)

#### Test 3.1: State Differentiation
**Objective**: Verify system creates distinct states for different performance profiles

**Steps**:
1. Open browser console
2. Paste this code to inspect Q-table states:
```javascript
const rl = JSON.parse(localStorage.getItem('rl_metrics'))
console.table(Object.keys(rl.qTable))
```

3. Perform different scenarios:
   - High accuracy, high consistency
   - Low accuracy, low consistency
   - High accuracy, declining velocity
   - Different difficulty levels

**Expected Result**:
- States should include patterns like:
  - `arrays_easy_high_improving_stable_r3`
  - `arrays_medium_med_stable_moderate_r1`
  - `strings_hard_low_declining_unstable_r0`
- More states = better learning granularity
- Target: 10+ unique states after 30 questions

---

### Phase 4: Convergence & Long-term Learning (60+ minutes)

#### Test 4.1: Convergence Testing
**Objective**: Test if system converges after extended use

**Steps**:
1. Complete 100+ questions across multiple topics
2. Check convergence score every 20 questions
3. Monitor exploration rate decay

**Expected Progression**:

| Episodes | Convergence | Exploration | Status      | States |
|----------|-------------|-------------|-------------|--------|
| 20       | <20%        | 28%         | Learning    | 5-8    |
| 50       | 30-40%      | 25%         | Learning    | 15-20  |
| 100      | 50-70%      | 20-22%      | Learning    | 30-40  |
| 150      | 70-80%      | 18-20%      | Converged   | 40-50  |

**Success Criteria**:
- Convergence score reaches 70%+ after 100-150 episodes
- Status changes to "Converged"
- Exploration rate stabilizes around 15-20%
- System makes consistent, good difficulty recommendations

---

#### Test 4.2: Action Selection Quality
**Objective**: Verify RL makes intelligent difficulty adjustments

**Setup**: Complete ~50 questions to train the system

**Test Cases**:

1. **High Performance → Upgrade**
   - Accuracy: 85%+, Consistency: 75%+
   - Expected Action: "upgrade" difficulty
   - Verify: Difficulty increases

2. **Low Performance → Downgrade**
   - Accuracy: <50%, Recent streak: 0/3
   - Expected Action: "downgrade" difficulty
   - Verify: Difficulty decreases

3. **Moderate Performance → Maintain**
   - Accuracy: 65-75%, Consistency: 60%+
   - Expected Action: "maintain" difficulty
   - Verify: Difficulty stays same

4. **Weak Areas → Focus**
   - Low accuracy in specific concepts
   - Expected Action: "focusWeak" or "reviewPrevious"
   - Verify: Questions target weak concepts

---

### Phase 5: Reward Function Validation (30 minutes)

#### Test 5.1: Difficulty Multiplier
**Objective**: Verify higher difficulties give better rewards

**Steps**:
1. Answer question correctly on Easy → Check reward
2. Answer question correctly on Medium → Check reward
3. Answer question correctly on Hard → Check reward

**Console Test**:
```javascript
// Add to console to see reward calculation
const rl = JSON.parse(localStorage.getItem('rl_metrics'))
console.log('Total Reward:', rl.totalReward)
console.log('Episodes:', rl.episodeCount)
console.log('Avg Reward:', rl.averageReward)
```

**Expected Rewards** (correct answers):
- Easy: ~20 base
- Medium: ~30 base (1.5x multiplier)
- Hard: ~40 base (2x multiplier)

---

#### Test 5.2: Time-based Rewards
**Objective**: Test time performance affects rewards

**Steps**:
1. Answer Easy question very quickly (<2 min) → Expect bonus
2. Answer Medium question in normal time (~5 min) → Expect normal reward
3. Answer question very slowly (>15 min) → Expect penalty

---

### Phase 6: Persistence & Recovery Tests (10 minutes)

#### Test 6.1: LocalStorage Persistence
**Steps**:
1. Complete 10 questions
2. Note current metrics (Episodes, Avg Reward, States)
3. Refresh browser
4. Verify all metrics persist correctly

---

#### Test 6.2: State Recovery
**Steps**:
1. Export current RL state:
```javascript
const rl = localStorage.getItem('rl_metrics')
console.log(rl)
// Copy output
```

2. Clear localStorage
3. Import state back:
```javascript
localStorage.setItem('rl_metrics', /* paste copied JSON */)
```

4. Refresh and verify metrics match

---

### Phase 7: Integration Tests (30 minutes)

#### Test 7.1: Profile Integration
**Objective**: Verify RL works with user profile updates

**Steps**:
1. Check user profile accuracy, consistency, velocity
2. Answer questions and observe both:
   - User profile metrics update
   - RL metrics update
   - Both systems stay in sync

---

#### Test 7.2: Adaptive Algorithm Integration
**Objective**: Ensure RL influences difficulty selection

**Steps**:
1. Force specific performance pattern (high accuracy)
2. Complete enough questions to trigger difficulty change
3. Verify `calculateNextDifficultyWithRL` is being called
4. Confirm difficulty changes appropriately

---

## Success Metrics

### Minimum Viable Performance
- ✅ System initializes without errors
- ✅ Metrics update after each question
- ✅ Rewards differentiate between correct/incorrect
- ✅ States are created and Q-values updated
- ✅ Exploration rate decays over time
- ✅ Data persists across sessions

### Good Performance
- ✅ Convergence reaches 50%+ by 100 episodes
- ✅ 20+ unique states explored
- ✅ Performance trend accurately reflects user behavior
- ✅ Difficulty adjustments improve learning pace
- ✅ Average reward trends positive for improving users

### Excellent Performance
- ✅ Convergence reaches 70%+ by 150 episodes
- ✅ 40+ unique states with diverse Q-values
- ✅ Exploration level adapts appropriately
- ✅ System makes consistently good difficulty decisions
- ✅ Users report better learning experience

---

## Debugging Tools

### Inspect Q-Table
```javascript
const rl = JSON.parse(localStorage.getItem('rl_metrics'))
console.log('Q-Table States:', Object.keys(rl.qTable).length)
console.log('Sample States:', Object.keys(rl.qTable).slice(0, 5))
console.log('Q-Values for first state:', rl.qTable[Object.keys(rl.qTable)[0]])
```

### Track Reward Calculation
Add this temporarily to `adaptive-algorithm.ts` after reward calculation:
```typescript
console.log('[RL Debug]', {
  action,
  reward,
  currentState,
  nextState,
  avgReward: rlMetrics.averageReward
})
```

### Monitor Convergence
```javascript
setInterval(() => {
  const rl = JSON.parse(localStorage.getItem('rl_metrics'))
  console.log(`[${new Date().toLocaleTimeString()}] Episodes: ${rl.episodeCount}, Convergence: ${rl.convergenceScore.toFixed(1)}%, Avg Reward: ${rl.averageReward.toFixed(2)}`)
}, 10000) // Every 10 seconds
```

---

## Known Issues to Watch For

1. **NaN in metrics**: Check if Q-value calculations produce invalid numbers
2. **State explosion**: Too many unique states (>100) may indicate over-granular representation
3. **Slow convergence**: If convergence stays <30% after 100 episodes, reward function may need tuning
4. **Exploration stuck high**: Rate not decaying suggests decay function issue
5. **Negative average reward**: System punishing too harshly

---

## Reporting Template

After testing, document results:

```
## Test Results - [Date]

### Environment
- Browser:
- Questions Attempted:
- Duration:

### Metrics Achieved
- Final Episodes:
- Convergence Score:
- States Explored:
- Average Reward:
- Exploration Rate:

### Issues Found
1.
2.

### Recommendations
1.
2.

### Overall Assessment
[ ] Pass - System works as expected
[ ] Partial - Works but needs improvement
[ ] Fail - Critical issues found
```

---

## Next Steps After Testing

1. **If tests pass**: Deploy to production, monitor real user data
2. **If partial pass**: Tune hyperparameters (learning rate, discount factor, reward weights)
3. **If tests fail**: Debug specific issues, adjust state representation or reward function

## Automated Testing (Future)

Consider adding unit tests for:
- `getCurrentState()` - verify state format
- `calculateReward()` - verify reward ranges
- `updateQValue()` - verify Q-learning equation
- `calculateConvergenceScore()` - verify convergence logic
- `selectAction()` - verify exploration/exploitation balance
