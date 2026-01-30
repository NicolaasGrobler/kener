import fs from 'fs-extra';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

try {
  console.log('Converting openapi.yaml to openapi.json...');

  // Read YAML file
  const yamlPath = join(rootDir, 'openapi.yaml');
  const yamlContent = fs.readFileSync(yamlPath, 'utf8');

  // Parse YAML to JS object
  const openApiSpec = yaml.load(yamlContent);

  // Write as formatted JSON
  const jsonPath = join(rootDir, 'openapi.json');
  fs.writeFileSync(jsonPath, JSON.stringify(openApiSpec, null, 2), 'utf8');

  console.log('✓ Successfully converted openapi.yaml to openapi.json');
} catch (error) {
  console.error('✗ Error converting YAML to JSON:', error.message);
  process.exit(1);
}
