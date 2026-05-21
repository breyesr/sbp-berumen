import { useState, useCallback } from "react";

/**
 * Hook to manage linear workflow/wizard state.
 * Standardizes step navigation, completion tracking, and automatic scrolling to step sections.
 */
export function useWorkflowState<T extends string>(initialStep: T) {
    const [currentStep, setCurrentStep] = useState<T>(initialStep);
    const [completedSteps, setCompletedSteps] = useState<T[]>([]);

    const goToStep = useCallback((step: T, scroll = true, ref?: React.RefObject<HTMLElement | null>) => {
        setCurrentStep(step);
        if (scroll) {
            if (ref?.current) {
                ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }, []);

    const completeStep = useCallback((step: T) => {
        setCompletedSteps(prev => {
            if (prev.includes(step)) return prev;
            return [...prev, step];
        });
    }, []);

    const isCompleted = useCallback((step: T) => {
        return completedSteps.includes(step);
    }, [completedSteps]);

    const resetWorkflow = useCallback((newInitialStep?: T) => {
        if (newInitialStep) setCurrentStep(newInitialStep);
        setCompletedSteps([]);
    }, []);

    return {
        currentStep,
        setCurrentStep,
        completedSteps,
        setCompletedSteps,
        goToStep,
        completeStep,
        isCompleted,
        resetWorkflow
    };
}
