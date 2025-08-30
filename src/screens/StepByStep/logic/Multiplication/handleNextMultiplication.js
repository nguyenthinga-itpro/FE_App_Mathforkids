function padLeft(arr, targetLength, padChar = " ") {
  const safeTargetLength =
    typeof targetLength === "number" && targetLength >= 0
      ? targetLength
      : arr.length;
  const padLength = Math.max(0, safeTargetLength - arr.length);
  const padding = Array(padLength).fill(padChar);
  return [...padding, ...arr];
}

export const handleNextMultiplication = ({
  step,
  steps,
  subStepIndex,
  setSubStepIndex,
  setRevealedDigits,
  setCurrentRowIndex,
  setSteps,
  setVisibleDigitsMap,
  setVisibleCarryMap,
  setStepIndex,
  setRevealedResultDigits,
  visibleCarryMap,
}) => {
  const subSteps = Array.isArray(step.subSteps) ? step.subSteps : [];
  const subStepsMeta = Array.isArray(step.subStepsMeta)
    ? step.subStepsMeta
    : [];
  const nextSubStepIndex = subStepIndex + 1;
  const nextMeta = subStepsMeta[nextSubStepIndex];

  if (nextSubStepIndex >= subSteps.length) {
    setStepIndex((prev) => prev + 1);
    setSubStepIndex(0);
    return;
  }

  setSubStepIndex(nextSubStepIndex);

  switch (nextMeta?.type) {
    case "intro":
    case "row_intro":
      setCurrentRowIndex(nextMeta.rowIndex);
      setRevealedDigits(-1);
      break;

    case "detail": {
      const sum = nextMeta.product + (nextMeta.carry || 0);
      const sumStr = sum.toString();
      const digit = sumStr[sumStr.length - 1];
      const { rowIndex, colIndex } = nextMeta;
      const shift = rowIndex;
      const updateIdx =
        steps[2].partials[rowIndex].length - 1 - (colIndex + shift);

      const updatedSteps = [...steps];
      const partial = updatedSteps[2].partials[rowIndex].split("");
      if (updateIdx >= 0) {
        partial[updateIdx] = digit;
        updatedSteps[2].partials[rowIndex] = partial.join("");
        setSteps(updatedSteps);
      }

      setRevealedDigits((prev) => prev + 1);

      break;
    }

    case "detail_final_digit": {
      const digitsToReveal = String(nextMeta.product).length;
      setRevealedDigits((prev) => prev + digitsToReveal);
      break;
    }

    case "carry_add": {
      const updatedSteps = [...steps];
      const { rowIndex, colIndex, carry, sum, product } = nextMeta;
      const partial = updatedSteps[2].partials[rowIndex];
      const chars = partial.split("");
      const shift = rowIndex;
      const idxFromRight = colIndex + shift;
      const updateIdx = chars.length - 1 - idxFromRight;

      const isFinalCarryAdd =
        typeof sum === "number" && typeof product === "number";

      if (isFinalCarryAdd) {
        const sumStr = String(sum);
        let newStartIdx = updateIdx - (sumStr.length - 1);
        while (newStartIdx < 0) {
          chars.unshift(" ");
          newStartIdx++;
        }
        for (let i = 0; i < sumStr.length; i++) {
          chars[newStartIdx + i] = sumStr[i];
        }

        //Không cập nhật visibleDigitsMap ở đây!
      } else {
        const original = parseInt(chars[updateIdx] || "0", 10);
        const result = original + (carry || 0);
        chars[updateIdx] = String(result % 10);
        if (result >= 10) {
          const carryDigit = Math.floor(result / 10);
          const leftIdx = updateIdx - 1;
          if (leftIdx >= 0) {
            const left = parseInt(chars[leftIdx] || "0", 10);
            chars[leftIdx] = String(left + carryDigit);
          } else {
            chars.unshift(String(carryDigit));
          }
        }
      }

      updatedSteps[2].partials[rowIndex] = chars.join("");
      setSteps(updatedSteps);

      break;
    }

    case "reveal_digits": {
      const { rowIndex, colIndex, digitsToReveal = 1 } = nextMeta;

      // Cập nhật chữ số kết quả
      const rowKey = `row_${rowIndex}`;
      setVisibleDigitsMap((prev) => ({
        ...prev,
        [rowKey]: (prev[rowKey] ?? 0) + digitsToReveal,
      }));

      // Không cần cập nhật visibleCarryMap ở đây nữa
      const carryKey = `carry_${rowIndex}`;
      const carryRows = steps?.[2]?.carryRows ?? [];
      const maxLen = steps?.[2]?.maxLen ?? 0;

      const rawCarryRow = carryRows[rowIndex] ?? [];
      const carryArray =
        typeof rawCarryRow === "string"
          ? rawCarryRow.split("")
          : [...rawCarryRow];

      const padded = padLeft(carryArray, maxLen);

      //Tính chỉ số cần hé lộ
      let targetIdx;
      const targetColFromRight = colIndex + 1;
      if (rowIndex === 0) {
        targetIdx = padded.length - targetColFromRight; // luôn là cuối nếu dòng đầu
      } else {
        const targetColFromRight = colIndex + 1;
        targetIdx = padded.length - 1 - targetColFromRight;
      }

      const currentReveal = visibleCarryMap[carryKey] ?? 0;
      const maxReveal = padded.length - targetIdx;

      const shouldReveal =
        targetIdx >= 0 && padded[targetIdx] && padded[targetIdx].trim() !== "";

      const newRevealCount =
        shouldReveal && currentReveal < maxReveal
          ? currentReveal + 1
          : currentReveal;

      setVisibleCarryMap((prev) => ({
        ...prev,
        [carryKey]: newRevealCount,
      }));
      break;
    }

    case "vertical_add": {
      const col = nextMeta.column;

      // Reveal thêm một chữ số kết quả
      setRevealedResultDigits((prev) => prev + 1);

      setVisibleDigitsMap((prev) => {
        const next = { ...prev };
        next["result"] = (next["result"] || 0) + 1;

        if (typeof col === "number") {
          const colKey = `col_${col}`;
          next[colKey] = (next[colKey] || 0) + 1;
        }

        return next;
      });

      break;
    }

    case "shift": {
      const rowKey = `row_${nextMeta.rowIndex}`;
      setVisibleDigitsMap((prev) => ({
        ...prev,
        [rowKey]: (prev[rowKey] || 0) + 1,
      }));
      break;
    }

    case "carry":
      break;

    case "final_result":
      setStepIndex((prev) => prev + 1);
      setSubStepIndex(0);
      break;

    default:
      break;
  }

  return;
};
