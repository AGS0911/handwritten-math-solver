interface MathSolutionProps {
      solution: {
      problem: string;
      solution: string;
    } | null;
  }
  
  export default function MathSolution({ solution }: MathSolutionProps) {
    if (!solution) return null;
  
    return (
      <div className="mt-8 p-6 border rounded-lg shadow-sm bg-white max-w-2xl mx-auto">
        <div className="mb-4 text-black">
          <h3 className="text-lg font-medium mb-2">Recognized Problem:</h3>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="font-mono text-lg">{solution.problem}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2 text-black">Solution:</h3>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="whitespace-pre-wrap font-mono text-sm text-green-700">{solution.solution}</p>
          </div>
        </div>
      </div>
    );
  }