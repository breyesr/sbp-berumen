import fs from 'node:fs/promises';
import path from 'node:path';

const PLATFORMS_DIR = path.join(process.cwd(), 'data/copywriter/digital-platforms');

// Mapping of long/descriptive English fields to standardized technical keys
const fieldStandardizationMap: Record<string, string> = {
  "SHORT_TITLE": "TITLE",
  "DESCRIPTION_OPTIONAL": "DESCRIPTION",
  "IMMEDIATE_VISUAL_OR_VERBAL_HOOK": "HOOK",
  "IMMEDIATE_VISUAL_HOOK": "HOOK",
  "STRONG_VISUAL_HOOK_IN_THE_FIRST_1_3_SECONDS": "HOOK",
  "SINGLE_FOCUSED_IDEA": "BODY",
  "SINGLE_CLEAR_QUESTION": "BODY",
  "ON_SCREEN_TEXT_OR_SUBTITLES": "ONSCREEN_TEXT",
  "SUBTITLES_OR_ON_SCREEN_TEXT_FOR_SOUND_OFF_VIEWING": "ONSCREEN_TEXT",
  "AT_LEAST_ONE_CTA": "CTA",
  "EXPLICIT_CTA": "CTA",
  "AT_LEAST_ONE_EXPLICIT_CTA": "CTA",
  "AT_LEAST_ONE_DIRECT_CTA": "CTA",
  "CLEAR_INSIGHT_OR_QUESTION_IN_THE_FIRST_TWO_LINES": "HOOK",
  "BUSINESS_RELEVANCE_OR_TAKEAWAY": "BODY",
  "CLEAR_VALUE_STATEMENT": "BODY",
  "CLEAR_ON_SCREEN_VALUE_STATEMENT_OR_PROMISE": "BODY",
  "HOOK_IN_THE_FIRST_LINE_OF_THE_CAPTION": "HOOK",
  "VISUAL_THAT_CLEARLY_COMMUNICATES_THE_MAIN_IDEA": "VISUAL",
  "AT_LEAST_ONE_CLEAR_VISUAL_FOCUS": "VISUAL",
  "ONE_MICRO_ACTION_PROMPT_STICKER_OR_TAP_BEHAVIOR": "STICKER_TYPE",
  "READABLE_ON_SCREEN_TEXT_IF_USED": "ONSCREEN_TEXT",
  "TAGGED_ACCOUNTS_OPTIONAL": "TAGGED_ACCOUNTS"
};

async function standardize() {
  const platforms = await fs.readdir(PLATFORMS_DIR);

  for (const platform of platforms) {
    const platformPath = path.join(PLATFORMS_DIR, platform);
    const stats = await fs.stat(platformPath);
    if (!stats.isDirectory()) continue;

    const formatsPath = path.join(platformPath, 'formats');
    try {
      const formatFiles = await fs.readdir(formatsPath);
      for (const file of formatFiles) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(formatsPath, file);
        const content = JSON.parse(await fs.readFile(filePath, 'utf8'));

        if (content.required_generation_elements) {
            content.required_generation_elements = content.required_generation_elements.map((el: string) => {
                const normalized = el.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').toUpperCase();
                // Check direct map or if it matches a known prefix
                for (const [key, value] of Object.entries(fieldStandardizationMap)) {
                    if (normalized === key || normalized.includes(key) && key.length > 8) {
                        return value;
                    }
                }
                // Default normalization if no map hit (e.g. CAPTION -> CAPTION)
                if (normalized.includes('HOOK')) return 'HOOK';
                if (normalized.includes('CTA')) return 'CTA';
                if (normalized.includes('VISUAL')) return 'VISUAL';
                if (normalized.includes('CAPTION')) return 'CAPTION';
                if (normalized.includes('TITLE')) return 'TITLE';
                
                return normalized;
            });
            // Remove duplicates
            content.required_generation_elements = Array.from(new Set(content.required_generation_elements));
        }

        await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');
      }
    } catch (e) {
      // Ignore
    }
  }
}

standardize().then(() => console.log('✅ Fields Standardized')).catch(console.error);
