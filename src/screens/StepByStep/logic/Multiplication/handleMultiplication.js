export const handleMultiplication = (n1, n2, steps, setRemember, t) => {
  const str1 = n1.toString();
  const str2 = n2.toString();
  const digits1 = str1.split("").map(Number).reverse();
  const digits2 = str2.split("").map(Number).reverse();
  const partials = [];
  const carryRows = [];
  const verticalCarryRows = [];
  const subSteps = [];
  const subStepsMeta = [];
  const positionLabels = [
    t("place.units"),
    t("place.tens"),
    t("place.hundreds"),
    t("place.thousands"),
    t("place.ten_thousands"),
    t("place.hundred_thousands"),
    t("place.millions"),
  ];
  const numberToText = (n, t) => {
    return t(`multiplication.number_text.${n}`) || n.toString();
  };
  steps[2] = steps[2] || {};
  steps[2].rowSteps = [];
  steps[2].rowIntros = [];
  digits2.forEach((d2, rowIndex) => {
    const labelRow = positionLabels[rowIndex] || `10^${rowIndex}`;
    const columnNumber = rowIndex + 1;
    const rowFromBottom = digits2.length - rowIndex;
    const intro = t("multiplication.step_intro", {
      step: rowIndex + 1,
      label: labelRow,
    });
    subSteps.push(intro);
    subStepsMeta.push({ type: "row_intro", rowIndex });
    steps[2].rowIntros.push(intro);
    if (rowIndex > 0) {
      subSteps.push(t("multiplication.step_zero_rule"));
      subStepsMeta.push({ type: "zero_rule", rowIndex });
      subSteps.push(
        t("multiplication.shift_zero", {
          label: labelRow,
          zeros: numberToText(rowIndex, t),
          column: columnNumber,
          digit: d2,
          rowFromBottom: rowFromBottom + 1,
        })
      );
      subStepsMeta.push({ type: "shift", rowIndex });
    }
    let carry = 0;
    const rowRaw = [];
    const rowFinal = [];
    const carryRow = [];
    digits1.forEach((d1, colIndex) => {
      const product = d1 * d2;
      const sum = product + carry;
      const digitCarry = product % 10;
      const digit = sum % 10;
      const carryNow = Math.floor(product / 10);
      const nextCarry = Math.floor(sum / 10);
      const nextDigit = sum % 10;
      const isLast = digits1.length === 1 || colIndex === digits1.length - 1;
      // console.log(`[DEBUG] carry = ${carry}, isLast = ${isLast}`);
      let explain = "";
      if (colIndex === 0 && nextCarry > 0) {
        // Vị trí đầu tiên, dùng nextCarry
        explain = t("multiplication.step_detail_with_next", {
          d1,
          d2,
          product,
          digit,
          nextCarry,
          carryNow,
        });
      } else if (carry > 0) {
        // Các vị trí khác, nếu có nhớ
        explain = t("multiplication.step_detail_with_carry", {
          d1,
          d2,
          product,
          digit,
          carry,
          carryNow,
          digitCarry,
        });
      } else {
        // Không có gì để nhớ
        explain = t("multiplication.step_detail_no_carry", {
          d1,
          d2,
          product,
          digit,
        });
      }
      subSteps.push(explain);
      subStepsMeta.push({
        type: isLast ? "detail_final_digit" : "detail",
        rowIndex,
        colIndex,
        d1,
        d2,
        product,
        carry,
        carryNow,
        digit,
        nextCarry,
      });
      if (carry > 0) {
        let addCarry;

        if (isLast) {
          addCarry = t("multiplication.step_carry_final_add_last", {
            product,
            carry,
            sum,
            nextDigit,
            nextCarry,
            rowIndex,
            colIndex,
            d2,
            str1,
          });
        } else {
          addCarry = t("multiplication.step_carry_final_add", {
            product,
            carry,
            sum,
            nextDigit,
            nextCarry,
          });
        }
        subSteps.push(addCarry);
        subStepsMeta.push({
          type: "carry_add",
          rowIndex,
          colIndex,
          product,
          carry,
          sum,
          nextDigit,
          nextCarry,
          isLast,
        });
      }
      subSteps.push(
        t("multiplication.reveal_digit", {
          d2,
          d1,
          product: sum,
        })
      );
      subStepsMeta.push({
        type: "reveal_digits",
        rowIndex,
        colIndex,
        carry: nextCarry,
        d2,
        d1,
        product: sum,
        digitsToReveal: isLast ? String(sum).length : 1,
      });
      rowRaw.unshift(product);
      rowFinal.unshift(digit);
      if (!isLast) {
        carryRow.unshift(nextCarry > 0 ? String(nextCarry) : " ");
      } else {
        carryRow.unshift(" ");
      }
      carry = nextCarry;
    });
    if (carry > 0) {
      rowFinal.unshift(carry);
      carryRow.unshift(" ");
    }
    const shiftZeros = Array(rowIndex).fill(0);
    const fullRow = rowFinal.concat(shiftZeros);
    const fullCarry = carryRow.concat(Array(rowIndex).fill(" "));
    partials.push(fullRow.map(String).join(""));
    carryRows.push(fullCarry);
    steps[2].rowSteps.push({
      rowRaw: rowRaw.concat(shiftZeros),
      rowFinal: fullRow,
      carryRow: fullCarry,
    });
  });
  const finalResult = partials.reduce((acc, val) => acc + parseInt(val), 0);
  if (partials.length >= 2) {
    const maxLen = Math.max(...partials.map((p) => p.length));
    const padded = partials.map((p) =>
      p.padStart(maxLen, "0").split("").map(Number)
    );
    // console.log("[DEBUG] Partial Rows After Padding:");
    padded.forEach((row, i) => {
      // console.log(`Row ${i + 1}: ${row.join(" ")}`);
      6;
    });

    let carry = 0;
    for (let col = maxLen - 1; col >= 0; col--) {
      const colDigits = padded.map((row) => row[col]);
      const colSum = colDigits.reduce((a, b) => a + b, 0) + carry;
      const digit = colSum % 10;
      const nextCarry = Math.floor(colSum / 10);
      const label =
        positionLabels[maxLen - 1 - col] || `10^${maxLen - 1 - col}`;
      const isFirstColumn = col === maxLen - 1;
      // 🌟 Lưu carry này vào mảng mới
      verticalCarryRows.push(nextCarry > 0 ? String(nextCarry) : " ");
      // console.log(
      //   `[COLUMN ADD] Cột ${label}: ${colDigits.join(
      //     " + "
      //   )} + ${carry} = ${colSum} → viết ${digit}, nhớ ${nextCarry}`
      // );
      const stepText = t("multiplication.step_add_column", {
        label,
        digits: colDigits.join(" + "),
        carry,
        sum: colSum,
        digit,
        nextCarry,
        finalNote: isFirstColumn ? t("multiplication.first_add_note") : "",
      });
      subSteps.push(stepText);
      subStepsMeta.push({
        type: "vertical_add",
        column: maxLen - 1 - col,
        colDigits,
        carry,
        digit,
        nextCarry,
      });
      carry = nextCarry;
    }
    if (carry > 0) {
      subSteps.push(t("multiplication.step_final_carry", { carry }));
      subStepsMeta.push({ type: "final_carry", carry });
      // Có thể thêm final carry vào đầu mảng verticalCarryRows nếu muốn hiển thị nốt
      verticalCarryRows.unshift(String(carry));
    } else {
      verticalCarryRows.unshift(" ");
    }

    subSteps.push(
      t("multiplication.final_result", {
        expression: partials.join(" + "),
        result: finalResult,
      })
    );
    subStepsMeta.push({ type: "final_result", result: finalResult });
  } else {
    subSteps.push(
      t("multiplication.final_result", {
        expression: partials[0],
        result: finalResult,
      })
    );
    subStepsMeta.push({ type: "final_result", result: finalResult });
  }
  steps[2].digits = str1.split("");
  steps[2].multiplierDigits = str2.split("");
  steps[2].partials = partials;
  steps[2].carryRows = carryRows;
  steps[2].verticalCarryRows = verticalCarryRows;
  // console.log("[DEBUG] carryRows =", JSON.stringify(carryRows));
  steps[2].subSteps = subSteps;
  steps[2].subStepsMeta = subStepsMeta;
  steps[2].positionLabels = Array.from({
    length: finalResult.toString().length,
  }).map(
    (_, i) => positionLabels[finalResult.toString().length - 1 - i] || `10^${i}`
  );
  steps[3] = steps[3] || {};
  steps[3].result = finalResult.toString();
  steps[3].subText = t("multiplication.summary", {
    partials: partials
      .map((p, i) => `${t("multiplication.partial")} ${i + 1}: ${p}`)
      .join("\n"),
    expression: partials.join(" + "),
    result: finalResult,
  });

  if (setRemember) setRemember("");
};
