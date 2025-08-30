export const handleSubtraction = (n1, n2, steps, setRemember, t) => {
  const strA = n1
    .toString()
    .padStart(Math.max(n1.toString().length, n2.toString().length), "0");
  const strB = n2.toString().padStart(strA.length, "0");
  const digitsA = strA.split("").reverse();
  const digitsB = strB.split("").reverse();
  let resultDigits = [];
  let borrowFlags = [];
  let payBackFlags = [];
  let subSteps = [];
  let subStepsMeta = [];
  let subStepsType = [];
  const labelMap = [
    t("place.units"),
    t("place.tens"),
    t("place.hundreds"),
    t("place.thousands"),
    t("place.ten_thousands"),
    t("place.hundred_thousands"),
    t("place.millions"),
    t("place.ten_millions"),
    t("place.hundred_millions"),
    t("place.billions"),
  ];
  subSteps.push(t("subtraction.step_intro"));
  subStepsMeta.push(-1);
  subStepsType.push("intro");
  let borrow = 0;
  for (let i = 0; i < digitsA.length; i++) {
    const originalDigitA = parseInt(digitsA[i]);
    const digitB = parseInt(digitsB[i]);
    const adjustedB = digitB + borrow;
    let adjustedA = originalDigitA;
    const payBack = borrow > 0;
    payBackFlags.push(payBack);
    if (adjustedA < adjustedB) {
      adjustedA += 10;
      borrow = 1;
      borrowFlags.push(true);
      const borrowExplain1 = t("subtraction.step_borrow_1", {
        step: i + 1,
        label: labelMap[i] || `10^${i}`,
        a: originalDigitA,
        b: adjustedB,
        adjustedA,
      });
      subSteps.push(borrowExplain1);
      subStepsMeta.push(i);
      subStepsType.push("borrow_1");
      let borrowExplain2 = t("subtraction.step_borrow_2", {
        adjustedA,
        adjustedB,
        result: adjustedA - adjustedB,
      });
      if (payBack) {
        borrowExplain2 +=
          " " +
          t("subtraction.step_payback", {
            label: labelMap[i] || `10^${i}`,
            b: digitB,
          });
      }
      subSteps.push(borrowExplain2);
      subStepsMeta.push(i);
      subStepsType.push("borrow_2");
      resultDigits.push(adjustedA - adjustedB);
    } else {
      borrow = 0;
      borrowFlags.push(false);
      let stepText;
      if (payBack) {
        stepText = t("subtraction.step_normal_with_payback", {
          step: i + 1,
          label: labelMap[i] || `10^${i}`,
          a: originalDigitA,
          b: adjustedB,
          result: adjustedA - adjustedB,
        });
      } else {
        stepText = t("subtraction.step_normal", {
          step: i + 1,
          label: labelMap[i] || `10^${i}`,
          a: originalDigitA,
          b: digitB,
          result: adjustedA - adjustedB,
        });
      }
      if (payBack) {
        stepText +=
          " " +
          t("subtraction.step_payback", {
            label: labelMap[i] || `10^${i}`,
            b: digitB,
          });
      }
      subSteps.push(stepText);
      subStepsMeta.push(i);
      subStepsType.push("normal");
      resultDigits.push(adjustedA - adjustedB);
    }
  }
  const finalResult =
    resultDigits.slice().reverse().join("").replace(/^0+/, "") || "0";
  steps[2].digits1 = [...digitsA].reverse();
  steps[2].digits2 = [...digitsB].reverse();
  steps[2].resultDigits = [...resultDigits].reverse();
  steps[2].borrowFlags = [...borrowFlags].reverse();
  steps[2].payBackFlags = [...payBackFlags].reverse();
  steps[2].subSteps = subSteps;
  steps[2].subStepsMeta = subStepsMeta;
  steps[2].subStepsType = subStepsType;
  steps[2].subText = subSteps.join("\n");

  steps[3].result = finalResult;
  steps[3].subText = t("subtraction.final_result", {
    number1: n1,
    number2: n2,
    result: finalResult,
  });

  setRemember?.(
    borrowFlags.includes(true) ? t("subtraction.remember_borrowing") : ""
  );
};
