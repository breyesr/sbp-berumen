// src/app/(app)/stresstest/page.tsx
import { listPersonas } from "@/lib/personaProvider";
import { listChallengeLevels } from "@/lib/challengeLevels";
import { LinearStressTestClient } from "@/components/stress-test/LinearStressTestClient";
import { PersonaOption, ChallengeLevelOption } from "@/components/stress-test/types";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function LinearStressTestPage() {
    const session = await auth();
    const isAdmin = isAdminRole(session?.user?.roles);

    const [personaList, levelList] = await Promise.all([
        listPersonas({
            allowedClusters: session?.user?.clusters,
            isAdmin
        }),
        listChallengeLevels()
    ]);

    const initialPersonas: PersonaOption[] = personaList.map((item) => ({
        id: item.id,
        name: item.role?.trim() ? `${item.name} — ${item.role}` : item.name,
        cluster: item.cluster,
        photo_url: item.photo_url,
    }));

    const personaLookup: Record<string, string> = personaList.reduce((acc, p) => {
        acc[p.id] = p.name;
        return acc;
    }, {} as Record<string, string>);

    const initialLevels: ChallengeLevelOption[] = levelList.map((item) => ({
        id: item.id,
        name: item.name,
        detail: item.detail,
        intensity: item.intensity,
    }));

    return (
        <LinearStressTestClient 
            initialPersonas={initialPersonas} 
            initialLevels={initialLevels}
            personaLookup={personaLookup}
        />
    );
}
