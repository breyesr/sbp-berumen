// src/lib/types/shared.ts

/**
 * Represents a Persona selection option used across multiple features (Stress Test, Copywriter, etc.)
 */
export type PersonaOption = {
    id: string | number;
    name: string;
    role?: string;
    cluster?: string;
    has_rag?: boolean;
    is_active?: boolean;
    photo_url?: string;
};
