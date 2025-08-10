"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, Trash2, Calculator, Settings, Copy, RotateCcw,
  Plus, Minus, X, Divide, Percent, PlusCircle, MinusCircle,
  Zap, Brain, Function, Activity, Eye, EyeOff, Palette,
  Save, BookOpen, TrendingUp, BarChart3, Sparkles
} from "lucide-react";

interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

interface Memory {
  value: number;
  label: string;
  timestamp: number;
}

export default function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [memory, setMemory] = useState<Memory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [isScientific, setIsScientific] = useState(false);
  const [theme, setTheme] = useState<'purple' | 'blue' | 'green' | 'orange'>('purple');
  const [showStats, setShowStats] = useState(false);
  const [expression, setExpression] = useState("");
  const [isDegree, setIsDegree] = useState(true);
  const [showConstants, setShowConstants] = useState(false);

  // Mathematical constants
  const constants = {
    'π': Math.PI,
    'e': Math.E,
    'φ': (1 + Math.sqrt(5)) / 2, // Golden ratio
    '√2': Math.sqrt(2),
    '√3': Math.sqrt(3),
    'ln2': Math.LN2,
    'ln10': Math.LN10,
    'log2e': Math.LOG2E,
    'log10e': Math.LOG10E
  };

  // Theme colors
  const themes = {
    purple: {
      primary: 'from-purple-500 to-purple-700',
      secondary: 'bg-purple-500/20',
      accent: 'text-purple-400',
      button: 'hover:bg-purple-500/30'
    },
    blue: {
      primary: 'from-blue-500 to-blue-700',
      secondary: 'bg-blue-500/20',
      accent: 'text-blue-400',
      button: 'hover:bg-blue-500/30'
    },
    green: {
      primary: 'from-green-500 to-green-700',
      secondary: 'bg-green-500/20',
      accent: 'text-green-400',
      button: 'hover:bg-green-500/30'
    },
    orange: {
      primary: 'from-orange-500 to-orange-700',
      secondary: 'bg-orange-500/20',
      accent: 'text-orange-400',
      button: 'hover:bg-orange-500/30'
    }
  };

  const currentTheme = themes[theme];

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      
      if (e.key >= '0' && e.key <= '9') {
        inputNumber(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+') {
        inputOperation('+');
      } else if (e.key === '-') {
        inputOperation('-');
      } else if (e.key === '*') {
        inputOperation('×');
      } else if (e.key === '/') {
        inputOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        performCalculation();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        clear();
      } else if (e.key === 'Backspace') {
        backspace();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, operation, previousValue, waitingForOperand]);

  // Advanced number input with expression tracking
  const inputNumber = useCallback((num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setExpression(prev => prev + num);
      setWaitingForOperand(false);
    } else {
      const newDisplay = display === "0" ? num : display + num;
      setDisplay(newDisplay);
      if (expression.endsWith(display)) {
        setExpression(prev => prev.slice(0, -display.length) + newDisplay);
      } else {
        setExpression(prev => prev + num);
      }
    }
  }, [display, waitingForOperand, expression]);

  // Enhanced decimal input
  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setExpression(prev => prev + "0.");
      setWaitingForOperand(false);
    } else if (!display.includes(".")) {
      const newDisplay = display + ".";
      setDisplay(newDisplay);
      setExpression(prev => prev + ".");
    }
  }, [display, waitingForOperand]);

  // Advanced operations with expression tracking
  const inputOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setExpression(display + " " + nextOperation + " ");
    } else if (operation && !waitingForOperand) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);
      
      setDisplay(String(newValue));
      setPreviousValue(newValue);
      setExpression(prev => prev + " = " + newValue + " " + nextOperation + " ");
    } else {
      setExpression(prev => prev.slice(0, -3) + nextOperation + " ");
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation, waitingForOperand]);

  // Enhanced calculation with error handling
  const calculate = useCallback((firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        if (secondValue === 0) {
          throw new Error("Division by zero");
        }
        return firstValue / secondValue;
      case "^":
        return Math.pow(firstValue, secondValue);
      case "mod":
        return firstValue % secondValue;
      case "root":
        return Math.pow(firstValue, 1 / secondValue);
      default:
        return secondValue;
    }
  }, []);

  // Unit conversion functions
  const convertUnits = useCallback((value: number, fromUnit: string, toUnit: string, category: string): number => {
    const conversions: {[key: string]: {[key: string]: number}} = {
      length: {
        m: 1, km: 0.001, cm: 100, mm: 1000, in: 39.3701, ft: 3.28084, yd: 1.09361, mi: 0.000621371
      },
      weight: {
        kg: 1, g: 1000, lb: 2.20462, oz: 35.274, ton: 0.001
      },
      temperature: {
        c: (val: number) => val,
        f: (val: number) => (val * 9/5) + 32,
        k: (val: number) => val + 273.15
      },
      volume: {
        l: 1, ml: 1000, gal: 0.264172, qt: 1.05669, pt: 2.11338, cup: 4.22675, fl_oz: 33.814
      }
    }

    if (category === 'temperature') {
      const temp = conversions.temperature as any
      if (fromUnit === 'c' && toUnit === 'f') return (value * 9/5) + 32
      if (fromUnit === 'f' && toUnit === 'c') return (value - 32) * 5/9
      if (fromUnit === 'c' && toUnit === 'k') return value + 273.15
      if (fromUnit === 'k' && toUnit === 'c') return value - 273.15
      if (fromUnit === 'f' && toUnit === 'k') return ((value - 32) * 5/9) + 273.15
      if (fromUnit === 'k' && toUnit === 'f') return ((value - 273.15) * 9/5) + 32
    } else {
      const categoryConversions = conversions[category]
      if (categoryConversions && categoryConversions[fromUnit] && categoryConversions[toUnit]) {
        return (value / categoryConversions[fromUnit]) * categoryConversions[toUnit]
      }
    }
    return value
  }, [])

  // Advanced mathematical functions
  const advancedFunctions = useCallback((func: string, value: number): number => {
    switch (func) {
      case 'sin': return isDegree ? Math.sin(value * Math.PI / 180) : Math.sin(value)
      case 'cos': return isDegree ? Math.cos(value * Math.PI / 180) : Math.cos(value)
      case 'tan': return isDegree ? Math.tan(value * Math.PI / 180) : Math.tan(value)
      case 'asin': return isDegree ? Math.asin(value) * 180 / Math.PI : Math.asin(value)
      case 'acos': return isDegree ? Math.acos(value) * 180 / Math.PI : Math.acos(value)
      case 'atan': return isDegree ? Math.atan(value) * 180 / Math.PI : Math.atan(value)
      case 'sinh': return Math.sinh(value)
      case 'cosh': return Math.cosh(value)
      case 'tanh': return Math.tanh(value)
      case 'log': return Math.log10(value)
      case 'ln': return Math.log(value)
      case 'log2': return Math.log2(value)
      case 'sqrt': return Math.sqrt(value)
      case 'cbrt': return Math.cbrt(value)
      case 'abs': return Math.abs(value)
      case 'floor': return Math.floor(value)
      case 'ceil': return Math.ceil(value)
      case 'round': return Math.round(value)
      case 'factorial': {
        if (value < 0 || !Number.isInteger(value)) return NaN
        let result = 1
        for (let i = 2; i <= value; i++) result *= i
        return result
      }
      case 'gamma': {
        // Gamma function approximation
        const g = 7
        const C = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]
        if (value < 0.5) return Math.PI / (Math.sin(Math.PI * value) * this.advancedFunctions('gamma', 1 - value))
        value -= 1
        let x = C[0]
        for (let i = 1; i < g + 2; i++) x += C[i] / (value + i)
        const t = value + g + 0.5
        return Math.sqrt(2 * Math.PI) * Math.pow(t, value + 0.5) * Math.exp(-t) * x
      }
      case 'random': return Math.random() * value
      default: return value
    }
  }, [isDegree])

  // Enhanced calculation with history
  const performCalculation = useCallback(() => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operation) {
      try {
        const newValue = calculate(previousValue, inputValue, operation)
        const finalExpression = expression + inputValue + " = " + newValue
        
        // Add to history
        const historyItem: CalculationHistory = {
          id: Date.now().toString(),
          expression: finalExpression,
          result: String(newValue),
          timestamp: Date.now()
        };
        
        setHistory(prev => [historyItem, ...prev].slice(0, 100));
        setDisplay(String(newValue));
        setExpression(String(newValue));
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(true);
      } catch (error) {
        setDisplay("Error");
        setExpression("Error");
        clear();
      }
    }
  }, [display, previousValue, operation, expression, calculate]);

  // Backspace functionality
  const backspace = useCallback(() => {
    if (display.length > 1) {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay);
      setExpression(prev => prev.slice(0, -1));
    } else {
      setDisplay("0");
    }
  }, [display]);

  // Enhanced clear
  const clear = useCallback(() => {
    setDisplay("0");
    setExpression("");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, []);

  // Memory functions
  const memoryStore = useCallback(() => {
    const value = parseFloat(display);
    if (!isNaN(value)) {
      const memoryItem: Memory = {
        value,
        label: `M${memory.length + 1}`,
        timestamp: Date.now()
      };
      setMemory(prev => [...prev, memoryItem].slice(0, 10));
    }
  }, [display, memory.length]);

  const memoryRecall = useCallback((memoryItem: Memory) => {
    setDisplay(String(memoryItem.value));
    setExpression(String(memoryItem.value));
    setWaitingForOperand(true);
  }, []);

  const memoryClear = useCallback(() => {
    setMemory([]);
  }, []);

  // Copy to clipboard
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(display);
  }, [display]);

  // Advanced scientific functions
  const scientificFunction = useCallback((func: string) => {
    const value = parseFloat(display);
    let result = 0;

    try {
      switch (func) {
        case "sin":
          result = isDegree ? Math.sin(value * Math.PI / 180) : Math.sin(value);
          break;
        case "cos":
          result = isDegree ? Math.cos(value * Math.PI / 180) : Math.cos(value);
          break;
        case "tan":
          result = isDegree ? Math.tan(value * Math.PI / 180) : Math.tan(value);
          break;
        case "asin":
          result = isDegree ? Math.asin(value) * 180 / Math.PI : Math.asin(value);
          break;
        case "acos":
          result = isDegree ? Math.acos(value) * 180 / Math.PI : Math.acos(value);
          break;
        case "atan":
          result = isDegree ? Math.atan(value) * 180 / Math.PI : Math.atan(value);
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
        case "cbrt":
          result = Math.cbrt(value);
          break;
        case "square":
          result = value * value;
          break;
        case "cube":
          result = value * value * value;
          break;
        case "factorial":
          if (value < 0 || value > 170) throw new Error("Invalid factorial");
          result = 1;
          for (let i = 2; i <= value; i++) result *= i;
          break;
        case "reciprocal":
          if (value === 0) throw new Error("Division by zero");
          result = 1 / value;
          break;
        case "exp":
          result = Math.exp(value);
          break;
        case "exp10":
          result = Math.pow(10, value);
          break;
        case "abs":
          result = Math.abs(value);
          break;
        default:
          result = value;
      }

      setDisplay(String(result));
      setExpression(func + "(" + value + ") = " + result);
    } catch (error) {
      setDisplay("Error");
      setExpression("Error");
    }
  }, [display, isDegree]);

  // Insert constant
  const insertConstant = useCallback((constantName: keyof typeof constants) => {
    const value = constants[constantName];
    setDisplay(String(value));
    setExpression(constantName);
    setWaitingForOperand(true);
  }, [constants]);

  // Format display for better readability
  const formatDisplay = useCallback((value: string) => {
    if (value === "Error") return value;
    
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    // Handle very large or small numbers
    if (Math.abs(num) > 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
      return num.toExponential(6);
    }
    
    // Format with thousands separators for large numbers
    if (Math.abs(num) >= 1000) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 10 });
    }
    
    return value;
  }, []);

  // Advanced button component
  const Button = ({
    onClick,
    className = "",
    children,
    variant = "number",
    icon,
    ...props
  }: {
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
    variant?: "number" | "operator" | "function" | "scientific" | "memory";
    icon?: React.ReactNode;
  }) => {
    const variants = {
      number: `glass-card text-white hover:bg-white/20 border-white/10`,
      operator: `glass-card bg-gradient-to-br ${currentTheme.primary} text-white hover:scale-105`,
      function: `glass-card ${currentTheme.secondary} text-white ${currentTheme.button}`,
      scientific: `glass-card bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-white hover:bg-indigo-500/30`,
      memory: `glass-card bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-white hover:bg-green-500/30`
    };

    return (
      <motion.button
        onClick={onClick}
        className={`
          h-14 rounded-xl font-medium text-lg transition-all duration-200 
          flex items-center justify-center gap-2 select-none border backdrop-blur-sm
          ${variants[variant]} ${className}
        `}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props}
      >
        {icon && <span className="w-4 h-4">{icon}</span>}
        {children}
      </motion.button>
    );
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${currentTheme.primary}`}>
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">Advanced Calculator</h2>
            <p className="text-gray-400 text-sm">Scientific & Programmable</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <motion.button
            onClick={() => setShowHistory(!showHistory)}
            className={`glass-card p-2 ${showHistory ? currentTheme.secondary : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <History className="w-4 h-4 text-white" />
          </motion.button>
          
          <motion.button
            onClick={() => setShowMemory(!showMemory)}
            className={`glass-card p-2 ${showMemory ? currentTheme.secondary : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BookOpen className="w-4 h-4 text-white" />
          </motion.button>
          
          <motion.button
            onClick={() => setShowStats(!showStats)}
            className={`glass-card p-2 ${showStats ? currentTheme.secondary : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BarChart3 className="w-4 h-4 text-white" />
          </motion.button>
          
          <motion.button
            onClick={() => {
              const themes = ['purple', 'blue', 'green', 'orange'] as const;
              const currentIndex = themes.indexOf(theme);
              const nextTheme = themes[(currentIndex + 1) % themes.length];
              setTheme(nextTheme);
            }}
            className="glass-card p-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Palette className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>

      <div className="flex gap-4 flex-1">
        {/* Main Calculator */}
        <div className="flex-1 flex flex-col">
          {/* Expression Display */}
          {expression && (
            <motion.div 
              className="glass-card p-3 mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-gray-400 text-sm font-mono truncate">
                {expression}
              </div>
            </motion.div>
          )}

          {/* Main Display */}
          <div className="glass-card p-6 mb-4 relative">
            <motion.div
              className="text-white text-right font-mono overflow-hidden"
              style={{ fontSize: display.length > 8 ? "2rem" : "2.5rem" }}
              key={display}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {formatDisplay(display)}
            </motion.div>
            
            <motion.button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 glass-button p-1 opacity-0 hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Copy className="w-3 h-3 text-white" />
            </motion.button>
          </div>

          {/* Mode Toggles */}
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setIsScientific(!isScientific)}
              variant={isScientific ? "scientific" : "function"}
              className="flex-1"
            >
              {isScientific ? "Basic" : "Scientific"}
            </Button>
            
            <Button
              onClick={() => setIsDegree(!isDegree)}
              variant="function"
              className="flex-1"
            >
              {isDegree ? "DEG" : "RAD"}
            </Button>
            
            <Button
              onClick={() => setShowConstants(!showConstants)}
              variant={showConstants ? "scientific" : "function"}
              className="flex-1"
            >
              Constants
            </Button>
          </div>

          {/* Constants Panel */}
          <AnimatePresence>
            {showConstants && (
              <motion.div
                className="grid grid-cols-3 gap-2 mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {Object.entries(constants).map(([name, value]) => (
                  <Button
                    key={name}
                    onClick={() => insertConstant(name as keyof typeof constants)}
                    variant="scientific"
                    className="text-sm"
                  >
                    {name}
                  </Button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scientific Functions */}
          <AnimatePresence>
            {isScientific && (
              <motion.div
                className="grid grid-cols-4 gap-2 mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Button onClick={() => scientificFunction("sin")} variant="scientific">sin</Button>
                <Button onClick={() => scientificFunction("cos")} variant="scientific">cos</Button>
                <Button onClick={() => scientificFunction("tan")} variant="scientific">tan</Button>
                <Button onClick={() => scientificFunction("log")} variant="scientific">log</Button>
                
                <Button onClick={() => scientificFunction("asin")} variant="scientific">asin</Button>
                <Button onClick={() => scientificFunction("acos")} variant="scientific">acos</Button>
                <Button onClick={() => scientificFunction("atan")} variant="scientific">atan</Button>
                <Button onClick={() => scientificFunction("ln")} variant="scientific">ln</Button>
                
                <Button onClick={() => scientificFunction("sqrt")} variant="scientific">√x</Button>
                <Button onClick={() => scientificFunction("cbrt")} variant="scientific">∛x</Button>
                <Button onClick={() => scientificFunction("square")} variant="scientific">x²</Button>
                <Button onClick={() => scientificFunction("cube")} variant="scientific">x³</Button>
                
                <Button onClick={() => scientificFunction("exp")} variant="scientific">eˣ</Button>
                <Button onClick={() => scientificFunction("exp10")} variant="scientific">10ˣ</Button>
                <Button onClick={() => scientificFunction("reciprocal")} variant="scientific">1/x</Button>
                <Button onClick={() => scientificFunction("factorial")} variant="scientific">x!</Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Button Grid */}
          <div className="grid grid-cols-4 gap-3 flex-1">
            {/* Row 1 */}
            <Button onClick={clear} variant="function" icon={<RotateCcw className="w-4 h-4" />}>AC</Button>
            <Button onClick={backspace} variant="function">⌫</Button>
            <Button onClick={() => setDisplay(String(parseFloat(display) / 100))} variant="function">%</Button>
            <Button onClick={() => inputOperation("÷")} variant="operator" icon={<Divide className="w-4 h-4" />}>÷</Button>

            {/* Row 2 */}
            <Button onClick={() => inputNumber("7")} variant="number">7</Button>
            <Button onClick={() => inputNumber("8")} variant="number">8</Button>
            <Button onClick={() => inputNumber("9")} variant="number">9</Button>
            <Button onClick={() => inputOperation("×")} variant="operator" icon={<X className="w-4 h-4" />}>×</Button>

            {/* Row 3 */}
            <Button onClick={() => inputNumber("4")} variant="number">4</Button>
            <Button onClick={() => inputNumber("5")} variant="number">5</Button>
            <Button onClick={() => inputNumber("6")} variant="number">6</Button>
            <Button onClick={() => inputOperation("-")} variant="operator" icon={<Minus className="w-4 h-4" />}>−</Button>

            {/* Row 4 */}
            <Button onClick={() => inputNumber("1")} variant="number">1</Button>
            <Button onClick={() => inputNumber("2")} variant="number">2</Button>
            <Button onClick={() => inputNumber("3")} variant="number">3</Button>
            <Button onClick={() => inputOperation("+")} variant="operator" icon={<Plus className="w-4 h-4" />}>+</Button>

            {/* Row 5 */}
            <Button onClick={() => inputNumber("0")} variant="number" className="col-span-2">0</Button>
            <Button onClick={inputDecimal} variant="number">.</Button>
            <Button onClick={performCalculation} variant="operator" className="bg-gradient-to-br from-green-500 to-green-600">=</Button>
          </div>
        </div>

        {/* Side Panels */}
        <div className="w-80 flex flex-col gap-4">
          {/* Memory Panel */}
          <AnimatePresence>
            {showMemory && (
              <motion.div
                className="glass-card p-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-white font-semibold">Memory</h3>
                  <div className="flex gap-1">
                    <Button onClick={memoryStore} variant="memory" className="text-xs px-2 py-1 h-8">MS</Button>
                    <Button onClick={memoryClear} variant="function" className="text-xs px-2 py-1 h-8">MC</Button>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {memory.map((item) => (
                    <motion.div
                      key={item.timestamp}
                      className="glass-button p-2 cursor-pointer"
                      onClick={() => memoryRecall(item)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">{item.label}</span>
                        <span className="text-sm text-white font-mono">{formatDisplay(String(item.value))}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History Panel */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                className="glass-card p-4 flex-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-white font-semibold">History</h3>
                  <Button 
                    onClick={() => setHistory([])} 
                    variant="function" 
                    className="text-xs px-2 py-1 h-8"
                    icon={<Trash2 className="w-3 h-3" />}
                  >
                    Clear
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {history.map((item) => (
                    <motion.div
                      key={item.id}
                      className="glass-button p-3 cursor-pointer"
                      onClick={() => {
                        setDisplay(item.result);
                        setExpression(item.result);
                        setWaitingForOperand(true);
                      }}
                      whileHover={{ scale: 1.01 }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="text-xs text-gray-400 font-mono mb-1 truncate">
                        {item.expression}
                      </div>
                      <div className="text-sm text-white font-mono">
                        = {formatDisplay(item.result)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Panel */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                className="glass-card p-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h3 className="text-white font-semibold mb-3">Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Calculations:</span>
                    <span className="text-white">{history.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Memory items:</span>
                    <span className="text-white">{memory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mode:</span>
                    <span className="text-white">{isScientific ? "Scientific" : "Basic"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Angle unit:</span>
                    <span className="text-white">{isDegree ? "Degrees" : "Radians"}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
