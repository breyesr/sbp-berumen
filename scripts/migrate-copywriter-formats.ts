import fs from 'node:fs/promises';
import path from 'node:path';

const PLATFORMS_DIR = path.join(process.cwd(), 'data/copywriter/digital-platforms');

async function migrate() {
  const platforms = await fs.readdir(PLATFORMS_DIR);

  for (const platform of platforms) {
    const platformPath = path.join(PLATFORMS_DIR, platform);
    const stats = await fs.stat(platformPath);
    if (!stats.isDirectory()) continue;

    const formatsPath = path.join(platformPath, 'formats');
    try {
      const formatFiles = await fs.readdir(formatsPath);
      for (const file of formatFiles) {
        if (!file.endsWith('.json') || file.startsWith('temp-')) continue;

        const filePath = path.join(formatsPath, file);
        const content = JSON.parse(await fs.readFile(filePath, 'utf8'));

        console.log(`Migrating ${platform}/${file}...`);

        // Mapping Logic: Transform legacy fields to new 2.0 structure
        const migrated = {
          id: content.id,
          platform_id: content.platform_id,
          name: content.name, // Crucial for UI
          content_type_group: content.content_type_group,
          strategic_objective: content.primary_goal_vibe || content.platform_purpose || "n/a",
          
          system_directives: {
            tone: content.tone_preference ? [content.tone_preference] : [],
            copywriting_rules: [
              content.copy_guidelines?.copy_best_practices,
              content.copy_guidelines?.caption_structure_hint,
              content.on_screen_text_guidelines?.primary_role,
              ...(content.on_screen_text_guidelines?.best_practices || []),
              content.hashtags_mentions?.hashtag_strategy,
              content.hashtags_mentions?.mention_strategy,
            ].filter(Boolean)
          },

          required_generation_elements: Array.from(new Set([
            ...(content.output_fields || []),
            ...(content.required_elements || [])
          ])).filter(Boolean),

          hard_constraints: [
            ...(content.disallowed_practices || []),
            content.technical_constraints?.recommended_aspect_ratio ? `Aspect ratio MUST be ${content.technical_constraints.recommended_aspect_ratio}` : null,
            content.technical_constraints?.max_chars_caption ? `NEVER exceed ${content.technical_constraints.max_chars_caption} characters` : null,
          ].filter(Boolean)
        };

        await fs.writeFile(filePath, JSON.stringify(migrated, null, 2), 'utf8');
      }
    } catch (e) {
      console.log(`Skipping formats for ${platform}`);
    }
  }
}

migrate().then(() => console.log('✅ Migration complete.')).catch(console.error);
