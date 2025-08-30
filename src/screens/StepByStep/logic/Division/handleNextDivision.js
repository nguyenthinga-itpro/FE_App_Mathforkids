export const handleNextDivision = ({
  steps,
  columnStepIndex,
  setColumnStepIndex,
  setSubStepIndex,
  setStepIndex,
}) => {
  const totalSteps = steps[2]?.subSteps?.length || 0;
  if (columnStepIndex < totalSteps - 1) {
    console.log("Hiện thêm 1 bước chia");
    setColumnStepIndex((prev) => prev + 1);
    setSubStepIndex((prev) => prev + 1);
    return;
  }
  setStepIndex((prev) => prev + 1);
  setSubStepIndex(0);
};
