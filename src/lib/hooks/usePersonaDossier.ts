import { useState, useEffect, useCallback } from "react";

/**
 * Hook to fetch and manage Persona Dossier data (Synthesis, Pains, Goals).
 * Centralizes intelligence fetching for use in sidebars and dossiers.
 */
export function usePersonaDossier(personaId: string | number | null | undefined) {
    const [dossier, setDossier] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDossier = useCallback(async (id: string | number) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/personas/${encodeURIComponent(id)}`);
            if (!res.ok) throw new Error("Failed to fetch persona data");
            const data = await res.json();
            if (data.persona) {
                setDossier(data.persona);
                return data.persona;
            }
        } catch (err) {
            console.error("Dossier fetch failed", err);
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
        return null;
    }, []);

    useEffect(() => {
        if (personaId) {
            fetchDossier(personaId);
        } else {
            setDossier(null);
        }
    }, [personaId, fetchDossier]);

    return {
        dossier,
        isLoading,
        error,
        fetchDossier,
        setDossier
    };
}
