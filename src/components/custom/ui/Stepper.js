'use client';

export default function Stepper({ steps = [], currentStep = 0 }) {
  return (
    <div className="relative flex items-center w-full mb-6">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={index} className="flex-1 flex flex-col items-center relative z-10">
            {/* Circle */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold z-10
                ${isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-blue-600 text-white' :
                    'bg-gray-300 text-gray-700'}
              `}
            >
              {index + 1}
            </div>

            {/* Step label */}
            <p className={`text-xs mt-2 text-center ${isCompleted || isActive ? 'text-gray-800' : 'text-gray-400'}`}>
              {step}
            </p>

            {/* Line (only between steps) */}
            {index !== steps.length - 1 && (
              <div
                className={`absolute top-4 left-1/2 w-full h-0.5 z-0 
    ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-400' : 'bg-gray-300'}
  `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
