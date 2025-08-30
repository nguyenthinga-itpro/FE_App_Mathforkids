import { handleAddition } from "./Addition/handleAddition";
import { handleSubtraction } from "./Subtraction/handleSubtraction";
import { handleMultiplication } from "./Multiplication/handleMultiplication";
import { handleDivision } from "./Division/handleDivision";
const isValidPositiveInteger = (str) => /^\d+$/.test(str);
export const handleStepZero = ({
  number1,
  number2,
  operator,
  setRemember,
  setStepIndex,
  setSteps,
  stepIndex,
  t,
}) => {
  if (isValidPositiveInteger(number1) && isValidPositiveInteger(number2)) {
    const n1 = parseInt(number1);
    const n2 = parseInt(number2);

    const n1Str = n1.toString();
    const n2Str = n2.toString();
    if (operator === "-" && parseInt(number1) < parseInt(number2)) {
      alert(t("subtraction.error_min_lt_sub"));
      return;
    }
    // Khởi tạo đầy đủ các bước với cấu trúc an toàn
    const newSteps = [
      {
        title: "",
        description: "",
        result: "",
      },
      {
        title: t("step1_title"),
        description: t("step1_description", { number1: n1Str, number2: n2Str }),
        subText: t("step1_subText"),
        result: "",
        number1: n1Str,
        number2: n2Str,
      },
      {
        title: "",
        description: "",
        subText: "",
        result: "",
        number1: n1Str,
        number2: n2Str,
        subSteps: [],
      },
      {
        title: t("step3_title"),
        description: t("step3_description", {
          n1Str,
          n2Str,
          operator,
        }),
        result: "",
        subText: "",
        n1Str,
        n2Str,
      },
    ];

    switch (operator) {
      case "+":
        newSteps[2].title = t("add_title");
        newSteps[2].description = t("add_description");
        handleAddition(n1, n2, newSteps, setRemember, t);
        break;
      case "-":
        newSteps[2].title = t("sub_title");
        newSteps[2].description = t("sub_description");
        handleSubtraction(n1, n2, newSteps, setRemember, t);
        break;
      case "×":
        newSteps[2].title = t("mul_title");
        newSteps[2].description = t("mul_description", {
          number1: n1Str,
          number2: n2Str,
        });
        handleMultiplication(n1, n2, newSteps, setRemember, t);
        break;
      case "÷":
        newSteps[2].title = t("div_title");
        newSteps[2].description = t("div_description", {
          number1: n1Str,
          number2: n2Str,
        });
        handleDivision(n1, n2, newSteps, setRemember, t);
        break;
      default:
        newSteps[2].title = t("invalid_title");
        newSteps[2].description = t("invalid_description");
        break;
    }

    setSteps(newSteps);

    if (stepIndex < newSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  } else {
    alert(t("error.invalid_input") || "Please enter valid positive integers.");
  }
};
