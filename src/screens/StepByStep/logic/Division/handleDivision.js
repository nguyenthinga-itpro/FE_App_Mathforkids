export const handleDivision = (n1, n2, steps, setRemember, t) => {
  if (n2 === 0) {
    steps[3].result = "Cannot divide";
    steps[2].subText = "Cannot divide by 0.";
    return;
  }

  const sign = Math.sign(n1) * Math.sign(n2);
  const absN1 = Math.abs(n1);
  const absN2 = Math.abs(n2);

  const dividendStr = absN1.toString();
  const dividend = dividendStr.split("").map(Number);
  let current = 0;
  let quotient = "";
  let stepsDisplay = [];
  let subSteps = [];
  let started = false;
  let firstDividendLength = 0;
  let skipIncrement = false;

  let stepCounter = 1;
  let divisionCount = 0;

  const adjustIndent = (baseIndent) => {
    if (firstDividendLength === 1) return baseIndent - 1;
    if (firstDividendLength === 3) return baseIndent + 1;
    return baseIndent;
  };

  for (let i = 0; i < dividend.length;) {
    if (!skipIncrement) {
      current = current * 10 + dividend[i];
    }
    skipIncrement = false;

    if (!started) {
      if (current < absN2) {
        subSteps.push({
          key: "step_choose_number",
          params: {
            step: stepCounter++,
            current,
            divisor: absN2,
            comparisonKey: "less",
            explanationKey: "less",
            indent: divisionCount,
            visualIndent: divisionCount,
          },
        });

        if (i + 1 < dividend.length) {
          const afterBringDown = current.toString() + dividend[i + 1].toString();
          subSteps.push({
            key: "step_bring_down",
            params: {
              step: stepCounter++,
              nextDigit: dividend[i + 1],
              afterBringDown,
              currentDisplay: afterBringDown,
              indent: divisionCount,
              visualIndent: divisionCount,
            },
          });
        }
        i++;
        continue;
      } else {
        firstDividendLength = current.toString().length;
        subSteps.push({
          key: "step_choose_number",
          params: {
            step: stepCounter++,
            current,
            divisor: absN2,
            comparisonKey: "greater_equal",
            explanationKey: "greater_equal",
            indent: divisionCount,
            visualIndent: adjustIndent(divisionCount),
          },
        });
        started = true;
      }
    }

    const qDigit = Math.floor(current / absN2);
    const sub = qDigit * absN2;
    const remainder = current - sub;

    subSteps.push({
      key: "step_divide",
      params: {
        step: stepCounter++,
        current,
        divisor: absN2,
        result: qDigit,
        indent: divisionCount,
        visualIndent: adjustIndent(divisionCount),
      },
    });

    quotient += qDigit.toString();
    steps[2].quotient = quotient;
    const productLength = sub.toString().length;
    let productIndent = divisionCount;
    if (productLength === 1) productIndent = divisionCount + 1;
    else if (productLength === 3) productIndent = divisionCount - 1;

    subSteps.push({
      key: "step_multiply",
      params: {
        step: stepCounter++,
        result: qDigit,
        divisor: absN2,
        product: sub,
        indent: productIndent,
        visualIndent: adjustIndent(productIndent),
      },
    });

    const remainderIndent = remainder.toString().length === 1 ? divisionCount + 1 : divisionCount;
    subSteps.push({
      key: "step_subtract",
      params: {
        step: stepCounter++,
        current,
        product: sub,
        remainder,
        currentDisplay: remainder,
        indent: remainderIndent,
        visualIndent: adjustIndent(remainderIndent),
      },
    });

    if (i + 1 < dividend.length) {
      const nextDigit = dividend[i + 1];
      const afterBringDown = remainder.toString() + nextDigit.toString();
      const bringDownIndent = remainder.toString().length === 1 ? divisionCount + 1 : divisionCount;

      subSteps.push({
        key: "step_bring_down",
        params: {
          step: stepCounter++,
          nextDigit,
          remainder,
          afterBringDown,
          currentDisplay: afterBringDown,
          indent: bringDownIndent,
          visualIndent: adjustIndent(bringDownIndent),
          explanationKey: "after_subtract",
        },
      });

      let newCurrent = parseInt(afterBringDown, 10);
      subSteps.push({
        key: "step_choose_number",
        params: {
          step: stepCounter++,
          current: newCurrent,
          divisor: absN2,
          comparisonKey: newCurrent < absN2 ? "less" : "greater_equal",
          explanationKey: newCurrent < absN2 ? "less" : "greater_equal",
          indent: bringDownIndent,
          visualIndent: adjustIndent(bringDownIndent),
        },
      });

      if (newCurrent < absN2 && i + 2 < dividend.length) {
        const nextDigit2 = dividend[i + 2];
        const extendedAfterBringDown = afterBringDown + nextDigit2;
        const newCurrentExtended = parseInt(extendedAfterBringDown, 10);

        quotient += 0;
        steps[2].quotient = quotient;

        subSteps.push({
          key: "less_then_bring_down",
          params: {
            step: stepCounter++,
            current: newCurrent,
            divisor: absN2,
            nextDigit: nextDigit2,
            result: parseInt(quotient[quotient.length - 1], 10),
          },
        });


        subSteps.push({
          key: "step_bring_down_extra",
          params: {
            step: stepCounter++,
            nextDigit: nextDigit2,
            remainder: newCurrent,
            afterBringDown: extendedAfterBringDown,
            currentDisplay: extendedAfterBringDown,
            indent: bringDownIndent,
            visualIndent: adjustIndent(bringDownIndent),
            explanationKey: "after_subtract",
          },
        });

        subSteps.push({
          key: "step_choose_number",
          params: {
            step: stepCounter++,
            current: newCurrentExtended,
            divisor: absN2,
            comparisonKey: newCurrentExtended < absN2 ? "less" : "greater_equal",
            explanationKey: newCurrentExtended < absN2 ? "less" : "greater_equal",
            indent: bringDownIndent,
            visualIndent: adjustIndent(bringDownIndent),
          },
        });

        current = newCurrentExtended;
        i += 2;
        skipIncrement = true;
        divisionCount += 2;
        continue;
      } else {
        current = newCurrent;
      }
    }

    stepsDisplay.push({
      part: current.toString(),
      minus: sub.toString(),
      remainder: remainder.toString(),
      quotientDigit: qDigit.toString(),
      position: i,
      indent: divisionCount,
      drawLine: true,
      broughtDown: dividend[i + 1]?.toString(),
      afterBringDown: i + 1 < dividend.length ? remainder.toString() + dividend[i + 1].toString() : undefined,
    });

    current = remainder;
    divisionCount++;
    i++;
  }

  if (!started) {
    stepsDisplay.push({
      part: absN1.toString(),
      minus: "0",
      remainder: absN1.toString(),
      quotientDigit: "0",
      position: 0,
      indent: 0,
      drawLine: false,
    });

    subSteps.push({
      key: "step_cannot_divide",
      params: {
        step: 1,
        dividend: absN1,
        divisor: absN2,
        indent: 0,
        visualIndent: 0,
      },
    });
  }

  const remainder = current;
  const cleanedQuotient = quotient.replace(/^0+/, "") || "0";
  const finalQuotient = sign < 0 ? `-${cleanedQuotient}` : cleanedQuotient;

  console.log("subSteps", JSON.stringify(subSteps, null, 2));

  steps[2].dividend = absN1.toString();
  steps[2].divisor = absN2.toString();
  steps[2].quotient = finalQuotient;
  steps[2].remainder = remainder.toString();
  steps[2].divisionSteps = stepsDisplay;
  steps[2].subSteps = subSteps;
  steps[2].subText = "Step-by-step division (long division)";
  steps[3].result = t("result_with_remainder", {
    quotient: finalQuotient,
    remainder: remainder,
  });

  setRemember(remainder > 0 ? `Remainder ${remainder}` : "");
};