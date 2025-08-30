export const handleNextAddition = ({
  steps,
  columnStepIndex,
  setColumnStepIndex,
  setStepIndex,
}) => {
  const totalSteps = steps[2]?.digitSums?.length || 0;

  if (columnStepIndex < totalSteps) {
    setColumnStepIndex((prev) => prev + 1);
    return;
  }

  if (columnStepIndex === totalSteps) {
    console.log("Đã hiện xong các bước cộng → chuyển bước");
    setStepIndex((prev) => prev + 1);
    return;
  }
};
