'use client';

import { useState } from 'react';


import ImageUploader from '../app/components/ImageUploader';
import MathSolution from '../app/components/MathSolution';

export default function Home() {
  const [solution, setSolution] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">
          AI Math Problem Solver
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Upload a handwritten math problem and get the solution instantly
        </p>
        
        <ImageUploader 
          onSolutionReceived={setSolution}
          setIsLoading={setIsLoading}
        />
        
        {isLoading && (
          <div className="text-center mt-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Processing your math problem...</p>
          </div>
        )}
        
        <MathSolution solution={solution} />
      </div>
    </main>
  );
}