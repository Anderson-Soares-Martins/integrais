"use client";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { evaluate } from "mathjs";

Chart.register(...registerables);

type Point = {
  x: number;
  y: number;
};

const InputForm = ({
  x,
  setX,
  handleAddPoint
}: {
  x: number;
  setX: (value: number) => void;
  handleAddPoint: () => void;
}) => (
  <div className="flex">
    <label className="mr-2">
      x:
      <input
        type="number"
        value={x}
        onChange={(e) => setX(Number(e.target.value))}
        className="ml-2 p-1 border rounded"
      />
    </label>
    <button
      onClick={handleAddPoint}
      className="ml-4 p-2 bg-green-500 text-white rounded"
    >
      Adicionar Ponto
    </button>
  </div>
);

const PointsList = ({ points }: { points: Point[] }) => (
  <div className="mt-6">
    <h2 className="text-2xl">Pontos:</h2>
    <ul className="flex flex-wrap gap-4">
      {points.map((point, index) => (
        <li key={index}>
          ({point.x}, {point.y})
        </li>
      ))}
    </ul>
  </div>
);

const calculateSimpson = (points: Point[]) => {
  if (points.length !== 3) {
    throw new Error("Simpson's 1/3 rule requires exactly 3 points.");
  }

  const [a, m, b] = points;
  const h = (b.x - a.x) / 2;

  return (h / 3) * (a.y + 4 * m.y + b.y);
};

const calculateCompositeSimpson = (points: Point[]) => {
  const sortedPoints = points.sort((a, b) => a.x - b.x);
  const n = sortedPoints.length - 1;

  if (n % 2 !== 0) {
    throw new Error(
      "Composite Simpson's 1/3 rule requires an even number of intervals."
    );
  }

  const h = (sortedPoints[n].x - sortedPoints[0].x) / n;
  let sum = sortedPoints[0].y + sortedPoints[n].y;

  for (let i = 1; i < n; i += 2) {
    sum += 4 * sortedPoints[i].y;
  }
  for (let i = 2; i < n; i += 2) {
    sum += 2 * sortedPoints[i].y;
  }

  return (h / 3) * sum;
};

export default function Simpson() {
  const [points, setPoints] = useState<Point[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<number | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);
  const [expression, setExpression] = useState<string>("");
  const [expressionError, setExpressionError] = useState<string>("");
  const [intervalStart, setIntervalStart] = useState<number>(0);
  const [intervalEnd, setIntervalEnd] = useState<number>(1);
  const [subdivisions, setSubdivisions] = useState<number>(2);
  const [usarFuncao, setUsarFuncao] = useState<boolean>(true);

  const estimateErrorSimpson = (points: Point[]) => {
    const n = points.length - 1;
    const h = (points[n].x - points[0].x) / n;
    const fFourthPrimeMax = Math.max(
      ...points.map((point) => evaluateExpression(expressionError, point.x))
    );

    return Math.abs(
      -(((points[n].x - points[0].x) * h ** 4) / 180) * fFourthPrimeMax
    );
  };

  const evaluateExpression = (expression: string, x: number): number => {
    const expressionWithX = expression.replace(/x/g, x.toString());

    // Avalie a expressão usando math.evaluate
    const result = evaluate(expressionWithX);

    // Verifique se o resultado é um número
    if (typeof result !== "number" || isNaN(result)) {
      throw new Error("A expressão não resulta em um número válido.");
    }

    return result;
  };

  const handleAddPoint = () => {
    if (!expression) {
      alert("Por favor, insira a expressão da função f(x).");
      return;
    }

    try {
      const y = evaluateExpression(expression, x); // Avalia a expressão para obter o valor de y
      setPoints([...points, { x, y }]);
    } catch (error: any) {
      alert("Erro ao avaliar a expressão: " + error.message);
    }
  };

  const generatePoints = () => {
    if (!expression) {
      alert("Por favor, insira a expressão da função f(x).");
      return;
    }

    const newPoints: Point[] = [];
    const h = (intervalEnd - intervalStart) / subdivisions;

    for (let i = 0; i <= subdivisions; i++) {
      const x = intervalStart + i * h;
      try {
        const y = evaluateExpression(expression, x);
        newPoints.push({ x, y });
      } catch (error: any) {
        alert("Erro ao avaliar a expressão: " + error.message);
        return;
      }
    }

    setPoints(newPoints);
  };

  const handleCalculate = () => {
    if (points.length < 3) {
      alert("Adicione pelo menos três pontos para a Regra de Simpson.");
      return;
    }

    try {
      const integral =
        points.length === 3
          ? calculateSimpson(points)
          : calculateCompositeSimpson(points);
      setResult(integral);

      if (expressionError) {
        const errorEstimate = estimateErrorSimpson(points);
        setError(errorEstimate);
      }

      const xValues = points.map((point) => point.x);
      const yValues = points.map((point) => point.y);

      setData({
        labels: xValues,
        datasets: [
          {
            label: "f(x)",
            data: yValues,
            fill: false,
            borderColor: "blue",
            tension: 0.1
          },
          {
            label: "Regra de Simpson",
            data: yValues,
            fill: true,
            backgroundColor: "rgba(75,192,192,0.2)",
            borderColor: "rgba(75,192,192,1)",
            pointRadius: 0,
            tension: 0
          }
        ]
      });
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 text-black">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Integração Numérica</h1>
        <h2 className="text-2xl">Regra de 1/3 de Simpson</h2>
        <button
          onClick={() => setUsarFuncao(!usarFuncao)}
          className="mt-6 p-2 bg-blue-500 text-white rounded"
        >
          {usarFuncao ? "Usar Pontos manualmente" : "Usar funções"}
        </button>
      </div>

      {usarFuncao && (
        <>
          <label className="mr-2">
            f(x):
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="ml-2 p-1 border rounded"
            />
          </label>
          <label className="mr-2">
            E f(x):
            <input
              type="text"
              value={expressionError}
              onChange={(e) => setExpressionError(e.target.value)}
              className="ml-2 p-1 border rounded"
            />
          </label>
          <label className="mr-2">
            Início do Intervalo:
            <input
              type="text"
              value={intervalStart}
              onChange={(e) =>
                setIntervalStart(() => {
                  if (e.target.value === "" || isNaN(Number(e.target.value))) {
                    return 0;
                  }
                  return Number(e.target.value);
                })
              }
              className="ml-2 p-1 border rounded"
            />
          </label>
          <label className="mr-2">
            Fim do Intervalo:
            <input
              type="text"
              value={intervalEnd}
              onChange={(e) =>
                setIntervalEnd(() => {
                  if (e.target.value === "" || isNaN(Number(e.target.value))) {
                    return 0;
                  }
                  return Number(e.target.value);
                })
              }
              className="ml-2 p-1 border rounded"
            />
          </label>
          <label className="mr-2">
            Subdivisões:
            <input
              type="text"
              value={subdivisions}
              onChange={(e) =>
                setSubdivisions(() => {
                  if (e.target.value === "" || isNaN(Number(e.target.value))) {
                    return 0;
                  }
                  return Number(e.target.value);
                })
              }
              className="ml-2 p-1 border rounded"
            />
          </label>

          <button
            onClick={generatePoints}
            className="mt-6 p-2 bg-blue-500 text-white rounded"
          >
            Gerar Pontos
          </button>
        </>
      )}

      <div className="flex flex-col items-center mt-10">
        {usarFuncao && (
          <InputForm x={x} setX={setX} handleAddPoint={handleAddPoint} />
        )}

        {!usarFuncao && (
          <>
            <label className="mr-2">
              x:
              <input
                type="text"
                value={x}
                onChange={(e) =>
                  setX(() => {
                    if (
                      e.target.value === "" ||
                      isNaN(Number(e.target.value))
                    ) {
                      return 0;
                    }
                    return Number(e.target.value);
                  })
                }
                className="ml-2 p-1 border rounded"
              />
            </label>
            <label className="mr-2">
              y:
              <input
                type="text"
                value={y}
                onChange={(e) =>
                  setY(() => {
                    if (
                      e.target.value === "" ||
                      isNaN(Number(e.target.value))
                    ) {
                      return 0;
                    }
                    return Number(e.target.value);
                  })
                }
                className="ml-2 p-1 border rounded"
              />
            </label>
            <button
              onClick={() => setPoints([...points, { x, y }])}
              className="ml-4 p-2 bg-green-500 text-white rounded"
            >
              Adicionar Ponto
            </button>
          </>
        )}

        <button
          onClick={handleCalculate}
          className="mt-6 p-2 bg-blue-500 text-white rounded"
        >
          Calcular
        </button>

        {result !== null && (
          <div className="mt-6">
            <h2 className="text-2xl">Resultado da Integral: {result}</h2>
            {error !== null && (
              <h3 className="text-xl">Erro Aproximado: {error}</h3>
            )}
            {data && (
              <div className="mt-6 w-full">
                <Line data={data} />
              </div>
            )}
          </div>
        )}

        <PointsList points={points} />

        {points.length > 0 && (
          <button
            onClick={() => setPoints(points.slice(0, -1))}
            className="mt-6 p-2 bg-red-500 text-white rounded"
          >
            Remover Último Ponto
          </button>
        )}
      </div>
    </main>
  );
}
