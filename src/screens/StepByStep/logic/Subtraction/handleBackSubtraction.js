export const handleBackSubtraction = ({
  subStepIndex,
  setSubStepIndex,
  setRevealedResultDigits,
  steps,
}) => {
  if (subStepIndex <= 0) return false;
  const currentType = steps[2]?.subStepsType?.[subStepIndex];
  const currentCol = steps[2]?.subStepsMeta?.[subStepIndex];
  const prevCol = steps[2]?.subStepsMeta?.[subStepIndex - 1];
  let decrease = 0;
  if (currentType === "borrow_2") {
    decrease = 1;
  }
  if (currentType === "normal" && currentCol !== prevCol) {
    decrease = 1;
  }
  const newSubStepIndex = subStepIndex - 1;
  setSubStepIndex(newSubStepIndex);
  setRevealedResultDigits((prev) => Math.max(0, prev - decrease));
  return true;
};
