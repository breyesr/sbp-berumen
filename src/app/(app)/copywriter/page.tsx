// src/app/(app)/copywriter/page.tsx
import { listPersonas } from "@/lib/personaProvider";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";
import { CopywriterClient } from "@/components/copywriter/CopywriterClient";
import { PersonaOption, Platform } from "@/components/copywriter/types";
import { loadPlatforms } from "@/app/api/copywriter/route";

export const dynamic = "force-dynamic";

export default async function CopywriterPage() {
    const session = await auth();
    const isAdmin = isAdminRole(session?.user?.roles);

    // 1. Fetch data on the server
    const [personaList, platformsData] = await Promise.all([
        listPersonas({
            allowedClusters: session?.user?.clusters,
            isAdmin
        }),
        loadPlatforms()
    ]);

    // 2. Format personas
    const initialPersonas: PersonaOption[] = personaList.map((p) => ({
        id: p.id,
        name: p.role?.trim() && p.role !== p.name ? `${p.name} — ${p.role}` : p.name,
        cluster: p.cluster,
    }));

    const personaLookup: Record<string | number, string> = personaList.reduce((acc, p) => {
        acc[p.id] = p.name;
        return acc;
    }, {} as Record<string | number, string>);

    const initialPlatforms: Platform[] = (platformsData || []) as Platform[];

    // 3. Render client
    return (
        <CopywriterClient 
            initialPersonas={initialPersonas} 
            initialPlatforms={initialPlatforms}
            personaLookup={personaLookup}
        />
    );
}
