import { initVersionWatcher } from './version.js';

{{ $L := "{{" }}
{{ $R := "}}" }}

const SITE_VERSION = "{{ .Site.Params.siteVersion }}";

window.CMS.registerEditorComponent({
  id: "hugo-img",
  label: "Image Picker",
  fields: [
    { name: "src", label: "Image", widget: "image" },
    { name: "alt", label: "Alt Text", widget: "string" },
    { name: "width", label: "Width (e.g. 600x)", widget: "string", default: "800x" }
  ],

  // Pattern uses backticks + escaped brackets
  pattern: new RegExp(`${'{{ $L }}'}<img src="([^"]*)" alt="([^"]*)" width="([^"]*)" >${'{{ $R }}'}`),
  
  fromBlock: function(match) {
    return { src: match[1], alt: match[2], width: match[3] };
  },
  toBlock: function(obj) {
    return `${'{{ $L }}'}<img src="${obj.src}" alt="${obj.alt}" width="${obj.width}" >${'{{ $R }}'}`;
  },
  toPreview: function(obj, getAsset) {
    const asset = getAsset(obj.src);
    return `<img src="${asset || ''}" style="max-width:100%; height:auto;" alt="${obj.alt}">`;
  }
});

/* --- COLLECTION DEFINITIONS --- */

const menuCollection = {
    name: "menu-configuration",
    label: "Menu Configuration",
    delete: false,
    editor: { preview: false },
    files: [
        {
            label: "Maintain Menu",
            name: "menu",
            file: "data/menu.yml",
            fields: [
                {
                    label: "Menu Items",
                    name: "main",
                    widget: "list",
                    summary: `${'{{ $L }}'}fields.name${'{{ $R }}'}`,
                    fields: [
                        { label: "Link Name", name: "name", widget: "string" },
                        { label: "URL", name: "url", widget: "string" }
                    ]
                }
            ]
        }
    ]
};

const eventsCollection = {
    name: "events",
    label: "Events",
    folder: "content/events",
    create: true,
    slug: `${'{{ $L }}'}slug${'{{ $R }}'}`,
    editor: { preview: false },
    fields: [
        { label: "Title", name: "title", widget: "string" },
        { label: "Event Date", name: "date", widget: "datetime" },
        { label: "Draft Status", name: "draft", widget: "boolean", default: false },
        { label: "Description", name: "description", widget: "string" },
        { label: "Body", name: "body", widget: "markdown" }
    ]
};

const gardensCollection = {
    name: "garden-collection",
    label: "Gardens",
    description: "Manage the list of community gardens",
    files: [
        {
            name: "garden-data",
            label: "Our Gardens",
            file: "data/gardens.yml",
            media_folder: "/assets/images/gardens",
            public_folder: "images/gardens",
            fields: [
                {
                    label: "Gardens",
                    name: "gardens",
                    widget: "list",
                    summary: `${'{{ $L }}'}fields.name${'{{ $R }}'}`, // Escaped
                    fields: [
                        { label: "Garden name", name: "name", widget: "string" },
                        { label: "Description", name: "description", widget: "markdown" },
                        { label: "Garden image", name: "image", widget: "image" },
                        { label: "Google map URL", name: "google_map_url", widget: "string" },
                        { label: "Latitude", name: "lat", widget: "number" },
                        { label: "Longtitude", name: "lng", widget: "number" },
                        { label: "Map pin title", name: "map_title", widget: "string" },
                    ]
                }
            ]
        }
    ]
};

const standardFields = [
    { label: "Title", name: "title", widget: "string" },
    { label: "URL Slug", name: "slug", widget: "string", hint: "The URL part, e.g., 'about-us'" },
    { label: "Layout", name: "layout", widget: "hidden", default: "single" },
    { label: "Publish Date", name: "date", widget: "datetime" },
    { label: "Draft Status", name: "draft", widget: "boolean", default: false },
    { label: "Page Content", name: "body", widget: "markdown" }
];

const pagesCollection = {
    name: 'pages',
    label: 'Pages',
    folder: 'content/pages',
    create: true,
    slug: `${'{{ $L }}'}slug${'{{ $R }}'}`,
    extension: 'md',
    format: 'yaml-frontmatter',
    fields: standardFields
};

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const collections = [eventsCollection, gardensCollection, pagesCollection, menuCollection];

window.CMS.init({
    config: {
        load_config_file: false, 
        local_backend: isLocal,
        backend: {
            name: 'git-gateway',
            repo: 'michaelfraser/edible-loughborough',
            branch: 'main',
            squash_merges: true,
        },
        media_folder: '/assets/images',
        public_folder: 'images',
        publish_mode: 'simple',
        collections: collections
    }
});

if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", (user) => {
        if (!user) {
            window.netlifyIdentity.on("login", () => {
                document.location.href = "/admin/";
            });
        }
    });
    window.netlifyIdentity.on("login", () => {
        document.location.reload();
    });
}

initVersionWatcher(SITE_VERSION);
