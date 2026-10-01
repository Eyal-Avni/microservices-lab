// @ts-check
// Docusaurus site for the Microservices Lab: publishes ../docs (docs-only mode) to GitHub Pages.
import { themes as prismThemes } from 'prism-react-renderer';

const REPO = 'https://github.com/Eyal-Avni/microservices-lab';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Microservices Lab',
  tagline: 'Learn microservices by running, breaking and fixing a real system',
  url: 'https://eyal-avni.github.io',
  baseUrl: '/microservices-lab/',
  organizationName: 'Eyal-Avni',
  projectName: 'microservices-lab',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  markdown: {
    format: 'detect',
    mermaid: true,
    hooks: { onBrokenMarkdownLinks: 'throw' },
  },
  future: {
    v4: true,
    // SWC's native "carrier" addons (@swc/core, @swc/html 1.16+) refuse to load when a parent folder grants
    // another account replacement rights, and C:\ on this project's dev machine does. Rspack and Lightning CSS
    // stay on; only the SWC steps fall back to their JavaScript equivalents. See docs/runbooks/toolchain-setup.md.
    faster: { swcJsLoader: false, swcJsMinimizer: false, swcHtmlMinimizer: false },
  },
  themes: ['@docusaurus/theme-mermaid'],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: '../docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          numberPrefixParser: false, // keep ids equal to file names (dates and ADR numbers stay intact)
          editUrl: ({ docPath }) => `${REPO}/edit/main/docs/${docPath}`,
        },
        blog: false,
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Microservices Lab',
        items: [
          { type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs' },
          { href: `${REPO}/blob/main/ROADMAP.md`, label: 'Roadmap', position: 'left' },
          { href: REPO, label: 'GitHub', position: 'right' },
        ],
      },
      footer: { style: 'dark', copyright: 'MIT licensed. Built with Docusaurus.' },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['csharp', 'protobuf', 'powershell', 'bash', 'ini', 'docker'],
      },
      mermaid: { theme: { light: 'neutral', dark: 'dark' } },
    }),
};

export default config;
