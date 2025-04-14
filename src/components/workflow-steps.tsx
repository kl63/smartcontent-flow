'use client';

import { CheckCircle2, Circle } from "lucide-react";
import { useContentStore } from "@/lib/store";

// This component displays the workflow steps in the content generation process
const WorkflowSteps = () => {
  const { currentStep } = useContentStore();

  // Steps in the workflow process
  const steps = [
    { id: 1, name: "Content Idea", description: "Enter your LinkedIn topic" },
    { id: 2, name: "Generate Content", description: "AI creates professional text" },
    { id: 3, name: "Add Visuals", description: "Match with relevant image" },
    { id: 4, name: "Post to LinkedIn", description: "Share directly via Make.com" },
  ];

  return (
    <div className="py-4">
      <div className="flex flex-col md:flex-row gap-3 justify-between mx-auto max-w-2xl">
        {steps.map((step, index) => {
          // Determine the status of each step
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center text-center">
              <div className="relative flex items-center justify-center">
                {isCompleted ? (
                  <CheckCircle2 className="h-8 w-8 text-[#10B981]" />
                ) : (
                  <Circle className={`h-8 w-8 ${isActive ? 'text-[#1E40AF]' : 'text-[#6B7280]'}`} />
                )}
                <span className={`absolute text-xs font-semibold ${isCompleted ? 'text-white' : ''}`}>
                  {isCompleted ? '✓' : step.id}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`hidden md:block w-12 h-[2px] ${
                  isCompleted ? 'bg-[#10B981]' : 'bg-gray-200'
                } mx-2`} />
              )}
              
              <div className="mt-2">
                <p className={`text-sm font-medium ${
                  isActive ? 'text-[#1E40AF]' : isCompleted ? 'text-[#10B981]' : 'text-[#111827]'
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-[#6B7280]">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowSteps;
