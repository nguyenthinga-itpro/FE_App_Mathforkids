export const handleNextSubtraction = ({
  step,
  subStepIndex,
  setSubStepIndex,
  setRevealedResultDigits,
  setStepIndex,
}) => {
  const subSteps = step.subSteps || []; // Danh sách các câu giải thích
  const nextSubStepIndex = subStepIndex + 1;
  // Nếu còn bước giải thích chưa hiển thị
  if (nextSubStepIndex < subSteps.length) {
    setSubStepIndex(nextSubStepIndex);
    // Nếu dòng hiện tại là phép trừ (có dấu =) → tăng số chữ số kết quả đã lộ
    const currentText = subSteps[nextSubStepIndex];
    const isResultLine = currentText?.includes("="); // Dòng giải thích phép trừ
    if (isResultLine) {
      setRevealedResultDigits((prev) => prev + 1);
    }
  } else {
    //Nếu đã hiện hết subSteps → chuyển sang bước tiếp theo (kết luận)
    setStepIndex((prev) => prev + 1);
    setSubStepIndex(0);
  }
  return;
};
