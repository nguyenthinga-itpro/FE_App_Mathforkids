import { handleStepZero } from "./handleStepZero";
import * as Speech from "expo-speech";
import { handleNextAddition } from "./Addition/handleNextAddition";
import { handleNextSubtraction } from "./Subtraction/handleNextSubtraction";
import { handleNextMultiplication } from "./Multiplication/handleNextMultiplication";
import { handleNextDivision } from "./Division/handleNextDivision";
import { handleBackSubtraction } from "./Subtraction/handleBackSubtraction";
import { handleBackMultiplication } from "./Multiplication/handleBackMultiplication";
import { handleBackAddition } from "./Addition/handleBackAddition";
import { handleBackDivision } from "./Division/handleBackDivision";
export const handleNext = ({
  stepIndex,
  setStepIndex,
  subStepIndex,
  setSubStepIndex,
  setRevealedResultDigits,
  setRevealedDigits,
  setSteps,
  setCurrentRowIndex,
  steps,
  number1,
  number2,
  operator,
  t,
  setRemember,
  setVisibleDigitsMap,
  setVisibleCarryMap,
  visibleCarryMap,
  setColumnStepIndex,
  columnStepIndex,
}) => {
  Speech.stop();
  const step = steps[stepIndex];

  if (stepIndex === 0) {
    handleStepZero({
      number1,
      number2,
      operator,
      steps,
      setRemember,
      setStepIndex,
      setSteps,
      stepIndex,
      t,
    });
    return;
  }

  if (operator === "+" && stepIndex === 2) {
    return handleNextAddition({
      stepIndex,
      steps,
      setStepIndex,
      columnStepIndex,
      setColumnStepIndex,
    });
  }

  if (operator === "-" && stepIndex === 2) {
    return handleNextSubtraction({
      subStepIndex,
      setSubStepIndex,
      setRevealedResultDigits,
      step,
      setStepIndex,
    });
  }

  if (operator === "×" && stepIndex === 2) {
    return handleNextMultiplication({
      step,
      steps,
      setSteps,
      subStepIndex,
      setSubStepIndex,
      setStepIndex,
      setRevealedDigits,
      setVisibleCarryMap,
      visibleCarryMap,
      setCurrentRowIndex,
      setRevealedResultDigits,
      setVisibleDigitsMap,
    });
  }

  if (operator === "÷" && stepIndex === 2) {
    return handleNextDivision({
      steps,
      columnStepIndex,
      subStepIndex,
      setColumnStepIndex,
      setSubStepIndex,
      setStepIndex,
    });
  }

  if (stepIndex < steps.length - 1) {
    setStepIndex((prev) => prev + 1);
    setSubStepIndex(0);
  }
};

export const handleBack = ({
  stepIndex,
  setStepIndex,
  subStepIndex,
  setSubStepIndex,
  setRevealedDigits,
  setRevealedResultDigits,
  setCurrentRowIndex,
  setVisibleDigitsMap,
  setVisibleCarryMap,
  setSteps,
  steps,
  operator,
  columnStepIndex,
  setColumnStepIndex,
}) => {
  Speech.stop();
  if (operator === "-" && stepIndex === 2) {
    const handled = handleBackSubtraction({
      subStepIndex,
      setSubStepIndex,
      setRevealedResultDigits,
      steps,
    });
    if (handled) return;
  }

  if (operator === "×" && stepIndex === 2) {
    const handled = handleBackMultiplication({
      stepIndex,
      subStepIndex,
      setSubStepIndex,
      setRevealedDigits,
      setRevealedResultDigits,
      setCurrentRowIndex,
      setVisibleDigitsMap,
      setVisibleCarryMap,
      setSteps,
      steps,
    });
    if (handled) return;
  }

  if (operator === "+" && stepIndex === 2) {
    const handled = handleBackAddition({
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
    });
    if (handled) return;
  }

  if (operator === "÷" && stepIndex === 2) {
    const handled = handleBackDivision({
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
    });
    if (handled) return;
  }
  if (stepIndex > 0) {
    const prevStep = steps[stepIndex - 1];
    const lastSubStep = prevStep?.subSteps?.length || 1;
    setStepIndex((prev) => prev - 1);
    setSubStepIndex(lastSubStep - 1);
  }
};
