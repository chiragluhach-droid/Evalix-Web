import React from 'react';
import AuthScreen from './authscreen.js';
import HostDashboard from './HostDashboard.js';
import CreateExamScreen from './CreateExamScreen.js';
import StudentExamTaking from './StudentExamTaking.js';
import StudentResponsesViewer from './StudentResponsesViewer.js';
import LiveTracking from './LiveTracking.js';
import { useToast } from './ToastContext.js';
import API_BASE_URL from './apiConfig.js';

const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  }

  #root {
    width: 100%;
    height: 100%;
  }
`;


function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [currentScreen, setCurrentScreen] = React.useState('dashboard'); // 'dashboard', 'createExam', or 'responses'
  const [editingExamId, setEditingExamId] = React.useState(null);
  const [editingExam, setEditingExam] = React.useState(null);
  const [viewingExam, setViewingExam] = React.useState(null);
  
  const { showToast } = useToast();

  // Check if user is already logged in on mount
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error parsing saved user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentScreen('dashboard');
  };

  const handleExitExam = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleCreateExam = () => {
    setEditingExamId(null);
    setEditingExam(null);
    setCurrentScreen('createExam');
  };

  const handleEditExam = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEditingExamId(examId);
        setEditingExam(data.exam);
        setCurrentScreen('createExam');
      }
    } catch (error) {
      console.error('Error fetching exam:', error);
      showToast('Failed to load exam', 'error');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
    setEditingExamId(null);
    setEditingExam(null);
    setViewingExam(null);
  };

  const handleViewResponses = (exam) => {
    setViewingExam(exam);
    setCurrentScreen('responses');
  };

  if (loading) {
    return React.createElement(React.Fragment, null,
      React.createElement('style', null, globalStyles),
      React.createElement('div', { className: 'loading' },
        React.createElement('p', null, 'Loading...')
      )
    );
  }

  return React.createElement(React.Fragment, null,
    React.createElement('style', null, globalStyles),
    React.createElement('div', { className: 'app' },
      isAuthenticated && user
        ? (user.isStudent
            ? React.createElement(StudentExamTaking, {
                exam: user.exam,
                studentName: user.studentName,
                studentEmail: user.studentEmail,
                examCode: user.exam?.examCode,
                onExit: handleExitExam,
                isResuming: user.isResuming,
                existingAttempt: user.existingAttempt
              })
            : (currentScreen === 'responses'
                ? React.createElement(StudentResponsesViewer, {
                    exam: viewingExam,
                    examId: viewingExam?.id,
                    onBack: handleBackToDashboard
                  })
                : (currentScreen === 'live-tracking'
                    ? React.createElement(LiveTracking, {
                        exam: viewingExam,
                        examId: viewingExam?.id,
                        onBack: handleBackToDashboard
                      })
                    : (currentScreen === 'createExam'
                        ? React.createElement(CreateExamScreen, {
                            examId: editingExamId,
                            initialExam: editingExam,
                            user: user,
                            onBack: handleBackToDashboard
                          })
                        : React.createElement(HostDashboard, {
                            user: user,
                            onLogout: handleLogout,
                            onCreateExam: handleCreateExam,
                            onEditExam: handleEditExam,
                            onViewResponses: handleViewResponses,
                            onLiveTracking: (exam) => {
                              setViewingExam(exam);
                              setCurrentScreen('live-tracking');
                            }
                          })
                      )
                  )
              )
          )
        : React.createElement(AuthScreen, {
            onAuthSuccess: handleAuthSuccess
          })
    )
  );
}

export default App;
