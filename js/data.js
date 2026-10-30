/* ------------------------------------------------------------------ *
 * OpenAlternatives — curated directory of open-source alternatives
 * to expensive SaaS tools.
 *
 * This file is the single source of truth for the directory. It is a
 * pure data module with no DOM access, wrapped in a small UMD pattern
 * so the exact same file loads under Node (`require`) and in a browser
 * (a `window` global). verify.js tests this real data.
 *
 * A tool's shape:
 *
 *   {
 *     id:        "gitea",            // stable, lowercase, unique
 *     name:      "Gitea",
 *     category:  "dev-tools",        // key into CATEGORIES
 *     replaces:  "GitHub Team",      // the expensive SaaS it replaces
 *     price:     4,                  // per-seat per-month USD of the SaaS
 *     license:   "MIT",              // OSS license the tool ships under
 *     repo:      "https://github.com/go-gitea/gitea",
 *     site:      "https://gitea.com",
 *     stars:     47,                 // rough GitHub stars, in thousands
 *     blurb:     "Self-hosted Git forge...",
 *     popular:   true                // shown first in the default sort
 *   }
 *
 * `price` is deliberately the *expensive* SaaS price in USD per seat
 * per month. That is the number the savings calculator needs.
 * ------------------------------------------------------------------ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.OAData = factory(root);
  }
})(typeof self !== 'undefined' ? self : global, function (root) {
  'use strict';

  // Display order is intentional: these are the eight buckets the
  // directory is browsed by. Keep in sync with verify.js and the UI.
  var CATEGORIES = [
    { id: 'dev-tools',   label: 'Dev tools' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'communication', label: 'Communication' },
    { id: 'creative',    label: 'Creative' },
    { id: 'analytics',   label: 'Analytics' },
    { id: 'crm',         label: 'CRM' },
    { id: 'marketing',   label: 'Marketing' },
    { id: 'design',      label: 'Design' }
  ];

  var TOOLS = [
    // ---------------- dev-tools ----------------
    {
      id: 'vscode', name: 'Visual Studio Code', category: 'dev-tools',
      replaces: 'Cursor', price: 20, license: 'MIT',
      repo: 'https://github.com/microsoft/vscode', site: 'https://code.visualstudio.com',
      stars: 170, popular: true,
      blurb: 'The editor that took over the world. AI-powered code editing and debugging with an enormous extension market — free, no per-seat subscription.'
    },
    {
      id: 'gitea', name: 'Gitea', category: 'dev-tools',
      replaces: 'GitHub Team', price: 4, license: 'MIT',
      repo: 'https://github.com/go-gitea/gitea', site: 'https://gitea.com',
      stars: 47, popular: true,
      blurb: 'A self-hosted Git forge: repositories, issues, pull requests, and CI in one lightweight binary that runs on a single server.'
    },
    {
      id: 'supabase', name: 'Supabase', category: 'dev-tools',
      replaces: 'Firebase', price: 25, license: 'Apache-2.0',
      repo: 'https://github.com/supabase/supabase', site: 'https://supabase.com',
      stars: 76, popular: true,
      blurb: 'Open-source Firebase: Postgres database, auth, storage, realtime, and auto-generated APIs — self-host or use their free tier.'
    },
    {
      id: 'appwrite', name: 'Appwrite', category: 'dev-tools',
      replaces: 'Firebase', price: 25, license: 'BSD-3-Clause',
      repo: 'https://github.com/appwrite/appwrite', site: 'https://appwrite.io',
      stars: 47,
      blurb: 'Backend-as-a-service with database, auth, storage, functions, and realtime — a drop-in Firebase-style stack you can host yourself.'
    },
    {
      id: 'nocodb', name: 'NocoDB', category: 'dev-tools',
      replaces: 'Airtable', price: 20, license: 'AGPL-3.0',
      repo: 'https://github.com/nocodb/nocodb', site: 'https://nocodb.com',
      stars: 50,
      blurb: 'Turns any SQL database into a spreadsheet-style API and app builder — Airtable no-code feel without the per-seat cost.'
    },
    {
      id: 'code-server', name: 'code-server', category: 'dev-tools',
      replaces: 'Gitpod', price: 25, license: 'MIT',
      repo: 'https://github.com/coder/code-server', site: 'https://coder.com',
      stars: 69,
      blurb: 'Runs VS Code in the browser on your own server, so a whole team gets a shared, always-on dev environment for the price of one box.'
    },
    {
      id: 'zulip', name: 'Zulip', category: 'dev-tools',
      replaces: 'Slack', price: 8.75, license: 'Apache-2.0',
      repo: 'https://github.com/zulip/zulip', site: 'https://zulip.com',
      stars: 21,
      blurb: 'Topic-based threaded chat designed for engineering teams. The single most under-rated Slack alternative, fully self-hostable.'
    },

    // ---------------- productivity ----------------
    {
      id: 'nextcloud', name: 'Nextcloud', category: 'productivity',
      replaces: 'Google Workspace', price: 6, license: 'AGPL-3.0',
      repo: 'https://github.com/nextcloud/server', site: 'https://nextcloud.com',
      stars: 28, popular: true,
      blurb: 'Self-hosted files, calendar, contacts, notes, and office documents — the whole collaboration suite, under your own roof.'
    },
    {
      id: 'joplin', name: 'Joplin', category: 'productivity',
      replaces: 'Evernote', price: 10, license: 'AGPL-3.0',
      repo: 'https://github.com/laurent22/joplin', site: 'https://joplinapp.org',
      stars: 47,
      blurb: 'An open-source note-taking app with markdown, notebooks, tags, end-to-end encryption, and sync to your own storage.'
    },
    {
      id: 'appflowy', name: 'AppFlowy', category: 'productivity',
      replaces: 'Notion', price: 10, license: 'AGPL-3.0',
      repo: 'https://github.com/AppFlowy-IO/AppFlowy', site: 'https://appflowy.io',
      stars: 59,
      blurb: 'A Notion-style workspace — blocks, databases, kanban, and docs — built with Flutter and Rust. Local-first, no account needed.'
    },
    {
      id: 'logseq', name: 'Logseq', category: 'productivity',
      replaces: 'Roam Research', price: 15, license: 'AGPL-3.0',
      repo: 'https://github.com/logseq/logseq', site: 'https://logseq.com',
      stars: 34,
      blurb: 'Outliner + note-taking built on bidirectional links and local markdown files. The Roam-style graph is yours to keep.'
    },
    {
      id: 'onlyoffice', name: 'ONLYOFFICE', category: 'productivity',
      replaces: 'Microsoft 365', price: 12.50, license: 'AGPL-3.0',
      repo: 'https://github.com/ONLYOFFICE/DesktopEditors', site: 'https://www.onlyoffice.com',
      stars: 2,
      blurb: 'A full office suite — documents, spreadsheets, presentations — with high-fidelity .docx/.xlsx/.pptx compatibility.'
    },
    {
      id: 'calcom', name: 'Cal.com', category: 'productivity',
      replaces: 'Calendly', price: 12, license: 'AGPL-3.0',
      repo: 'https://github.com/calcom/cal.com', site: 'https://cal.com',
      stars: 33,
      blurb: 'Open-source scheduling: booking links, round-robin, and video integrations, self-hosted so nobody skims your meetings.'
    },
    {
      id: 'openproject', name: 'OpenProject', category: 'productivity',
      replaces: 'Asana', price: 10.99, license: 'GPL-3.0',
      repo: 'https://github.com/opf/openproject', site: 'https://www.openproject.org',
      stars: 11,
      blurb: 'Full project management — tasks, Gantt, boards, time tracking, and Agile sprints — built for teams that own their data.'
    },
    {
      id: 'bitwarden', name: 'Bitwarden', category: 'productivity',
      replaces: '1Password', price: 4, license: 'GPL-3.0',
      repo: 'https://github.com/bitwarden/server', site: 'https://bitwarden.com',
      stars: 16,
      blurb: 'Open-source password manager with vaults, sharing, and a self-hostable server. Audit your own secrets instead of trusting a vendor.'
    },
    {
      id: 'kanboard', name: 'Kanboard', category: 'productivity',
      replaces: 'Trello', price: 6, license: 'MIT',
      repo: 'https://github.com/kanboard/kanboard', site: 'https://kanboard.org',
      stars: 8,
      blurb: 'Free and self-hosted kanban board with subtasks, due dates, and time tracking. Small, fast, and dependency-light.'
    },

    // ---------------- communication ----------------
    {
      id: 'mattermost', name: 'Mattermost', category: 'communication',
      replaces: 'Slack', price: 8.75, license: 'MIT',
      repo: 'https://github.com/mattermost/mattermost', site: 'https://mattermost.com',
      stars: 31, popular: true,
      blurb: 'The Slack-style team messaging platform you can run entirely on your own infrastructure — channels, threads, and integrations included.'
    },
    {
      id: 'rocket-chat', name: 'Rocket.Chat', category: 'communication',
      replaces: 'Slack', price: 8.75, license: 'MIT',
      repo: 'https://github.com/RocketChat/Rocket.Chat', site: 'https://www.rocket.chat',
      stars: 41,
      blurb: 'Self-hosted team chat with video calls, file sharing, and live chat for customers. One install covers both internal and external comms.'
    },
    {
      id: 'jitsi', name: 'Jitsi Meet', category: 'communication',
      replaces: 'Zoom', price: 13, license: 'Apache-2.0',
      repo: 'https://github.com/jitsi/jitsi-meet', site: 'https://jitsi.org',
      stars: 24, popular: true,
      blurb: 'Encrypted group video calls in the browser. No account, no download, no per-host license — point your own Jitsi server at your domain.'
    },
    {
      id: 'element', name: 'Element', category: 'communication',
      replaces: 'Slack', price: 8.75, license: 'Apache-2.0',
      repo: 'https://github.com/element-hq/element-web', site: 'https://element.io',
      stars: 11,
      blurb: 'The flagship Matrix client. End-to-end encrypted rooms with real federation, so different servers and companies can talk securely.'
    },
    {
      id: 'bigbluebutton', name: 'BigBlueButton', category: 'communication',
      replaces: 'Zoom', price: 13, license: 'LGPL-3.0',
      repo: 'https://github.com/bigbluebutton/bigbluebutton', site: 'https://bigbluebutton.org',
      stars: 10,
      blurb: 'Web conferencing built for teaching: breakout rooms, shared whiteboard, polls, and recording — self-hosted for classes and trainings.'
    },

    // ---------------- creative ----------------
    {
      id: 'gimp', name: 'GIMP', category: 'creative',
      replaces: 'Adobe Photoshop', price: 22, license: 'GPL-3.0',
      repo: 'https://github.com/GIMP/GIMP', site: 'https://www.gimp.org',
      stars: 11, popular: true,
      blurb: 'The classic open-source image editor: layers, masks, brushes, and scripting. Photoshop-grade raster work at zero dollars.'
    },
    {
      id: 'inkscape', name: 'Inkscape', category: 'creative',
      replaces: 'Adobe Illustrator', price: 22, license: 'GPL-3.0',
      repo: 'https://github.com/inkscape/inkscape', site: 'https://inkscape.org',
      stars: 6,
      blurb: 'Professional vector graphics — paths, gradients, text, and SVG export. Illustrator alternatives without the subscription.'
    },
    {
      id: 'krita', name: 'Krita', category: 'creative',
      replaces: 'Adobe Fresco', price: 10, license: 'GPL-3.0',
      repo: 'https://github.com/KDE/krita', site: 'https://krita.org',
      stars: 8,
      blurb: 'A painting studio built for illustrators: brushes, stabilizers, and a distraction-free canvas. Made by artists, free for artists.'
    },
    {
      id: 'blender', name: 'Blender', category: 'creative',
      replaces: 'Cinema 4D', price: 50, license: 'GPL-3.0',
      repo: 'https://github.com/blender/blender', site: 'https://www.blender.org',
      stars: 13, popular: true,
      blurb: 'The complete 3D suite — modelling, sculpting, animation, simulation, compositing, and a production-grade renderer. Free forever.'
    },
    {
      id: 'audacity', name: 'Audacity', category: 'creative',
      replaces: 'Adobe Audition', price: 22, license: 'GPL-3.0',
      repo: 'https://github.com/audacity/audacity', site: 'https://www.audacityteam.org',
      stars: 12,
      blurb: 'Multi-track audio recording and editing with effects, noise reduction, and export to any format. The audio workhorse.'
    },
    {
      id: 'obs', name: 'OBS Studio', category: 'creative',
      replaces: 'Adobe Premiere', price: 22, license: 'GPL-2.0',
      repo: 'https://github.com/obsproject/obs-studio', site: 'https://obsproject.com',
      stars: 60,
      blurb: 'Screen recording and live streaming with scene switching, compositing, and virtual cameras. Streams and records, free.'
    },
    {
      id: 'darktable', name: 'darktable', category: 'creative',
      replaces: 'Adobe Lightroom', price: 10, license: 'GPL-3.0',
      repo: 'https://github.com/darktable-org/darktable', site: 'https://www.darktable.org',
      stars: 1,
      blurb: 'RAW photo development and editing — a non-destructive, colour-managed alternative to Lightroom for photographers.'
    },
    {
      id: 'olive', name: 'Olive', category: 'creative',
      replaces: 'Adobe Premiere', price: 22, license: 'GPL-3.0',
      repo: 'https://github.com/olive-editor/olive', site: 'https://olivevideoeditor.org',
      stars: 2,
      blurb: 'A free non-linear video editor with a node-based compositor. Still young, but a genuinely open Premiere replacement.'
    },

    // ---------------- analytics ----------------
    {
      id: 'posthog', name: 'PostHog', category: 'analytics',
      replaces: 'Amplitude', price: 49, license: 'MIT',
      repo: 'https://github.com/PostHog/posthog', site: 'https://posthog.com',
      stars: 23, popular: true,
      blurb: 'Product analytics, session replay, feature flags, and surveys in one MIT-licensed product. Self-host and keep your event data.'
    },
    {
      id: 'matomo', name: 'Matomo', category: 'analytics',
      replaces: 'Adobe Analytics', price: 150, license: 'GPL-3.0',
      repo: 'https://github.com/matomo-org/matomo', site: 'https://matomo.org',
      stars: 20, popular: true,
      blurb: 'The Google Analytics alternative that keeps 100% of the data on your servers. E-commerce, funnels, heatmaps, and privacy built in.'
    },
    {
      id: 'grafana', name: 'Grafana', category: 'analytics',
      replaces: 'Datadog', price: 15, license: 'AGPL-3.0',
      repo: 'https://github.com/grafana/grafana', site: 'https://grafana.com',
      stars: 64,
      blurb: 'The standard for dashboards and observability. Connect Prometheus, Postgres, and dozens of sources to one open charts panel.'
    },
    {
      id: 'metabase', name: 'Metabase', category: 'analytics',
      replaces: 'Tableau', price: 70, license: 'AGPL-3.0',
      repo: 'https://github.com/metabase/metabase', site: 'https://www.metabase.com',
      stars: 40, popular: true,
      blurb: 'Ask questions of your database in plain language and get charts and dashboards back. A BI tool for people, not just analysts.'
    },
    {
      id: 'superset', name: 'Apache Superset', category: 'analytics',
      replaces: 'Looker', price: 50, license: 'Apache-2.0',
      repo: 'https://github.com/apache/superset', site: 'https://superset.apache.org',
      stars: 62,
      blurb: 'A data exploration and visualization platform that scales to big warehouses. Slice, dice, and dashboards without a licence fee.'
    },
    {
      id: 'umami', name: 'Umami', category: 'analytics',
      replaces: 'Plausible Analytics', price: 9, license: 'MIT',
      repo: 'https://github.com/umami-software/umami', site: 'https://umami.is',
      stars: 22,
      blurb: 'Lightweight, privacy-first website analytics. One small server tracks millions of page views — cookie-free and GDPR-friendly.'
    },

    // ---------------- crm ----------------
    {
      id: 'twenty', name: 'Twenty', category: 'crm',
      replaces: 'HubSpot CRM', price: 20, license: 'AGPL-3.0',
      repo: 'https://github.com/twentyhq/twenty', site: 'https://twenty.com',
      stars: 26, popular: true,
      blurb: 'A modern, open-source CRM with a Notion-clean interface: contacts, companies, deals, and pipeline, self-hosted.'
    },
    {
      id: 'espocrm', name: 'EspoCRM', category: 'crm',
      replaces: 'Salesforce', price: 75, license: 'AGPL-3.0',
      repo: 'https://github.com/espocrm/espocrm', site: 'https://www.espocrm.com',
      stars: 2,
      blurb: 'A lightweight, highly customisable CRM — contacts, accounts, opportunities, emails, and a BPM-style workflow engine.'
    },
    {
      id: 'suitecrm', name: 'SuiteCRM', category: 'crm',
      replaces: 'Salesforce', price: 75, license: 'AGPL-3.0',
      repo: 'https://github.com/salesagility/SuiteCRM', site: 'https://suitecrm.com',
      stars: 5,
      blurb: 'The community fork of SugarCRM: sales, marketing, service, and reporting modules that mature companies actually run.'
    },
    {
      id: 'monica', name: 'Monica', category: 'crm',
      replaces: 'Cloze', price: 25, license: 'AGPL-3.0',
      repo: 'https://github.com/monicahq/monica', site: 'https://www.monicahq.com',
      stars: 22,
      blurb: 'A personal relationship manager: keep track of contacts, reminders, and how you know everyone — your own private CRM.'
    },
    {
      id: 'frappe-crm', name: 'Frappe CRM', category: 'crm',
      replaces: 'Pipedrive', price: 24, license: 'GPL-3.0',
      repo: 'https://github.com/frappe/crm', site: 'https://crm.frappe.io',
      stars: 3,
      blurb: 'A simple, self-hosted CRM from the Frappe/ERPNext team — deals, contacts, and activity tracking without the bloat.'
    },

    // ---------------- marketing ----------------
    {
      id: 'mautic', name: 'Mautic', category: 'marketing',
      replaces: 'HubSpot Marketing', price: 20, license: 'GPL-3.0',
      repo: 'https://github.com/mautic/mautic', site: 'https://www.mautic.org',
      stars: 7, popular: true,
      blurb: 'Marketing automation: landing pages, forms, email campaigns, lead scoring, and behavioural triggers — all self-hosted.'
    },
    {
      id: 'listmonk', name: 'listmonk', category: 'marketing',
      replaces: 'Mailchimp', price: 13, license: 'AGPL-3.0',
      repo: 'https://github.com/knadh/listmonk', site: 'https://listmonk.app',
      stars: 15,
      blurb: 'A fast, self-hosted newsletter and mailing-list manager with a clean web UI. Send millions of emails from one small binary.'
    },
    {
      id: 'ghost', name: 'Ghost', category: 'marketing',
      replaces: 'Substack', price: 10, license: 'MIT',
      repo: 'https://github.com/TryGhost/Ghost', site: 'https://ghost.org',
      stars: 47, popular: true,
      blurb: 'Professional publishing and membership platform. Own your audience, your subscription revenue, and your email list.'
    },
    {
      id: 'directus', name: 'Directus', category: 'marketing',
      replaces: 'Contentful', price: 40, license: 'BSL-1.1',
      repo: 'https://github.com/directus/directus', site: 'https://directus.io',
      stars: 28,
      blurb: 'Headless CMS over any SQL database. Model content, serve it over a REST/GraphQL API, and let editors publish from a clean UI.'
    },
    {
      id: 'strapi', name: 'Strapi', category: 'marketing',
      replaces: 'Contentful', price: 40, license: 'MIT',
      repo: 'https://github.com/strapi/strapi', site: 'https://strapi.io',
      stars: 64,
      blurb: 'The leading open-source headless CMS — content types, roles, plugins, and a GraphQL/REST API you control end to end.'
    },

    // ---------------- design ----------------
    {
      id: 'penpot', name: 'Penpot', category: 'design',
      replaces: 'Figma', price: 16, license: 'MPL-2.0',
      repo: 'https://github.com/penpot/penpot', site: 'https://penpot.app',
      stars: 33, popular: true,
      blurb: 'The open-source design and prototyping platform. Real-time collaborative vector design in the browser, self-hosted.'
    },
    {
      id: 'excalidraw', name: 'Excalidraw', category: 'design',
      replaces: 'Lucidchart', price: 8, license: 'MIT',
      repo: 'https://github.com/excalidraw/excalidraw', site: 'https://excalidraw.com',
      stars: 88,
      blurb: 'Hand-drawn style whiteboard diagrams. Sketch flows, wireframes, and architecture on an infinite canvas — and share it freely.'
    },
    {
      id: 'drawio', name: 'draw.io', category: 'design',
      replaces: 'Microsoft Visio', price: 10, license: 'Apache-2.0',
      repo: 'https://github.com/jgraph/drawio', site: 'https://app.diagrams.net',
      stars: 41,
      blurb: 'The diagram tool you already use, open-source: flowcharts, org charts, network and UML diagrams that save straight to your own storage.'
    },
    {
      id: 'tldraw', name: 'tldraw', category: 'design',
      replaces: 'Miro', price: 10, license: 'Apache-2.0',
      repo: 'https://github.com/tldraw/tldraw', site: 'https://tldraw.com',
      stars: 38,
      blurb: 'A tiny, fast infinite canvas for whiteboards and diagrams. Embed it or run the full editor — free and open.'
    },
    {
      id: 'freecad', name: 'FreeCAD', category: 'design',
      replaces: 'AutoCAD', price: 235, license: 'LGPL-2.1',
      repo: 'https://github.com/FreeCAD/FreeCAD', site: 'https://www.freecad.org',
      stars: 20,
      blurb: 'Parametric 3D CAD for real engineering — part modelling, assemblies, and drawings — without an AutoCAD seat.'
    }
  ];

  /** A copy of TOOLS with a stable canonical order (popular first, then name). */
  function defaultSort(tools) {
    return (tools || TOOLS).slice().sort(function (a, b) {
      if (!!a.popular !== !!b.popular) { return a.popular ? -1 : 1; }
      return a.name.localeCompare(b.name);
    });
  }

  function categoryLabel(id) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === id) { return CATEGORIES[i].label; }
    }
    return id;
  }

  return {
    CATEGORIES: CATEGORIES,
    TOOLS: TOOLS,
    categoryLabel: categoryLabel,
    defaultSort: defaultSort
  };
});
