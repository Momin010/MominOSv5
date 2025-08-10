"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, Trash2, Calculator, Settings, Copy, RotateCcw,
  Plus, Minus, X, Divide, Percent, PlusCircle, MinusCircle,
  Zap, Brain, Function, Activity, Eye, EyeOff
} from "lucide-react";

export default function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isScientific, setIsScientific] = useState(false);

  // Handle number input
  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  // Handle decimal point input
  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  // Handle operations (e.g., +, -, ×, ÷)
  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  // Perform calculation based on the selected operation
  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case "^":
        return Math.pow(firstValue, secondValue);
      case "√":
        return Math.sqrt(firstValue);
      default:
        return secondValue;
    }
  };

  // Final calculation after clicking '='
  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      const calculation = `${previousValue} ${operation} ${inputValue} = ${newValue}`;
      setHistory([...history, calculation]);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  // Clear all values
  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  // Clear calculation history
  const clearHistory = () => {
    setHistory([]);
  };

  // Format display to handle long numbers
  const formatDisplay = (value: string) => {
    if (value.length > 9) {
      const num = parseFloat(value);
      if (num > 999999999 || num < -999999999) {
        return num.toExponential(3);
      }
      return num.toPrecision(9);
    }
    return value;
  };

  // Handle scientific functions like sin, cos, log, etc.
  const scientificFunction = (func: string) => {
    const value = parseFloat(display);
    let result = 0;

    switch (func) {
      case "sin":
        result = Math.sin(value * Math.PI / 180);
        break;
      case "cos":
        result = Math.cos(value * Math.PI / 180);
        break;
      case "tan":
        result = Math.tan(value * Math.PI / 180);
        break;
      case "log":
        result = Math.log10(value);
        break;
      case "ln":
        result = Math.log(value);
        break;
      case "sqrt":
        result = Math.sqrt(value);
        break;
      case "square":
        result = value * value;
        break;
      case "cube":
        result = value * value * value;
        break;
      case "factorial":
        result = 1;
        for (let i = 2; i <= value; i++) result *= i;
        break;
      default:
        result = value;
    }

    setDisplay(String(result));
  };

  // Button component
  const Button = ({
    onClick,
    className = "",
    children,
    variant = "number",
    ...props
  }: {
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
    variant?: "number" | "operator" | "function" | "scientific";
    [key: string]: any;
  }) => {
    const baseClasses =
      "h-16 rounded-xl font-light text-xl transition-all duration-200 flex items-center justify-center select-none";

    const variantClasses = {
      number: "glass-button text-white hover:bg-white/20",
      operator: `glass-button text-white ${variant === "operator" ? "bg-orange-500" : ""}`,
      function: "glass-button bg-gray-500/20 text-white hover:bg-gray-500/30",
      scientific: "glass-button bg-purple-500/20 text-white hover:bg-purple-500/30",
    };

    return (
      <motion.button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  };

  return (
    <div className="h-full bg-black/20 backdrop-blur-xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-purple-400" />
          <h2 className="text-white font-semibold">Calculator</h2>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={() => setShowHistory(!showHistory)}
            className="glass-button p-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <History className="w-4 h-4 text-white" />
          </motion.button>
          <motion.button
            onClick={() => setIsScientific(!isScientific)}
            className="glass-button p-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <motion.div
          className="glass-card mb-4 p-4 max-h-32 overflow-y-auto"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white text-sm font-medium">History</h3>
            <motion.button
              onClick={clearHistory}
              className="text-red-400 hover:text-red-300"
              whileHover={{ scale: 1.1 }}
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
          {history.map((item, index) => (
            <div key={index} className="text-gray-300 text-sm py-1">
              {item}
            </div>
          ))}
        </motion.div>
      )}

      {/* Display */}
      <div className="flex-1 flex items-end justify-end p-6 mb-4">
        <motion.div
          className="text-white text-right font-light overflow-hidden"
          style={{ fontSize: display.length > 6 ? "2.5rem" : "3rem" }}
          key={display}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          {formatDisplay(display)}
        </motion.div>
      </div>

      {/* Scientific Functions */}
      {isScientific && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          <Button onClick={() => scientificFunction("sin")} variant="scientific">
            sin
          </Button>
          <Button onClick={() => scientificFunction("cos")} variant="scientific">
            cos
          </Button>
          <Button onClick={() => scientificFunction("tan")} variant="scientific">
            tan
          </Button>
          <Button onClick={() => scientificFunction("log")} variant="scientific">
            log
          </Button>
          <Button onClick={() => scientificFunction("ln")} variant="scientific">
            ln
          </Button>
          <Button onClick={() => scientificFunction("sqrt")} variant="scientific">
            √
          </Button>
          <Button onClick={() => scientificFunction("square")} variant="scientific">
            x²
          </Button>
          <Button onClick={() => scientificFunction("cube")} variant="scientific">
            x³
          </Button>
        </div>
      )}

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-3">
        {/* Row 1 */}
        <Button onClick={clear} variant="function">
          AC
        </Button>
        <Button onClick={() => setDisplay(String(-parseFloat(display)))} variant="function">
          ±
        </Button>
        <Button onClick={() => setDisplay(String(parseFloat(display) / 100))} variant="function">
          %
        </Button>
        <Button onClick={() => inputOperation("÷")} variant="operator">
          ÷
        </Button>

        {/* Row 2 */}
        <Button onClick={() => inputNumber("7")} variant="number">
          7
        </Button>
        <Button onClick={() => inputNumber("8")} variant="number">
          8
        </Button>
        <Button onClick={() => inputNumber("9")} variant="number">
          9
        </Button>
        <Button onClick={() => inputOperation("×")} variant="operator">
          ×
        </Button>

        {/* Row 3 */}
        <Button onClick={() => inputNumber("4")} variant="number">
          4
        </Button>
        <Button onClick={() => inputNumber("5")} variant="number">
          5
        </Button>
        <Button onClick={() => inputNumber("6")} variant="number">
          6
        </Button>
        <Button onClick={() => inputOperation("-")} variant="operator">
          −
        </Button>

        {/* Row 4 */}
        <Button onClick={() => inputNumber("1")} variant="number">
          1
        </Button>
        <Button onClick={() => inputNumber("2")} variant="number">
          2
        </Button>
        <Button onClick={() => inputNumber("3")} variant="number">
          3
        </Button>
        <Button onClick={() => inputOperation("+")} variant="operator">
          +
        </Button>

        {/* Row 5 */}
        <Button onClick={() => inputNumber("0")} variant="number" className="col-span-2">
          0
        </Button>
        <Button onClick={inputDecimal} variant="number">
          .
        </Button>
        <Button onClick={performCalculation} variant="operator">
          =
        </Button>
      </div>
    </div>
  );
}
