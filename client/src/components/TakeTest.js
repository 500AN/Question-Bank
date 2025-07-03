// ... existing code ...
  useEffect(() => {
    if (attemptData && attemptData.mockTest) {
      // Convert duration from minutes to seconds
      const durationInSeconds = attemptData.mockTest.durationMinutes * 60;
      setTimeLeft(durationInSeconds);
      
      // Convert server answers array to client object format
      if (attemptData.answers && Array.isArray(attemptData.answers)) {
        const answersObj = {};
        attemptData.answers.forEach(answer => {
          answersObj[answer.questionId] = answer.selectedOption;
        });
        setAnswers(answersObj);
      }
    }
  }, [attemptData]);
// ... existing code ...