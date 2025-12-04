import React from 'react';
import { useNavigate } from 'react-router-dom';
import './community.css';

export function Community() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    starterCode: '# Write your code here\n',
    hints: '',
    testCases: [{ input: '', expectedOutput: '', description: '' }]
  });
  const [communityChallenge, setCommunityChallenge] = React.useState([]);
  const [submitStatus, setSubmitStatus] = React.useState('');

  // Load community challenges on mount
  React.useEffect(() => {
    loadCommunityChallenges();
  }, []);

  async function loadCommunityChallenges() {
    try {
      const response = await fetch('/api/community-challenges');
      if (response.ok) {
        const data = await response.json();
        setCommunityChallenge(data);
      }
    } catch (error) {
      console.error('Failed to load community challenges:', error);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleTestCaseChange(index, field, value) {
    const newTestCases = [...formData.testCases];
    newTestCases[index][field] = value;
    setFormData(prev => ({ ...prev, testCases: newTestCases }));
  }

  function addTestCase() {
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', description: '' }]
    }));
  }

  function removeTestCase(index) {
    if (formData.testCases.length > 1) {
      const newTestCases = formData.testCases.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, testCases: newTestCases }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitStatus('Submitting...');

    try {
      // Parse hints into array
      const hintsArray = formData.hints
        .split('\n')
        .map(h => h.trim())
        .filter(h => h.length > 0);

      const challengeData = {
        ...formData,
        hints: hintsArray,
        testCases: formData.testCases.filter(tc => tc.expectedOutput.trim().length > 0)
      };

      const response = await fetch('/api/community-challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(challengeData)
      });

      if (response.ok) {
        setSubmitStatus('✅ Challenge submitted successfully!');
        setFormData({
          title: '',
          description: '',
          difficulty: 'beginner',
          starterCode: '# Write your code here\n',
          hints: '',
          testCases: [{ input: '', expectedOutput: '', description: '' }]
        });
        setShowForm(false);
        loadCommunityChallenges();
      } else if (response.status === 401) {
        setSubmitStatus('❌ Please login to submit challenges');
      } else {
        setSubmitStatus('❌ Failed to submit challenge');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('❌ Network error');
    }

    setTimeout(() => setSubmitStatus(''), 3000);
  }

  return (
    <main className="community-main">
      <h2>Community Challenges</h2>
      <p className="community-intro">Share your own Python challenges and try ones created by others!</p>

      <button 
        className="editor-run-btn create-challenge-btn" 
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancel' : '+ Create Challenge'}
      </button>

      {submitStatus && <div className="submit-status">{submitStatus}</div>}

      {showForm && (
        <form className="challenge-form" onSubmit={handleSubmit}>
          <h3>Create a Challenge</h3>

          <div className="form-group">
            <label htmlFor="title">Challenge Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="e.g., Fibonacci Sequence"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="3"
              placeholder="Describe what the user needs to accomplish..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="starterCode">Starter Code (optional)</label>
            <textarea
              id="starterCode"
              name="starterCode"
              value={formData.starterCode}
              onChange={handleInputChange}
              rows="4"
              placeholder="# Write your code here"
            />
          </div>

          <div className="form-group">
            <label htmlFor="hints">Hints (one per line, optional)</label>
            <textarea
              id="hints"
              name="hints"
              value={formData.hints}
              onChange={handleInputChange}
              rows="3"
              placeholder="Hint 1&#10;Hint 2&#10;Hint 3"
            />
          </div>

          <div className="test-cases-section">
            <h4>Test Cases *</h4>
            {formData.testCases.map((testCase, index) => (
              <div key={index} className="test-case-form">
                <h5>Test Case {index + 1}</h5>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={testCase.description}
                    onChange={(e) => handleTestCaseChange(index, 'description', e.target.value)}
                    placeholder="e.g., Should return first 5 numbers"
                  />
                </div>
                <div className="form-group">
                  <label>Input (if any)</label>
                  <textarea
                    value={testCase.input}
                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                    rows="2"
                    placeholder="Input data (leave empty if none)"
                  />
                </div>
                <div className="form-group">
                  <label>Expected Output *</label>
                  <textarea
                    value={testCase.expectedOutput}
                    onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                    rows="2"
                    required
                    placeholder="Expected output (must match exactly)"
                  />
                </div>
                {formData.testCases.length > 1 && (
                  <button
                    type="button"
                    className="remove-test-btn"
                    onClick={() => removeTestCase(index)}
                  >
                    Remove Test Case
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="add-test-btn" onClick={addTestCase}>
              + Add Test Case
            </button>
          </div>

          <button type="submit" className="editor-run-btn submit-challenge-btn">
            Submit Challenge
          </button>
        </form>
      )}

      <div className="community-challenges">
        <h3>Browse Community Challenges</h3>
        {communityChallenge.length === 0 ? (
          <p className="no-challenges">No community challenges yet. Be the first to create one!</p>
        ) : (
          <div className="challenge-grid">
            {communityChallenge.map((challenge) => (
              <div key={challenge._id} className="challenge-card">
                <div className="challenge-header">
                  <h4>{challenge.title}</h4>
                  <span className={`difficulty-badge ${challenge.difficulty}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <p className="challenge-description">{challenge.description}</p>
                <div className="challenge-meta">
                  <span>By: {challenge.author}</span>
                  <span>{challenge.testCases?.length || 0} test cases</span>
                </div>
                <button 
                  className="try-challenge-btn editor-run-btn"
                  onClick={() => navigate('/editor')}
                >
                  Try Challenge
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}