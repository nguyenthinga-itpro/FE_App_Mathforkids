export const handleBackMultiplication = ({
  subStepIndex,
  setSubStepIndex,
  setRevealedDigits,
  setRevealedResultDigits,
  setCurrentRowIndex,
  setVisibleDigitsMap,
  setVisibleCarryMap,
  setSteps,
  stepIndex,
  steps,
}) => {
  const getMetaAt = (index) => steps?.[2]?.subStepsMeta?.[index] || {};
  // console.log("🚦 Bắt đầu từ subStep:", subStepIndex);
  if (stepIndex === 2 && subStepIndex > 0) {
    const meta = getMetaAt(subStepIndex); // xử lý bước hiện tại
    const newSubStepIndex = subStepIndex - 1;
    const type = meta?.type;
    // console.log("Back to subStep:", newSubStepIndex);
    // console.log("meta:", meta);
    if (type === "row_intro" || type === "intro") {
      if (typeof meta.rowIndex === "number") {
        setCurrentRowIndex(meta.rowIndex);
        setRevealedDigits(-1);
      }
    }
    if (type === "detail" && typeof meta.rowIndex === "number") {
      const updated = [...steps];
      const { rowIndex, colIndex } = meta;
      const chars = updated[2].partials[rowIndex].split("");
      const shift = rowIndex;
      const updateIdx = chars.length - 1 - (colIndex + shift);
      if (updateIdx >= 0) chars[updateIdx] = "?";
      updated[2].partials[rowIndex] = chars.join("");
      setSteps(updated);
      setRevealedDigits((prev) => Math.max(0, prev - 1));
      const carryValue = meta.carryNow ?? meta.carry;
      if (typeof carryValue === "number" && carryValue > 0) {
        const carryKey = `carry_${meta.rowIndex}`;
        setVisibleCarryMap((prev) => ({
          ...prev,
          [carryKey]: Math.max(0, (prev[carryKey] || 0) - 1),
        }));
      }
    }
    if (type === "detail_final_digit" && typeof meta.rowIndex === "number") {
      const updated = [...steps];
      const { rowIndex, colIndex, product } = meta;
      const digits = String(product).length;
      const chars = updated[2].partials[rowIndex].split("");
      const shift = rowIndex;
      const startIdx = chars.length - 1 - (colIndex + shift);
      for (let i = 0; i < digits; i++) {
        const idx = startIdx - (digits - 1 - i);
        if (idx >= 0) chars[idx] = "?";
      }
      updated[2].partials[rowIndex] = chars.join("");
      setSteps(updated);
      setRevealedDigits((prev) => Math.max(0, prev - digits));
    }
    if (type === "reveal_digits" && typeof meta.rowIndex === "number") {
      const { rowIndex, digitsToReveal = 1 } = meta;
      const rowKey = `row_${rowIndex}`;
      const carryKey = `carry_${rowIndex}`;
      setVisibleDigitsMap((prev) => ({
        ...prev,
        [rowKey]: Math.max(0, (prev[rowKey] || 0) - digitsToReveal),
      }));
      // setVisibleCarryMap((prev) => ({
      //   ...prev,
      //   [carryKey]: Math.max(0, (prev[carryKey] || 0) - 1),
      // }));
    }
    if (type === "zero_rule" && typeof meta.rowIndex === "number") {
      const rowKey = `row_${meta.rowIndex}`;
      setVisibleDigitsMap((prev) => ({
        ...prev,
        [rowKey]: 0,
      }));
    }
    if (type === "carry_add" && typeof meta.rowIndex === "number") {
      const carryKey = `carry_${meta.rowIndex}`;
      // setVisibleCarryMap((prev) => ({
      //   ...prev,
      //   [carryKey]: Math.max(0, (prev[carryKey] || 0) - 1),
      // }));
    }
    if (type === "shift" && typeof meta.rowIndex === "number") {
      const rowKey = `row_${meta.rowIndex}`;
      // setVisibleDigitsMap((prev) => ({
      //   ...prev,
      //   [rowKey]: Math.max(0, (prev[rowKey] || 0) - 1),
      // }));
    }
    const handleResultResetAtColumn = (col, label = "Updated result") => {
      const updated = [...steps];
      const result = updated[2]?.result || "";
      let resultChars = result.split("");
      const targetLen = updated[2]?.maxLen || result.length || col + 1;
      const padCount = targetLen - resultChars.length;
      if (padCount > 0) {
        resultChars = [...Array(padCount).fill(" "), ...resultChars];
      }
      const updateIdx = resultChars.length - 1 - col;
      // console.log(
      //   "🔧 updateIdx:",
      //   updateIdx,
      //   "| before:",
      //   resultChars.join("")
      // );
      if (updateIdx >= 0 && updateIdx < resultChars.length) {
        resultChars[updateIdx] = "?";
        updated[2].result = resultChars.join("");
        setSteps(updated);
        // console.log(`🧹 ${label}:`, updated[2].result);
      } else {
        console.warn("❗ Index out of range when resetting result", {
          col,
          updateIdx,
        });
      }
    };
    if (type === "vertical_add") {
      const col = meta?.column;
      const rowIndex = meta?.rowIndex;
      // console.log("[vertical_add] column:", col);

      setRevealedResultDigits((prev) => {
        const next = Math.max(0, prev - 1);
        // console.log("Revealed result digits →", next);
        return next;
      });

      setVisibleDigitsMap((prev) => {
        const next = { ...prev };
        next.result = Math.max(0, (next.result || 0) - 1);
        if (typeof col === "number") {
          const colKey = `col_${col}`;
          next[colKey] = Math.max(0, (next[colKey] || 0) - 1);
          //  console.log("Updated visibleDigitsMap.col:", colKey, "→", next[colKey]);
        }
        return next;
      });

      setVisibleCarryMap((prev) => {
        const next = { ...prev };
        next.verticalCarry = Math.max(0, (prev.verticalCarry || 0) - 1);
        if (typeof rowIndex === "number") {
          const carryKey = `carry_${rowIndex}`;
          const prevVal = prev[carryKey] || 0;
          next[carryKey] = Math.max(0, prevVal - 1);
          // console.log(
          //   `carryKey ${carryKey}: ${prevVal} → ${next[carryKey]}`
          // );
        }
        // console.log("visibleCarryMap AFTER :", next);
        return next;
      });

      if (typeof col === "number") {
        handleResultResetAtColumn(col);
      }
    }

    if (type === "final_carry") {
      const updated = [...steps];
      const result = updated[2]?.result || "";
      const col = result.length; // cuối cùng là thêm chữ số ở đầu (column = result.length)
      setRevealedResultDigits((prev) => Math.max(0, prev - 1));
      // setVisibleCarryMap((prev) => ({
      //   ...prev,
      //   verticalCarry: Math.max(0, (prev.verticalCarry || 0) - 1),
      // }));
      setVisibleDigitsMap((prev) => {
        const next = { ...prev };
        next.result = Math.max(0, (next.result || 0) - 1);
        const colKey = `col_${col}`;
        next[colKey] = Math.max(0, (next[colKey] || 0) - 1);
        return next;
      });
      handleResultResetAtColumn(
        col,
        "[final_carry as vertical_add] Updated result"
      );
    }
    // Debug vertical_add và final_carry toàn bộ
    steps[2]?.subStepsMeta?.forEach((meta, i) => {
      if (meta.type === "vertical_add" || meta.type === "final_carry") {
        // console.log(
        //   `[CHECK] #${i} | ${meta.type} | column: ${meta.column} | digit: ${meta.digit} | carry: ${meta.carry}`
        // );
      }
    });
    setSubStepIndex(newSubStepIndex);
    return true;
  }
  return false;
};
