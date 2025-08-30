export const handleBackAddition = ({
  subStepIndex,
  setSubStepIndex,
  stepIndex,
  setStepIndex,
  steps,
  setRevealedDigits,
  setRevealedResultDigits,
  setCurrentRowIndex,
  operator,
  columnStepIndex,
  setColumnStepIndex,
}) => {
  if (operator === "+" && stepIndex === 2) {
    if (columnStepIndex > 0) {
      setColumnStepIndex((prev) => prev - 1);
      return true;
    }
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
      return true;
    }
  }

  if (subStepIndex > 0) {
    setSubStepIndex((prev) => prev - 1);
    return true;
  }

  if (stepIndex > 0) {
    const prevStep = steps[stepIndex - 1];
    const lastSubStep = prevStep?.subSteps?.length || 0;

    setStepIndex((prev) => prev - 1);
    setSubStepIndex(Math.max(0, lastSubStep - 1));
    setRevealedDigits(0);
    setRevealedResultDigits(0);
    setCurrentRowIndex(0);
    return true;
  }

  return false;
};
